import axios, { AxiosResponse } from 'axios';
import 'dotenv/config';

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not set in environment variables');
}

// Instead of username, let's use channel ID directly since we know it
const YC_CHANNEL_ID = 'UCcefcZRL2oaA_uBNeo5UOWg';

interface ChannelResponse {
    items: {
        id: string;
        snippet: {
            title: string;
            description: string;
        };
    }[];
}

async function getChannelId(username: string): Promise<string> {
    try {
        const response: AxiosResponse<ChannelResponse> = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                key: API_KEY,
                forUsername: username,
                part: 'id,snippet'
            }
        });

        if (!response.data.items?.length) {
            throw new Error('Channel not found');
        }

        return response.data.items[0].id;
    } catch (error) {
        console.error('Error fetching channel ID:', error);
        throw error;
    }
}

interface VideoItem {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        description: string;
        publishedAt: string;
    };
}

interface VideoDetailsResponse {
    items: {
        id: string;
        snippet: {
            title: string;
            description: string;
            publishedAt: string;
        };
        contentDetails: {
            duration: string;
        };
        statistics: {
            viewCount: string;
            likeCount: string;
        };
    }[];
}

interface YouTubeSearchResponse {
    items: VideoItem[];
    nextPageToken?: string;
}

async function getAllVideoIds(channelId: string): Promise<string[]> {
    let videoIds: string[] = [];
    let nextPageToken: string | undefined = undefined;
    
    try {
        do {
            const response: AxiosResponse<YouTubeSearchResponse> = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    key: API_KEY,
                    channelId,
                    part: 'snippet',
                    order: 'date',
                    maxResults: 50,
                    pageToken: nextPageToken,
                    type: 'video'
                }
            });

            const items = response.data.items;
            const ids = items.map(item => item.id.videoId);
            videoIds = [...videoIds, ...ids];
            
            nextPageToken = response.data.nextPageToken;
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } while (nextPageToken);

        return videoIds;
    } catch (error) {
        console.error('Error fetching videos:', error);
        throw error;
    }
}

async function getAllVideosDetails(channelId: string) {
    const videoIds = await getAllVideoIds(channelId);
    const videos: VideoDetailsResponse['items'] = [];
    
    for (let i = 0; i < videoIds.length; i += 50) {
        const chunk = videoIds.slice(i, i + 50);
        const response: AxiosResponse<VideoDetailsResponse> = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                key: API_KEY,
                id: chunk.join(','),
                part: 'snippet,contentDetails,statistics'
            }
        });
        videos.push(...response.data.items);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return videos;
}

export { getChannelId, getAllVideoIds, getAllVideosDetails };
