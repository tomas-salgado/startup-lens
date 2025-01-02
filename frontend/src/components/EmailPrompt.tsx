import { useState } from 'react';
import styles from './EmailPrompt.module.css';

interface EmailPromptProps {
    onSubscribe: (email: string) => Promise<void>;
    onDismiss: () => void;
    isLoading: boolean;
    error: string | null;
}

export default function EmailPrompt({ onSubscribe, onDismiss, isLoading, error }: EmailPromptProps) {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            await onSubscribe(email);
        }
    };

    return (
        <div className={styles.promptContainer}>
            <div className={styles.promptContent}>
                <button onClick={onDismiss} className={styles.closeButton}>×</button>
                <h3 className={styles.title}>Stay Ahead</h3>
                <p className={styles.description}>
                    Get updated as Startup Lens expands - helping you find the startup advice you need, faster.
                </p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={styles.input}
                        required
                    />
                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </form>
                {error && <p className={styles.error}>{error}</p>}
                <p className={styles.disclaimer}>
                    No spam, unsubscribe anytime.
                </p>
            </div>
        </div>
    );
} 