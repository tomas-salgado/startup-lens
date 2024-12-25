'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import styles from '../page.module.css';
import Logo from '../../../components/Logo';
import Link from 'next/link';
import { ShareIcon } from '../icons';
import toast from 'react-hot-toast';

function ShareButton({ videoId, timestamp, title, chapter }: { videoId: string, timestamp: string, title: string, chapter: string }) {
  const [copied, setCopied] = useState(false);

  const createShareUrl = () => {
    const shortTitle = encodeURIComponent(title.slice(0, 50));
    const shortChapter = encodeURIComponent(chapter.slice(0, 50));
    return `${window.location.origin}/watch?v=${videoId}&t=${timestamp}&title=${shortTitle}&c=${shortChapter}`;
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = createShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  return (
    <button
      onClick={handleCopyLink}
      className={styles.shareButton}
    >
      <ShareIcon />
      {copied ? 'Copied!' : 'Share Clip'}
    </button>
  );
}

function WatchContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v');
  const timestamp = searchParams.get('t') || '0';
  const title = searchParams.get('title') || 'YC Startup Advice';
  const chapter = searchParams.get('c') || 'Watch Video';

  useEffect(() => {
    console.log('[PAGE_VIEW] Watch page loaded', { videoId, timestamp, title, chapter });
  }, [videoId, timestamp, title, chapter]);

  // If no video ID, show error
  if (!videoId) {
    return (
      <main className={styles.main}>
        <div className={styles.background} />
        <div className={styles.container}>
          <header className={styles.header}>
            <Link href="/" className={styles.iconWrapper}>
              <Logo width={40} height={40} color="#FF6B3D" />
            </Link>
            <h1 className={styles.title}>Startup Lens</h1>
          </header>
          
          <div className={styles.error}>
            Video not found. Please try searching for another video.
          </div>

          <Link href="/" className={styles.backButton}>
            Go back to search
          </Link>
        </div>
      </main>
    );
  }

  const videoUrl = `https://www.youtube.com/embed/${videoId}?start=${timestamp}`;

  return (
    <main className={styles.main}>
      <div className={styles.background} />
      <div className={styles.container}>
        <header className={`${styles.header} ${styles.watchHeader}`}>
          <Link href="/" className={styles.iconWrapper}>
            <Logo width={40} height={40} color="#FF6B3D" />
          </Link>
          <h1 className={styles.title}>Startup Lens</h1>
          <p className={styles.subtitle}>
            AI-powered search through Y Combinator&apos;s startup knowledge
          </p>
        </header>

        <div className={styles.sourceVideos}>
          <div className={styles.videoContainer}>
            <div className={styles.videoTitle}>
              <div className={styles.videoName}>{decodeURIComponent(title)}</div>
              <div className={styles.titleRow}>
                <div className={styles.chapterName}>{decodeURIComponent(chapter)}</div>
                <ShareButton videoId={videoId} timestamp={timestamp} title={title} chapter={chapter} />
              </div>
            </div>
            <iframe
              width="100%"
              height="315"
              src={videoUrl}
              title="YC Startup Advice"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>

        <Link href="/" className={styles.backButton}>
          Search for more startup advice →
        </Link>
      </div>
      <div className={styles.disclaimer}>
        This is an unofficial tool not affiliated with Y Combinator. Y Combinator is a trademark of Y Combinator Management, LLC.
      </div>
    </main>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WatchContent />
    </Suspense>
  );
} 