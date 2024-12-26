import styles from '../app/page.module.css';

export default function Disclaimer() {
  return (
    <footer className={styles.disclaimer}>
      Built by <a href="https://github.com/tomas-salgado" target="_blank" rel="noopener noreferrer" className={styles.githubLink}>Tomas</a> • 
      Not affiliated with or endorsed by YC
    </footer>
  );
}