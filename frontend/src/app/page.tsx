'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { SendIcon, ShareIcon } from './icons';
import ycLogo from './img/yc-logo.png';
import Image from 'next/image';

interface VideoSource {
  videoName: string;
  chapterName: string;
  timestampUrl: string;
}

// Add ShareButton component at the top level
const ShareButton = ({ source }: { source: VideoSource }) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract video ID and timestamp from YouTube URL
  const getVideoParams = (url: string) => {
    try {
      const urlObj = new URL(url);
      // Handle both embed and watch URLs
      const path = urlObj.pathname;
      let videoId = '';
      let start = '0';

      if (path.includes('/embed/')) {
        // Format: youtube.com/embed/VIDEO_ID
        videoId = path.split('/embed/')[1];
      } else {
        // Format: youtube.com/watch?v=VIDEO_ID
        videoId = urlObj.searchParams.get('v') || '';
      }

      // Get timestamp from either 'start' or 't' parameter
      start = urlObj.searchParams.get('start') || urlObj.searchParams.get('t') || '0';

      console.log('[DEBUG] Extracted video params:', { url, videoId, start });
      return { videoId, start };
    } catch (err) {
      console.error('Failed to parse URL:', err);
      return { videoId: '', start: '0' };
    }
  };

  // Create a shorter share URL
  const createShareUrl = () => {
    const { videoId, start } = getVideoParams(source.timestampUrl);
    // Include a short version of the title for context
    const shortTitle = encodeURIComponent(source.videoName.slice(0, 50));
    const shortChapter = encodeURIComponent(source.chapterName.slice(0, 50));
    return `${window.location.origin}/watch?v=${videoId}&t=${start}&title=${shortTitle}&c=${shortChapter}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = async () => {
    try {
      const shareUrl = createShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const shareUrl = createShareUrl();
        await navigator.share({
          title: "Startup Lens: " + source.videoName,
          text: `"${source.chapterName}" - YC startup advice`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.shareButtonContainer} ref={dropdownRef}>
      <button
        onClick={() => {
          // If native sharing is not available, copy directly
          if (!('share' in navigator)) {
            handleCopyLink();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={styles.shareButton}
      >
        <ShareIcon />
        {!('share' in navigator) && copied ? 'Copied!' : 'Share Clip'}
      </button>
      
      {isOpen && 'share' in navigator && (
        <div className={styles.shareDropdown}>
          <button onClick={handleCopyLink} className={styles.shareOption}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button onClick={handleNativeShare} className={styles.shareOption}>
            Share...
          </button>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [question, setQuestion] = useState('');
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const allPrompts = [
    [
      "Best YC interview tips",
      "How to find a co-founder?",
      "Should I build a startup in college?",
      "How to validate ideas fast?",
      "How do you balance work and life?",
    ],
    [
      "Tell me about AirBnB's early days",
      "How do I come up with startup ideas?",
      "Remote team tips",
      "Should I build an AI startup?",
      "Explain the different funding rounds",
    ]
  ];

  useEffect(() => {
    console.log('[PAGE_VIEW] Home page loaded');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    console.log(`[SEARCH] Query: "${question}"`);
    
    setLoading(true);
    setError('');
    setSources([]);
    setHasSearched(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      
      console.log(`[RESULTS] Found ${data.length} videos for query: "${question}"`);
      
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get sources');
      console.error(`[ERROR] Search failed for query: "${question}"`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.background} />
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.iconWrapper}>
            <Image 
              src={ycLogo.src} 
              alt="Y Combinator Logo" 
              className={styles.logo}
              width={56}
              height={56}
              priority
            />
          </div>
          <h1 className={styles.title}>Startup Lens</h1>
          <p className={styles.subtitle}>
            AI-powered search through Y Combinator&apos;s startup knowledge
          </p>
        </header>

        <section className={styles.promptSection}>
          <div className={styles.carouselContainer}>
            <div className={styles.carousel}>
              {/* First row */}
              <div className={styles.carouselRow}>
                {[...allPrompts[0], ...allPrompts[0]].map((prompt, index) => (
                  <button
                    key={`row1-${index}`}
                    onClick={() => {
                      console.log(`[PROMPT_CLICK] User clicked example: "${prompt}"`);
                      setQuestion(prompt);
                    }}
                    className={styles.promptButton}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              {/* Second row */}
              <div className={styles.carouselRow}>
                {[...allPrompts[1], ...allPrompts[1]].map((prompt, index) => (
                  <button
                    key={`row2-${index}`}
                    onClick={() => setQuestion(prompt)}
                    className={styles.promptButton}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <div className={styles.inputWrapper}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className={styles.input}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className={styles.sendButton}
            >
              <SendIcon />
            </button>
          </div>
        </form>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {!loading && !error && hasSearched && sources.length === 0 && (
          <div className={styles.noResults}>
            No relevant video clips found.
          </div>
        )}

        {sources.length > 0 && (
          <div className={styles.sourceVideos}>
            {sources.map((source, index) => (
              <div 
                key={index} 
                className={styles.videoContainer}
                onClick={() => console.log(`[VIDEO_INTERACTION] User interacted with: "${source.videoName}" - ${source.chapterName}`)}
                onLoad={() => console.log(`[VIDEO_LOAD] Loaded video: "${source.videoName}" - ${source.chapterName}`)}
              >
                <div className={styles.videoTitle}>
                  <div className={styles.videoName}>{source.videoName}</div>
                  <div className={styles.titleRow}>
                    <div className={styles.chapterName}>{source.chapterName}</div>
                    <ShareButton source={source} />
                  </div>
                </div>
                <iframe
                  width="100%"
                  height="315"
                  src={source.timestampUrl}
                  title={`${source.videoName} - ${source.chapterName}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  allowFullScreen
                  loading="lazy"
                  onClick={() => console.log(`[VIDEO_CLICK] User clicked video: "${source.videoName}" - ${source.chapterName}`)}
                  onPlay={() => console.log(`[VIDEO_PLAY] User started playing: "${source.videoName}" - ${source.chapterName}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.disclaimer}>
        This is an unofficial tool not affiliated with Y Combinator. Y Combinator is a trademark of Y Combinator Management, LLC.
      </div>
    </main>
  );
}
