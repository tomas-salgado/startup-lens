import { LRUCache } from 'lru-cache';

interface CacheOptions {
    maxSize?: number;  // Maximum number of items to store
    maxAge?: number;   // Maximum age in milliseconds
}

export class CacheService {
    private cache: LRUCache<string, any>;

    constructor(options: CacheOptions = {}) {
        this.cache = new LRUCache({
            max: options.maxSize || 500, // Default: 500 items
            ttl: options.maxAge || 1000 * 60 * 60, // Default: 1 hour
        });
    }

    get<T>(key: string): T | undefined {
        return this.cache.get(key) as T | undefined;
    }

    set(key: string, value: any): void {
        this.cache.set(key, value);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    // Get cache stats
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.cache.max,
        };
    }
} 