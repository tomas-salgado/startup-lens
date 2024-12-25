import { OpenAIService } from './openai';
import { PineconeService } from './pinecone';
import { CohereService } from './cohere';
import { CacheService } from './cache';
import { VideoSearchResult } from './pinecone';

export class SearchService {
    private openai: OpenAIService;
    private pinecone: PineconeService;
    private cohere: CohereService;
    private cache: CacheService;

    constructor() {
        this.openai = new OpenAIService();
        this.pinecone = new PineconeService();
        this.cohere = new CohereService();
        this.cache = new CacheService({
            maxSize: 1000, 
            maxAge: 1000 * 60 * 60 * 24 * 365  // Cache for 1 year
        });
    }

    async initialize() {
        await this.pinecone.initialize();
    }

    private getCacheKey(prefix: string, value: string): string {
        return `${prefix}:${value}`;
    }

    async search(question: string): Promise<VideoSearchResult[]> {
        const cacheKey = this.getCacheKey('sources', question);
        const cachedResults = this.cache.get<VideoSearchResult[]>(cacheKey);
        if (cachedResults) {
            console.log('Cache hit for sources:', question);
            return cachedResults;
        }

        console.log('Cache miss for sources:', question);

        // 1. Generate embedding for the question
        const embeddingCacheKey = this.getCacheKey('embedding', question);
        let questionEmbedding = this.cache.get<number[]>(embeddingCacheKey);

        if (!questionEmbedding) {
            console.log('Cache miss for embedding:', question);
            questionEmbedding = await this.openai.generateEmbedding(question);
            this.cache.set(embeddingCacheKey, questionEmbedding);
        } else {
            console.log('Cache hit for embedding:', question);
        }

        // 2. Search Pinecone for similar content
        const searchResults = await this.pinecone.searchSimilar(questionEmbedding);
        
        // 3. Rerank results using Cohere
        const rerankedResults = await this.cohere.rerankResults(question, searchResults);
        
        // Log position and score changes
        console.log('\n=== Reranking Changes ===');
        rerankedResults.forEach((rerankedResult, newIndex) => {
            const oldIndex = searchResults.findIndex(r => r.text === rerankedResult.text);
            const oldScore = searchResults[oldIndex].score;
            console.log(`[${oldIndex + 1} → ${newIndex + 1}] Vector: ${oldScore.toFixed(3)} → Rerank: ${rerankedResult.score.toFixed(3)}`);
        });

        // Cache the final results
        this.cache.set(cacheKey, rerankedResults);

        return rerankedResults;
    }
} 