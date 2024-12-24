'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import styles from '../page.module.css';
import Image from 'next/image';
import ycLogo from '../img/yc-logo.png';
import Link from 'next/link';

export default function WatchPage() {
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
              <Image 
                src={ycLogo.src} 
                alt="Y Combinator Logo" 
                className={styles.logo}
                width={56}
                height={56}
                priority
              />
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
            <Image 
              src={ycLogo.src} 
              alt="Y Combinator Logo" 
              className={styles.logo}
              width={56}
              height={56}
              priority
            />
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
          Search more startup advice →
        </Link>
      </div>
      <div className={styles.disclaimer}>
        This is an unofficial tool not affiliated with Y Combinator. Y Combinator is a trademark of Y Combinator Management, LLC.
      </div>
    </main>
  );
} 