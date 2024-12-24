import { getAllVideoIds } from '../youtube/youtube-channel';
import { processVideo } from './process-video';
import 'dotenv/config';

const YC_CHANNEL_ID = 'UCcefcZRL2oaA_uBNeo5UOWg';

async function processAllVideos() {
    try {
        // Get all video IDs
        console.log('Fetching all video IDs from YC channel...');
        const videoIds = await getAllVideoIds(YC_CHANNEL_ID);
        console.log(`Found ${videoIds.length} videos to process`);

        // Process each video
        for (let i = 0; i < videoIds.length; i++) {
            const videoId = videoIds[i];
            const progress = `[${i + 1}/${videoIds.length}]`;
            
            console.log(`\n${progress} Processing video: ${videoId}`);
            try {
                await processVideo(videoId);
                console.log(`${progress} ✓ Successfully processed video`);
                
                // Add delay between videos to respect rate limits
                if (i < videoIds.length - 1) {
                    console.log('Waiting 2 seconds before next video...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error(`${progress} ✗ Error processing video:`, 
                    error instanceof Error ? error.message : 'Unknown error');
                continue;
            }
        }

        console.log('\nAll videos processed successfully!');
    } catch (error) {
        console.error('Failed to process videos:', 
            error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

processAllVideos(); 