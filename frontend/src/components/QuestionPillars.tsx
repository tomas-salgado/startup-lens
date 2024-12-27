'use client';

import styles from './QuestionPillars.module.css';

interface QuestionPillarsProps {
  selectedVideoIndex: number | null;
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export default function QuestionPillars({ 
  selectedVideoIndex, 
  questions, 
  onQuestionClick 
}: QuestionPillarsProps) {
  if (selectedVideoIndex === null || !questions || questions.length === 0) {
    return null;
  }

  return (
    <div className={styles.pillarsContainer}>
      {questions.slice(0, 3).map((question, index) => (
        <button
          key={index}
          className={styles.pillar}
          onClick={() => onQuestionClick(question)}
        >
          {question}
        </button>
      ))}
    </div>
  );
} 