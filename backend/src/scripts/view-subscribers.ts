import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

async function viewSubscribers() {
    const { data: subscribers, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

    if (error) {
        console.error('Error fetching subscribers:', error);
        return;
    }

    console.log('\nSubscribers:', subscribers.length);
    console.log('----------------------------------------');

    subscribers.forEach((sub: any) => {
        console.log(`
Email: ${sub.email}
Searches: ${sub.search_count}
Subscribed: ${new Date(sub.subscribed_at).toLocaleString()}
Last Search: ${sub.last_search_at ? new Date(sub.last_search_at).toLocaleString() : 'Never'}
----------------------------------------`);
    });
}

viewSubscribers().catch(console.error); 