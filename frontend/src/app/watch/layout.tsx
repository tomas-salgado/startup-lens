import type { Metadata } from "next";

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  // Handle the case where searchParams might be undefined
  if (!props?.searchParams) {
    return {
      title: "Startup Lens",
      description: "Search and learn from Y Combinator's video content",
    };
  }

  // Safely access the search params
  const videoName = props.searchParams.video;
  const chapterName = props.searchParams.chapter;

  // Use default values if params are missing
  const title = typeof videoName === 'string' ? videoName : 'Video';
  const chapter = typeof chapterName === 'string' ? chapterName : 'Chapter';

  return {
    title: `${title} - Startup Lens`,
    description: `Watch "${chapter}" and discover more startup advice from Y Combinator`,
    openGraph: {
      title: `${title} - Startup Lens`,
      description: `Watch "${chapter}" and discover more startup advice from Y Combinator`,
      type: 'video.other',
      url: 'https://startuplens.com',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Startup Lens`,
      description: `Watch "${chapter}" and discover more startup advice from Y Combinator`,
    },
  }
}

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 