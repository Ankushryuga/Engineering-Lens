import { Link, useLocation } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { Language, LANGUAGE_LIST, AppSource } from '@/types'
import { useTheme } from '@/hooks/useTheme'

interface SidebarProps {
  source: AppSource
  language: Language
  availableLanguages: string[] | null
  onSourceChange: (s: AppSource) => void
  onLanguageChange: (l: Language) => void
}

export default function Sidebar({ source, language, availableLanguages, onSourceChange, onLanguageChange }: SidebarProps) {
  const loc = useLocation()
  const isApp = loc.pathname === '/app'
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.logo}>
        <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
          <rect x="1" y="1" width="12" height="12" stroke="var(--text-secondary)" strokeWidth="1"/>
          <path d="M4 9L6 5L8 8L10 4" stroke="var(--accent)" strokeWidth="1.2"/>
        </svg>
        algo-visualizer
      </Link>

      {isApp && (
        <>
          <div className={styles.section}>
            <div className={styles.label}>Source</div>
            <button
              className={`${styles.navItem} ${source === 'custom' ? styles.active : ''}`}
              onClick={() => onSourceChange('custom')}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l3 4-3 4M6 10h4" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              Custom code
            </button>
            <button
              className={`${styles.navItem} ${source === 'template' ? styles.active : ''}`}
              onClick={() => onSourceChange('template')}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="2" y="2" width="8" height="2" stroke="currentColor" strokeWidth="1"/>
                <rect x="2" y="6" width="8" height="2" stroke="currentColor" strokeWidth="1"/>
              </svg>
              Algorithm templates
            </button>
          </div>

          <div className={styles.section}>
            <div className={styles.label}>Language</div>
            <select
              className={styles.select}
              value={language}
              onChange={e => onLanguageChange(e.target.value as Language)}
            >
              {LANGUAGE_LIST.map(([key, meta]) => {
                const unavailable = availableLanguages !== null && !availableLanguages.includes(key)
                return (
                  <option key={key} value={key} disabled={unavailable}>
                    {meta.label}{meta.status === 'beta' ? ' (beta)' : ''}{unavailable ? ' — no solution yet' : ''}
                  </option>
                )
              })}
            </select>
            {availableLanguages !== null && availableLanguages.length < LANGUAGE_LIST.length && (
              <div className={styles.langHint}>
                only available in: {availableLanguages.join(', ')}
              </div>
            )}
          </div>
        </>
      )}

      <div className={styles.spacer} />

      <div className={styles.themeToggle}>
        <button
          className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
          onClick={() => theme !== 'dark' && toggleTheme()}
          aria-label="dark theme"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9.5 7.2A4 4 0 015 2.1 4.2 4.2 0 106 10a4.1 4.1 0 003.5-2.8z" fill="currentColor"/>
          </svg>
          Dark
        </button>
        <button
          className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
          onClick={() => theme !== 'light' && toggleTheme()}
          aria-label="light theme"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="2.6" fill="currentColor"/>
            <path d="M6 0.5v1.6M6 9.9v1.6M11.5 6H9.9M2.1 6H.5M9.7 2.3l-1.1 1.1M3.4 8.6l-1.1 1.1M9.7 9.7L8.6 8.6M3.4 3.4L2.3 2.3" stroke="currentColor" strokeWidth="1"/>
          </svg>
          Light
        </button>
      </div>

      <div className={styles.footer}>
        <Link to="/docs" className={styles.footerLink}>Docs</Link>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          GitHub
        </a>
      </div>
    </aside>
  )
}
