import Database from 'better-sqlite3';
import path from 'path';

// Connect to the database
const dbPath = path.join(__dirname, '../../data/subscriptions.db');
const db = new Database(dbPath);

// Get all subscribers
const subscribers = db.prepare(`
    SELECT 
        email,
        search_count,
        datetime(subscribed_at, 'localtime') as subscribed_at,
        datetime(last_search_at, 'localtime') as last_search_at
    FROM subscribers
    ORDER BY subscribed_at DESC
`).all();

console.log('\nSubscribers:', subscribers.length);
console.log('----------------------------------------');

subscribers.forEach((sub: any) => {
    console.log(`
Email: ${sub.email}
Searches: ${sub.search_count}
Subscribed: ${sub.subscribed_at}
Last Search: ${sub.last_search_at}
----------------------------------------`);
});

// Close the database connection
db.close(); 