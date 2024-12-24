import { OpenAIService } from './services/openai';
import { PineconeService } from './services/pinecone';
import { ClaudeService } from './services/claude';

export class QAService {
    private openai: OpenAIService;
    private pinecone: PineconeService;
    private claude: ClaudeService;

    constructor() {
        this.openai = new OpenAIService();
        this.pinecone = new PineconeService();
        this.claude = new ClaudeService();
    }

    async initialize() {
        await this.pinecone.initialize();
    }

    async getSources(question: string) {
        // 1. Generate embedding for the question
        const questionEmbedding = await this.openai.generateEmbedding(question);

        // 2. Search Pinecone for similar content
        const searchResults = await this.pinecone.searchSimilar(questionEmbedding);

        return searchResults.map(result => ({
            videoName: result.videoName,
            chapterName: result.chapterName,
            score: result.score,
            timestampUrl: result.timestampUrl,
            text: result.text
        }));
    }

    async getLLMResponse(question: string, sources: any[]) {
        // Format sources for Claude
        const formattedSources = sources.map(source => ({
            videoName: source.videoName,
            chapterName: source.chapterName,
            text: source.text,
            timestampUrl: source.timestampUrl
        }));

        // Get answer from Claude using the sources
        const answer = await this.claude.answerQuestion(question, formattedSources);

        return {
            answer,
            sources: sources.map(source => ({
                videoName: source.videoName,
                chapterName: source.chapterName,
                score: source.score,
                timestampUrl: source.timestampUrl
            }))
        };
    }
} 