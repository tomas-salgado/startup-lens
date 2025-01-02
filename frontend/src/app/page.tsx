'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { SendIcon } from './icons';
import Logo from '../../components/Logo';
import Disclaimer from '../components/Disclaimer';
import ShareButton from '../components/ShareButton';
import QuestionPillars from '../components/QuestionPillars';
import EmailPrompt from '../components/EmailPrompt';

interface VideoSource {
  videoName: string;
  chapterName: string;
  timestampUrl: string;
  relevantQuestions?: string[];
}

interface SearchContentProps {
  onSearchComplete: () => void;
}

// Create a new client component for the search functionality
function SearchContent({ onSearchComplete }: SearchContentProps) {
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

    // Increment search count through parent component
    onSearchComplete();

    try {
      // Track search if user is subscribed (stored in localStorage)
      const subscribedEmail = localStorage.getItem('subscribedEmail');
      if (subscribedEmail) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/track-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: subscribedEmail }),
          });
        } catch (err) {
          console.error('Failed to track search:', err);
          // Don't block the search if tracking fails
        }
      }

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
  }, [question, router, onSearchComplete]);

  // Load initial search results if query parameter exists
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuestion(initialQuery);
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(syntheticEvent);
      // Count this as a search too
      onSearchComplete();
    }
  }, []);

  const handleQuestionClick = (question: string) => {
    setQuestion(question);
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(syntheticEvent);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.iconWrapper}>
          <Logo width={40} height={40} color="#FF6B3D" />
        </div>
        <h1 className={styles.title}>Startup Lens</h1>
        <p className={styles.subtitle}>
          AI-powered video search through Y Combinator&apos;s startup knowledge
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
            <span className={styles.searchQueryText}>{sources.length} {sources.length === 1 ? 'Result' : 'Results'} for</span>
            &ldquo;{searchParams.get('q')}&rdquo;
          </div>
          {sources.map((source, index) => (
            <div 
              key={`video-${index}`}
              className={styles.videoContainer}
            >
              <div className={styles.videoContent}>
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
              {source.relevantQuestions && source.relevantQuestions.length > 0 && (
                <QuestionPillars
                  selectedVideoIndex={index}
                  questions={source.relevantQuestions}
                  onQuestionClick={handleQuestionClick}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// Update the main Home component
export default function Home() {
  const [searchCount, setSearchCount] = useState(0);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailPromptDismissed, setEmailPromptDismissed] = useState(false);
  const [emailSubscribeLoading, setEmailSubscribeLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Initialize state from localStorage
  useEffect(() => {
    const storedSearchCount = localStorage.getItem('searchCount');
    const storedEmailDismissed = localStorage.getItem('emailPromptDismissed');
    
    if (storedSearchCount) {
      setSearchCount(parseInt(storedSearchCount));
    }
    if (storedEmailDismissed === 'true') {
      setEmailPromptDismissed(true);
    }
  }, []);

  // Update showEmailPrompt based on searchCount
  useEffect(() => {
    console.log('Current search count:', searchCount);
    if (searchCount >= 3 && !emailPromptDismissed) {
      setShowEmailPrompt(true);
    }
  }, [searchCount, emailPromptDismissed]);

  const handleEmailSubscribe = async (email: string) => {
    setEmailSubscribeLoading(true);
    setEmailError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }
      
      // Store email in localStorage for tracking searches
      localStorage.setItem('subscribedEmail', email);
      
      setEmailPromptDismissed(true);
      setShowEmailPrompt(false);
      localStorage.setItem('emailPromptDismissed', 'true');
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.');
    } finally {
      setEmailSubscribeLoading(false);
    }
  };

  const handleEmailDismiss = () => {
    setShowEmailPrompt(false);
    setEmailPromptDismissed(true);
    localStorage.setItem('emailPromptDismissed', 'true');
  };

  return (
    <main className={styles.main}>
      <div className={styles.background} />
      <div className={styles.container}>
        <Suspense fallback={<div>Loading...</div>}>
          <SearchContent onSearchComplete={() => setSearchCount(prev => {
            const newCount = prev + 1;
            localStorage.setItem('searchCount', newCount.toString());
            return newCount;
          })} />
        </Suspense>
      </div>
      {showEmailPrompt && (
        <EmailPrompt
          onSubscribe={handleEmailSubscribe}
          onDismiss={handleEmailDismiss}
          isLoading={emailSubscribeLoading}
          error={emailError}
        />
      )}
      <Disclaimer />
    </main>
  );
}
