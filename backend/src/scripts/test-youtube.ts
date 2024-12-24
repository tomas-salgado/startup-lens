import { getAllVideosDetails } from '../youtube/youtube-channel';
import 'dotenv/config';

const YC_CHANNEL_ID = 'UCcefcZRL2oaA_uBNeo5UOWg';

async function test() {
    try {
        console.log('Fetching videos...');
        const videos = await getAllVideosDetails(YC_CHANNEL_ID);
        
        console.log('\nVideos found:');
        videos.forEach((video, index) => {
            console.log(`${index + 1}. [${video.id}] ${video.snippet.title}`);
        });
        
        console.log(`\nTotal videos: ${videos.length}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
    }
}

test(); 