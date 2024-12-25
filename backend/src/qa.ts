import { SearchService } from './services/search';

export class QAService {
    private search: SearchService;

    constructor() {
        this.search = new SearchService();
    }

    async initialize() {
        await this.search.initialize();
    }

    async getSources(question: string) {
        const results = await this.search.search(question);
        
        return results.map(result => ({
            videoName: result.videoName,
            chapterName: result.chapterName,
            score: result.score,
            timestampUrl: result.timestampUrl,
            text: result.text
        }));
    }
} 