import { Pinecone } from '@pinecone-database/pinecone';

interface VideoEmbedding {
    id: string;
    values: number[];
    metadata: {
        videoName: string;
        chapterName: string;
        offset: number;
        text: string;
        startTime: string;
        endTime: string;
        duration: number;
        timestampUrl: string;
    };
}

interface VideoSearchResult {
    score: number;
    videoName: string;
    chapterName: string;
    text: string;
    startTime: string;
    endTime: string;
    timestampUrl: string;
}

export class PineconeService {
    private client: Pinecone;
    private index: any;

    constructor() {
        this.client = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
    }

    async initialize() {
        try {
            console.log('Initializing Pinecone index...');
            this.index = this.client.index('yc-search-engine');
            
            console.log('PineconeService initialized successfully');
        } catch (error: any) {
            console.error('Pinecone initialization error:', {
                message: error.message,
                cause: error.cause?.message,
                code: error.cause?.code,
                stack: error.stack
            });
            throw error;
        }
    }

    async storeEmbedding(embedding: VideoEmbedding): Promise<void> {
        if (!this.index) {
            throw new Error('Pinecone index not initialized. Call initialize() first.');
        }
        
        await this.index.upsert([{
            id: embedding.id,
            values: embedding.values,
            metadata: embedding.metadata
        }]);
    }

    async searchSimilar(embedding: number[]): Promise<VideoSearchResult[]> {
        const results = await this.index.query({
            vector: embedding,
            topK: 6,
            includeMetadata: true
        });
        
        // Filter by threshold
        const SIMILARITY_THRESHOLD = 0.8;

        return results.matches
            .filter((match: any) => match.score >= SIMILARITY_THRESHOLD)
            .map((match: any) => ({
                score: match.score,
                videoName: match.metadata.videoName,
                chapterName: match.metadata.chapterName,
                text: match.metadata.text,
                startTime: match.metadata.startTime,
                endTime: match.metadata.endTime,
                timestampUrl: match.metadata.timestampUrl
            }));
    }
} 