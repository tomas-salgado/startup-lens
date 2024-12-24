import { YoutubeTranscript } from '../youtube/transcript';
import youtubeChaptersGetter from '../youtube/chapters';
import { groupTranscriptByChapters } from '../youtube/transcript-grouper';
import type { TranscriptSegment } from '../youtube/transcript-grouper';
import { OpenAIService } from '../services/openai';
import { PineconeService } from '../services/pinecone';
import 'dotenv/config';

export async function processVideo(videoId: string) {
    try {
        // Initialize services
        console.log('Initializing services...');
        const openai = new OpenAIService();
        const pinecone = new PineconeService();
        await pinecone.initialize();

        // Fetch both transcript and chapters
        console.log('Fetching transcript...');
        const { title, transcript } = await YoutubeTranscript.fetchTranscript(videoId);
        
        console.log('Fetching chapters...');
        const chapters = await youtubeChaptersGetter.getChapter(videoId);
        
        // Group transcript by chapters
        console.log('\nGrouping transcript by chapters...');
        const groupedContent = groupTranscriptByChapters(
            transcript as TranscriptSegment[], 
            chapters
        );
        
        // Process each chapter
        console.log('\nProcessing chapters and creating embeddings...');
        for (let i = 0; i < groupedContent.length; i++) {
            const chapter = groupedContent[i];
            const progress = `[${i + 1}/${groupedContent.length}]`;
            
            console.log(`\n${progress} Processing: ${chapter.title}`);
            
            try {
                // Generate embedding
                const embedding = await openai.generateEmbedding(chapter.content);
                console.log(`${progress} Generated embedding (${embedding.length} dimensions)`);
                
                const startSeconds = timeToSeconds(chapter.startTime);
                const endSeconds = chapter.endTime === 'end' 
                    ? startSeconds + 300 // assume 5 minutes for last chapter if no end time
                    : timeToSeconds(chapter.endTime);
                
                // Store in Pinecone
                await pinecone.storeEmbedding({
                    id: `${videoId}-chapter${i + 1}`,
                    values: embedding,
                    metadata: {
                        videoName: title,
                        chapterName: chapter.title,
                        offset: startSeconds,
                        text: chapter.content,
                        startTime: chapter.startTime,
                        endTime: chapter.endTime === 'end' ? `${Math.floor((startSeconds + 300) / 60)}:${((startSeconds + 300) % 60).toString().padStart(2, '0')}` : chapter.endTime,
                        duration: endSeconds - startSeconds,
                        timestampUrl: `https://youtube.com/embed/${videoId}?start=${startSeconds}&end=${endSeconds}&autoplay=1`
                    }
                });
                console.log(`${progress} ✓ Stored in Pinecone`);

                // Print chapter content
                console.log(`\n== ${chapter.title} (${chapter.startTime} - ${chapter.endTime}) ==`);
                console.log(chapter.content);
                
                // Rate limiting delay
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error(`${progress} ✗ Error processing chapter:`, 
                    error instanceof Error ? error.message : 'Unknown error');
                continue;
            }
        }
        
        console.log('\nProcessing complete! All chapters embedded and stored.');
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
    }
}

function timeToSeconds(timeStr: string): number {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
}

// Only run directly if this is the main module
if (require.main === module) {
    const videoId = process.argv[2] || 'IdwYMfM2QMs';
    processVideo(videoId);
} 