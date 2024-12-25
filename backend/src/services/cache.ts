import QuickLRU from 'quick-lru';

interface CacheOptions {
    maxSize?: number;  // Maximum number of items to store
    maxAge?: number;   // Maximum age in milliseconds
}

export class CacheService {
    private cache: QuickLRU<string, any>;
    private maxAge: number;

    constructor(options: CacheOptions = {}) {
        this.maxAge = options.maxAge || 1000 * 60 * 60; // Default: 1 hour
        this.cache = new QuickLRU({
            maxSize: options.maxSize || 500, // Default: 500 items
        });
    }

    private isExpired(timestamp: number): boolean {
        return Date.now() - timestamp > this.maxAge;
    }

    get<T>(key: string): T | undefined {
        const item = this.cache.get(key);
        if (!item) return undefined;

        const { value, timestamp } = item;
        if (this.isExpired(timestamp)) {
            this.cache.delete(key);
            return undefined;
        }

        return value as T;
    }

    set(key: string, value: any): void {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
        });
    }

    has(key: string): boolean {
        const item = this.cache.get(key);
        if (!item) return false;
        
        if (this.isExpired(item.timestamp)) {
            this.cache.delete(key);
            return false;
        }

        return true;
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
            maxSize: this.cache.maxSize,
        };
    }
} 