interface Chapter {
    title: string;
    time: string;
    url: string;
}

interface ChapterContent {
    title: string;
    startTime: string;
    endTime: string;
    content: string;
}

interface TranscriptSegment {
    text: string;
    duration: number;
    offset: number;
}

function timeToSeconds(timeStr: string): number {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
}

export function groupTranscriptByChapters(
    transcript: TranscriptSegment[],
    chapters: Chapter[]
): ChapterContent[] {
    // Sort chapters by time
    const sortedChapters = [...chapters].sort((a, b) => 
        timeToSeconds(a.time) - timeToSeconds(b.time)
    );

    return sortedChapters.map((chapter, index) => {
        const startSeconds = timeToSeconds(chapter.time);
        const endSeconds = index < sortedChapters.length - 1 
            ? timeToSeconds(sortedChapters[index + 1].time)
            : Infinity;

        // Get segments that belong to this chapter
        const chapterSegments = transcript.filter(segment => {
            const segmentStart = segment.offset;
            return segmentStart >= startSeconds && segmentStart < endSeconds;
        });

        // Sort segments by time and combine their text
        const content = chapterSegments
            .sort((a, b) => a.offset - b.offset)
            .map(segment => segment.text)
            .join(' ');

        return {
            title: chapter.title,
            startTime: chapter.time,
            endTime: index < sortedChapters.length - 1 ? sortedChapters[index + 1].time : 'end',
            content
        };
    });
}

export type { Chapter, ChapterContent, TranscriptSegment }; 