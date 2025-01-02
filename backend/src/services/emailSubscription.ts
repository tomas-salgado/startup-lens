import Database from 'better-sqlite3';
import validator from 'validator';
import path from 'path';
import fs from 'fs';

export class EmailSubscriptionService {
    private db: Database.Database;

    constructor() {
        // Create/connect to SQLite database in the data directory
        const dbPath = path.join(__dirname, '../../data/subscriptions.db');
        
        // Ensure the directory exists
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        this.db = new Database(dbPath);
        this.initializeDatabase();
    }

    private initializeDatabase() {
        // Create the subscribers table if it doesn't exist
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS subscribers (
                email TEXT PRIMARY KEY,
                search_count INTEGER DEFAULT 0,
                subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_search_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    async addSubscriber(email: string): Promise<boolean> {
        if (!validator.isEmail(email)) {
            throw new Error('Invalid email address');
        }

        try {
            const stmt = this.db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)');
            const result = stmt.run(email.toLowerCase());
            return result.changes > 0;
        } catch (error) {
            console.error('Error adding subscriber:', error);
            throw error;
        }
    }

    async updateSearchCount(email: string): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                UPDATE subscribers 
                SET search_count = search_count + 1,
                    last_search_at = CURRENT_TIMESTAMP
                WHERE email = ?
            `);
            stmt.run(email.toLowerCase());
        } catch (error) {
            console.error('Error updating search count:', error);
            throw error;
        }
    }

    async isSubscribed(email: string): Promise<boolean> {
        try {
            const stmt = this.db.prepare('SELECT email FROM subscribers WHERE email = ?');
            const result = stmt.get(email.toLowerCase());
            return !!result;
        } catch (error) {
            console.error('Error checking subscription:', error);
            throw error;
        }
    }
}

export default new EmailSubscriptionService(); 