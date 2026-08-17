import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import styles from './Landing.module.css'

interface PreviewStep {
  values: number[]
  indices: number[]
  type: 'compare' | 'swap' | 'done'
  label: string
}

const PREVIEW_INPUT = [64, 34, 25, 12, 22]

function buildBubblePreview(input: number[]): PreviewStep[] {
  const values = [...input]
  const steps: PreviewStep[] = []

  for (let pass = 0; pass < values.length; pass++) {
    for (let index = 0; index < values.length - pass - 1; index++) {
      steps.push({
        values: [...values],
        indices: [index, index + 1],
        type: 'compare',
        label: `Compare ${values[index]} kg and ${values[index + 1]} kg`,
      })

      if (values[index] > values[index + 1]) {
        const left = values[index]
        const right = values[index + 1]
        values[index] = right
        values[index + 1] = left
        steps.push({
          values: [...values],
          indices: [index, index + 1],
          type: 'swap',
          label: `${left} kg is heavier, so the packages swap places`,
        })
      }
    }
  }

  steps.push({
    values: [...values],
    indices: [],
    type: 'done',
    label: 'The packages are sorted from lightest to heaviest',
  })
  return steps
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const previewSteps = useMemo(() => buildBubblePreview(PREVIEW_INPUT), [])
  const [previewStep, setPreviewStep] = useState(0)
  const preview = previewSteps[previewStep]

  const nextPreviewStep = () => {
    setPreviewStep(index => index >= previewSteps.length - 1 ? 0 : index + 1)
  }

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <Link to="/" className={styles.brand} aria-label="Engineering Lens home">
          <span className={styles.brandMark}>⌁</span>
          <span>Engineering Lens</span>
        </Link>
        <div className={styles.navActions}>
          <Link to="/system-design" className={styles.docsLink}>System Design</Link>
          <Link to="/docs" className={styles.docsLink}>Docs</Link>
          <button
            type="button"
            className={styles.themeButton}
            onClick={toggleTheme}
            aria-label={`switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </header>

      <main className={styles.hero}>
        <section className={styles.heroCopy}>
          <span className={styles.eyebrow}>Learn algorithms &amp; system design visually</span>
          <h1>See how algorithms run — and how production systems behave.</h1>
          <p>
            Engineering Lens combines interactive algorithm lessons with a production system-design lab.
            Follow request flows, scale traffic, inject failures, inspect trade-offs, and reveal code only when it helps.
          </p>

          <div className={styles.actions}>
            <button type="button" className={styles.primaryButton} onClick={() => navigate('/app?mode=guided')}>
              Start learning <span>→</span>
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => navigate('/system-design')}>
              Explore system design
            </button>
            <button type="button" className={styles.tertiaryButton} onClick={() => navigate('/app?mode=custom')}>
              Try my own code
            </button>
          </div>

          <div className={styles.capabilities} aria-label="Learning features">
            <span>🌍 Story mode</span>
            <span>⌁ Architecture flows</span>
            <span>⚠ Failure injection</span>
            <span>⌨ Source on demand</span>
          </div>
        </section>

        <section className={styles.preview} aria-label="Bubble Sort lesson preview">
          <div className={styles.previewHeader}>
            <div>
              <span>Lesson preview</span>
              <strong>Warehouse Sorting Line</strong>
              <small>Bubble Sort</small>
            </div>
            <span className={styles.stepCount}>{previewStep + 1}/{previewSteps.length}</span>
          </div>

          <div className={styles.explanation}>
            <span>{preview.type === 'compare' ? 'Compare' : preview.type === 'swap' ? 'Swap' : 'Done'}</span>
            <p>{preview.label}</p>
          </div>

          <div className={styles.packages}>
            {preview.values.map((value, index) => {
              const active = preview.indices.includes(index)
              return (
                <div
                  key={`${index}-${value}`}
                  className={`${styles.package} ${active ? styles.packageActive : ''} ${preview.type === 'swap' && active ? styles.packageSwap : ''}`}
                >
                  <span>📦</span>
                  <strong>{value} kg</strong>
                </div>
              )
            })}
          </div>

          <div className={styles.previewControls}>
            <button type="button" onClick={() => setPreviewStep(index => Math.max(0, index - 1))} disabled={previewStep === 0}>
              ← Previous
            </button>
            <input
              type="range"
              min={0}
              max={previewSteps.length - 1}
              value={previewStep}
              onChange={event => setPreviewStep(Number(event.target.value))}
              aria-label="Bubble Sort preview step"
            />
            <button type="button" onClick={nextPreviewStep}>
              {previewStep === previewSteps.length - 1 ? 'Restart' : 'Next →'}
            </button>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Engineering Lens · algorithms and system design, visualized</span>
        <Link to="/docs">Documentation</Link>
      </footer>
    </div>
  )
}
