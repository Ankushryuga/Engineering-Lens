import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { Language, LANGUAGE_LIST, AppSource, LANGUAGES } from '@/types'
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
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [loc.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  const chooseSource = (nextSource: AppSource) => {
    onSourceChange(nextSource)
    setMobileOpen(false)
  }

  const chooseLanguage = (nextLanguage: Language) => {
    onLanguageChange(nextLanguage)
    setMobileOpen(false)
  }

  return (
    <>
      <header className={styles.mobileBar}>
        <Link to="/" className={styles.mobileLogo} aria-label="AlgoWeave home">
          <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
            <rect x="1" y="1" width="12" height="12" stroke="var(--text-secondary)" strokeWidth="1"/>
            <path d="M4 9L6 5L8 8L10 4" stroke="var(--accent)" strokeWidth="1.2"/>
          </svg>
          <span>AlgoWeave</span>
        </Link>
        {isApp ? <span className={styles.mobileContext}>{LANGUAGES[language].label}</span> : null}
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMobileOpen(true)}
          aria-label="open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="algoweave-navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <button
        type="button"
        className={`${styles.backdrop} ${mobileOpen ? styles.backdropOpen : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-label="close navigation menu"
        tabIndex={mobileOpen ? 0 : -1}
      />

      <aside id="algoweave-navigation" className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`} aria-label="AlgoWeave navigation">
        <div className={styles.drawerHead}>
          <Link to="/" className={styles.logo}>
            <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
              <rect x="1" y="1" width="12" height="12" stroke="var(--text-secondary)" strokeWidth="1"/>
              <path d="M4 9L6 5L8 8L10 4" stroke="var(--accent)" strokeWidth="1.2"/>
            </svg>
            <span>AlgoWeave</span>
          </Link>
          <button type="button" className={styles.closeButton} onClick={() => setMobileOpen(false)} aria-label="close navigation menu">×</button>
        </div>

        {isApp && (
          <>
            <div className={styles.section}>
              <div className={styles.label}>Learning mode</div>
              <button
                className={`${styles.navItem} ${source === 'custom' ? styles.active : ''}`}
                onClick={() => chooseSource('custom')}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l3 4-3 4M6 10h4" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                Try my code
              </button>
              <button
                className={`${styles.navItem} ${source === 'template' ? styles.active : ''}`}
                onClick={() => chooseSource('template')}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="2" y="2" width="8" height="2" stroke="currentColor" strokeWidth="1"/>
                  <rect x="2" y="6" width="8" height="2" stroke="currentColor" strokeWidth="1"/>
                </svg>
                Guided lessons
              </button>
            </div>

            <div className={styles.section}>
              <div className={styles.label}>Language</div>
              <select
                className={styles.select}
                value={language}
                onChange={e => chooseLanguage(e.target.value as Language)}
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
                  available reference: {availableLanguages.map(item => LANGUAGES[item as Language]?.label ?? item).join(', ')}
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
          <Link to="/docs" className={styles.footerLink} onClick={() => setMobileOpen(false)}>How it works</Link>
        </div>
      </aside>
    </>
  )
}
