import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Startup Lens - Watch',
    description: 'Search and learn from Y Combinator\'s video content',
    openGraph: {
      title: 'Startup Lens - Watch',
      description: 'Search and learn from Y Combinator\'s video content',
      type: 'video.other',
      url: 'https://startuplens.com',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Startup Lens - Watch',
      description: 'Search and learn from Y Combinator\'s video content',
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