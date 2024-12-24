'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import styles from '../page.module.css';
import Image from 'next/image';
import ycLogo from '../img/yc-logo.png';
import Link from 'next/link';

export default function WatchPage() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get('url');
  const videoName = searchParams.get('video') || 'Video';
  const chapterName = searchParams.get('chapter') || 'Chapter';

  useEffect(() => {
    console.log('[PAGE_VIEW] Watch page loaded', { videoUrl, videoName, chapterName });
  }, [videoUrl, videoName, chapterName]);

  // If no video URL, show error
  if (!videoUrl) {
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
              <div className={styles.videoName}>{videoName}</div>
              <div className={styles.titleRow}>
                <div className={styles.chapterName}>{chapterName}</div>
              </div>
            </div>
            <iframe
              width="100%"
              height="315"
              src={videoUrl}
              title={`${videoName} - ${chapterName}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
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