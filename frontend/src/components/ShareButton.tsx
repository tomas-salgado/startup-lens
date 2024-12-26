import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import styles from '../app/page.module.css';
import { ShareIcon } from '../app/icons';

interface VideoSource {
  videoName: string;
  chapterName: string;
  timestampUrl: string;
}

const COPY_NOTIFICATION_DURATION = 5000;
const isNativeShareSupported = typeof navigator !== 'undefined' && 'share' in navigator;

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

  // Clear copied state when component unmounts
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopyLink = async () => {
    try {
      const shareUrl = createShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!', {
        duration: COPY_NOTIFICATION_DURATION,
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      });
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_NOTIFICATION_DURATION);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Unable to copy link to clipboard');
    }
  };

  const handleNativeShare = async () => {
    try {
      const shareUrl = createShareUrl();
      const shareData = {
        title: `${source.videoName}`,
        text: `Check out "${source.chapterName}" - Startup advice from Y Combinator`,
        url: shareUrl,
      };

      await navigator.share(shareData);
    } catch (err) {
      console.error('Share failed:', err);
      // Only show error and fallback if it wasn't a user cancellation
      if (!(err instanceof Error) || err.name !== 'AbortError') {
        toast.error('Unable to share. Copying link instead...');
        await handleCopyLink();
      }
    } finally {
      setIsOpen(false);
    }
  };

  const handleShareClick = () => {
    if (!isNativeShareSupported) {
      handleCopyLink();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={styles.shareButtonContainer} ref={dropdownRef}>
      <button
        onClick={handleShareClick}
        className={styles.shareButton}
      >
        <ShareIcon />
        {!isNativeShareSupported && copied ? 'Copied!' : 'Share Clip'}
      </button>
      
      {isOpen && isNativeShareSupported && (
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

export default ShareButton; 