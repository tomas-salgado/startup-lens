import { CohereClient } from 'cohere-ai';
import { VideoSearchResult } from './pinecone';

export class CohereService {
    private client: CohereClient;
    private static readonly RELEVANCE_THRESHOLD = 0.3;

    constructor() {
        this.client = new CohereClient({
            token: process.env.COHERE_API_KEY!,
        });
    }

    async rerankResults(query: string, results: VideoSearchResult[]): Promise<VideoSearchResult[]> {
        if (results.length === 0) {
            return results;
        }

        const documents = results.map(result => result.text);
        
        const rerankedResults = await this.client.rerank({
            model: 'rerank-v3.5',
            query: query,
            documents: documents,
            topN: 6
        });

        // Map the reranked results back to VideoSearchResult objects and filter by threshold
        return rerankedResults.results
            .filter(result => result.relevanceScore >= CohereService.RELEVANCE_THRESHOLD)
            .map(rerankedResult => {
                const originalResult = results[rerankedResult.index];
                return {
                    ...originalResult,
                    score: rerankedResult.relevanceScore
                };
            });
    }
} 