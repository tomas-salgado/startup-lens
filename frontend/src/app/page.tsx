'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { SendIcon } from './icons';
import ycLogo from './img/yc-logo.png';
import Image from 'next/image';

interface VideoSource {
  videoName: string;
  chapterName: string;
  timestampUrl: string;
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const suggestedPrompts = [
    "How to find a co-founder?",
    "What makes a good MVP?",
    "How to get early users?",
    "Tips for B2B sales?",
    "How to measure startup growth?",
    "Best practices for fundraising?",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get sources');
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
          <div className={styles.promptGrid}>
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setQuestion(prompt)}
                className={styles.promptButton}
              >
                {prompt}
              </button>
            ))}
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
              <div key={index} className={styles.videoContainer}>
                <div className={styles.videoTitle}>
                  <div className={styles.videoName}>{source.videoName}</div>
                  <div className={styles.chapterName}>{source.chapterName}</div>
                </div>
                <iframe
                  width="100%"
                  height="315"
                  src={source.timestampUrl}
                  title={`${source.videoName} - ${source.chapterName}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
