// This script adds relevant questions to the Pinecone index metadata for each video transcript chunk.
// It uses Anthropic to generate questions and rate limits its requests to avoid being rate limited.

import { config } from 'dotenv';
config();

import Anthropic from '@anthropic-ai/sdk';
import { Pinecone } from '@pinecone-database/pinecone';
import pLimit from 'p-limit';

// Initialize clients
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

interface VideoMetadata {
    videoName: string;
    chapterName: string;
    offset: number;
    text: string;
    startTime: string;
    endTime: string;
    duration: number;
    timestampUrl: string;
    relevantQuestions?: string[];
}

// Add type guard function after VideoMetadata interface
function isVideoMetadata(metadata: any): metadata is VideoMetadata {
    return (
        typeof metadata.videoName === 'string' &&
        typeof metadata.chapterName === 'string' &&
        typeof metadata.text === 'string'
    );
}

// Add sleep utility function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateQuestionsWithRetry(text: string, retries = 3): Promise<string[]> {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await anthropic.messages.create({
                model: 'claude-3-haiku-20240307',
                max_tokens: 150,
                messages: [{
                    role: 'user',
                    content: `Given this short transcript from a startup advice video, generate 3 concise questions that will find relevant answers in YC's startup video library. The questions should:
1. First question can directly relate to the clip's specific topic
2. Other two questions MUST explore completely different startup challenges
3. Be simple and direct (max 8-10 words)
4. Feel like natural follow-up thoughts after watching the clip
5. Tap into common founder curiosities and challenges
6. Make users want to click and learn more
7. Each question should feel natural as a standalone search
8. Return as JSON array

BAD example (too focused on one theme):
[
    "How do founders calculate burn rate?",
    "What are the biggest fundraising challenges?",
    "How can startups extend their runway?"
]

GOOD example (shows real variety):
[
    "How long should your startup's runway be?",
    "How do you know when to hire first employees?",
    "What makes a great startup idea?"
]

Another GOOD example (different topic, good variety):
[
    "How do you find your first customers?",
    "When should founders raise their seed round?",
    "What makes a strong co-founder relationship?"
]

Transcript:
${text}

Return only a JSON array of 3 questions.`
                }],
            });

            const content = response.content[0].type === 'text' ? response.content[0].text : '';
            try {
                const questions = JSON.parse(content);
                if (Array.isArray(questions) && questions.length >= 3) {
                    return questions.slice(0, 3);
                }
            } catch (e) {
                const questions = content
                    .split('\n')
                    .map((line: string) => line.trim())
                    .filter((line: string) => line.endsWith('?'));
                return questions.slice(0, 3);
            }
        } catch (error: any) {
            if (error?.status === 429) {
                const retryAfter = parseInt(error.headers?.['retry-after'] || '1');
                const waitTime = (retryAfter || 1) * 1000 * (attempt + 1); // Exponential backoff
                console.log(`Rate limited. Waiting ${waitTime/1000}s before retry ${attempt + 1}/${retries}`);
                await sleep(waitTime);
                continue;
            }
            if (attempt === retries - 1) {
                throw error;
            }
        }
    }
    throw new Error('Failed to generate questions after retries');
}

async function processAllVectors() {
    console.log('Starting vector processing...');
    const index = pinecone.index('yc-search-engine');
    const batchSize = 1000;
    let processed = 0;
    let failed = 0;
    
    try {
        while (true) {
            // Query for vectors without relevantQuestions
            const queryResponse = await index.query({
                vector: Array(1536).fill(1),  // Simple unit vector
                topK: batchSize,
                includeMetadata: true,
                includeValues: true,
                filter: {
                    relevantQuestions: { $exists: false }
                }
            });

            if (queryResponse.matches.length === 0) {
                console.log('No more vectors to process');
                break;
            }

            console.log(`Found ${queryResponse.matches.length} vectors without questions`);

            // Process vectors
            for (const match of queryResponse.matches) {
                try {
                    if (!match.metadata || !isVideoMetadata(match.metadata)) continue;
                    
                    // Generate questions
                    const questions = await generateQuestionsWithRetry(match.metadata.text);
                    console.log(`\nProcessing ${match.id}:`);
                    console.log('Questions:', questions);

                    // Update metadata
                    await index.upsert([{
                        id: match.id,
                        values: match.values,
                        metadata: {
                            ...match.metadata,
                            relevantQuestions: questions
                        }
                    }]);

                    processed++;
                    console.log(`Processed ${processed} vectors (${failed} failed)`);
                    
                    // Rate limit our requests
                    await sleep(1250);  // ~48 requests per minute
                } catch (error) {
                    failed++;
                    console.error(`Failed to process vector ${match.id}:`, error);
                }
            }
        }
        
        console.log(`\nComplete: ${processed} processed, ${failed} failed`);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

processAllVectors().catch(console.error);
