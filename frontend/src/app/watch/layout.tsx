import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Startup Lens',
    description: 'AI-powered search through Y Combinator\'s startup knowledge',
    openGraph: {
      title: 'Startup Lens',
      description: 'AI-powered search through Y Combinator\'s startup knowledge',
      type: 'video.other',
      url: 'https://startuplens.app',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Startup Lens',
      description: 'AI-powered search through Y Combinator\'s startup knowledge',
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