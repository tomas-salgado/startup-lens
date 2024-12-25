import { OpenAIService } from './services/openai';
import { PineconeService } from './services/pinecone';
import { CohereService } from './services/cohere';

export class QAService {
    private openai: OpenAIService;
    private pinecone: PineconeService;
    private cohere: CohereService;

    constructor() {
        this.openai = new OpenAIService();
        this.pinecone = new PineconeService();
        this.cohere = new CohereService();
    }

    async initialize() {
        await this.pinecone.initialize();
    }

    async getSources(question: string) {
        // 1. Generate embedding for the question
        const questionEmbedding = await this.openai.generateEmbedding(question);

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

        return rerankedResults.map(result => ({
            videoName: result.videoName,
            chapterName: result.chapterName,
            score: result.score,
            timestampUrl: result.timestampUrl,
            text: result.text
        }));
    }
} 