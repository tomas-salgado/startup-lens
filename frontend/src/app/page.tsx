'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { SendIcon } from './icons';
import Logo from '../../components/Logo';
import Disclaimer from '../components/Disclaimer';
import ShareButton from '../components/ShareButton';

interface VideoSource {
  videoName: string;
  chapterName: string;
  timestampUrl: string;
}

// Create a new client component for the search functionality
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [question, setQuestion] = useState(searchParams.get('q') || '');
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
      "When to pivot my startup?",
    ],
    [
      "Tell me about AirBnB's early days",
      "How do I come up with startup ideas?",
      "Remote team tips",
      "Should I build an AI startup?",
      "Explain the different funding rounds",
      "Product-market fit",
      "Should I work in big tech before a startup?"
    ]
  ];

  const [shuffledPrompts, setShuffledPrompts] = useState(allPrompts);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle prompts on client-side only
  useEffect(() => {
    setShuffledPrompts([
      shuffleArray(allPrompts[0]),
      shuffleArray(allPrompts[1])
    ]);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
        
    // Update URL with search query
    const newUrl = `${window.location.pathname}?q=${encodeURIComponent(question)}`;
    router.push(newUrl);
    
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
            
      setSources(data);
      setQuestion(''); // Clear the search bar after getting results

      // Scroll to results after they're loaded
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get sources');
      console.error(`[ERROR] Search failed for query: "${question}"`, err);
    } finally {
      setLoading(false);
    }
  }, [question, router]);

  // Load initial search results if query parameter exists
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuestion(initialQuery);
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(syntheticEvent);
    }
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.iconWrapper}>
          <Logo width={40} height={40} color="#FF6B3D" />
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
              {[...shuffledPrompts[0], ...shuffledPrompts[0]].map((prompt, index) => (
                <button
                  key={`row1-${index}`}
                  onClick={() => {
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
              {[...shuffledPrompts[1], ...shuffledPrompts[1]].map((prompt, index) => (
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

      {sources.length > 0 && searchParams.get('q') && (
        <div className={styles.sourceVideos} ref={resultsRef}>
          <div className={styles.searchQuery}>
            <span className={styles.searchQueryText}>Results for</span>
            &ldquo;{searchParams.get('q')}&rdquo;
          </div>
          {sources.map((source, index) => (
            <div 
              key={index} 
              className={styles.videoContainer}
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
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// Update the main Home component
export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.background} />
      <div className={styles.container}>
        <Suspense fallback={<div>Loading...</div>}>
          <SearchContent />
        </Suspense>
      </div>
      <Disclaimer />
    </main>
  );
}
