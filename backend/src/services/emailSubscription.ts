import { createClient, SupabaseClient } from '@supabase/supabase-js';
import validator from 'validator';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(__dirname, '../../.env') });

export class EmailSubscriptionService {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase environment variables');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.initializeDatabase();
    }

    private async initializeDatabase() {
        // The table will be created in Supabase directly
        // This method is kept for potential future initialization needs
    }

    async addSubscriber(email: string): Promise<boolean> {
        if (!validator.isEmail(email)) {
            throw new Error('Invalid email address');
        }

        try {
            const { error, data } = await this.supabase
                .from('subscribers')
                .insert([
                    { 
                        email: email.toLowerCase(),
                        search_count: 0
                    }
                ])
                .select();

            if (error) {
                // Check if it's a unique constraint violation
                if (error.code === '23505') {
                    return false; // Already subscribed
                }
                throw error;
            }
            return !!data;
        } catch (error) {
            console.error('Error adding subscriber:', error);
            throw error;
        }
    }

    async updateSearchCount(email: string): Promise<void> {
        try {
            // Using SQL to increment the counter
            const { error } = await this.supabase
                .from('subscribers')
                .update({ 
                    search_count: "search_count + 1",
                    last_search_at: new Date().toISOString()
                })
                .eq('email', email.toLowerCase());

            if (error) throw error;
        } catch (error) {
            console.error('Error updating search count:', error);
            throw error;
        }
    }

    async isSubscribed(email: string): Promise<boolean> {
        try {
            const { data, error } = await this.supabase
                .from('subscribers')
                .select('email')
                .eq('email', email.toLowerCase())
                .single();

            if (error) throw error;
            return !!data;
        } catch (error) {
            console.error('Error checking subscription:', error);
            throw error;
        }
    }
}

export default new EmailSubscriptionService(); 