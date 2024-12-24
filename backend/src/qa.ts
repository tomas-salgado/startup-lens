import { OpenAIService } from './services/openai';
import { PineconeService } from './services/pinecone';

export class QAService {
    private openai: OpenAIService;
    private pinecone: PineconeService;

    constructor() {
        this.openai = new OpenAIService();
        this.pinecone = new PineconeService();
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
} 