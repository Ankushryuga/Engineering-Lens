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
      steps.push({ values: [...values], indices: [index, index + 1], type: 'compare', label: `Compare ${values[index]} and ${values[index + 1]}` })
      if (values[index] > values[index + 1]) {
        const left = values[index]
        values[index] = values[index + 1]
        values[index + 1] = left
        steps.push({ values: [...values], indices: [index, index + 1], type: 'swap', label: 'Swap the out-of-order values' })
      }
    }
  }
  steps.push({ values: [...values], indices: [], type: 'done', label: 'Sorted' })
  return steps
}

function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <span />
    </span>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const previewSteps = useMemo(() => buildBubblePreview(PREVIEW_INPUT), [])
  const [previewStep, setPreviewStep] = useState(0)
  const preview = previewSteps[previewStep]

  const advancePreview = () => setPreviewStep(step => step >= previewSteps.length - 1 ? 0 : step + 1)

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <Link to="/" className={styles.brand} aria-label="Engineering Lens home">
          <BrandMark />
          <span>Engineering Lens</span>
        </Link>

        <nav className={styles.navLinks} aria-label="Primary navigation">
          <Link to="/dashboard">Product</Link>
          <Link to="/system-design">System Design</Link>
          <Link to="/docs">Docs</Link>
        </nav>

        <div className={styles.navActions}>
          <button
            type="button"
            className={styles.themeButton}
            onClick={toggleTheme}
            aria-label={`switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button type="button" className={styles.navCta} onClick={() => navigate('/dashboard')}>
            Get started <span>→</span>
          </button>
        </div>
      </header>

      <main className={styles.hero}>
        <section className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Learn / Build / Grow
          </div>

          <h1>
            Real Engineering Skills.
            <span> In Practice.</span>
          </h1>

          <p>
            Interactive labs, visualizations, and real-world simulations for algorithms,
            system design, scaling, and resilient distributed systems.
          </p>

          <div className={styles.actions}>
            <button type="button" className={styles.primaryButton} onClick={() => navigate('/dashboard')}>
              Get started free <span>→</span>
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => navigate('/app?mode=guided')}>
              <span className={styles.playIcon}>▶</span>
              Start a lesson
            </button>
          </div>

          <div className={styles.proofRow} aria-label="Story mode · Architecture flows · Failure injection · Source on demand">
            <button type="button" onClick={() => navigate('/app?mode=guided')}><span className={styles.proofIcon}>⌁</span><p><strong>Hands-on labs</strong><small>Story mode</small></p></button>
            <button type="button" onClick={() => navigate('/system-design')}><span className={styles.proofIcon}>▥</span><p><strong>Visual systems</strong><small>Architecture flows · Failure injection</small></p></button>
            <button type="button" onClick={() => navigate('/app?mode=custom')}><span className={styles.proofIcon}>&lt;/&gt;</span><p><strong>Built for developers</strong><small>Source on demand</small></p></button>
          </div>
        </section>

        <section className={styles.productStage} aria-label="Engineering Lens product preview">
          <span className={`${styles.orbitDot} ${styles.orbitDotOne}`} />
          <span className={`${styles.orbitDot} ${styles.orbitDotTwo}`} />
          <div className={styles.annotation}>learn by doing <span>↙</span></div>

          <div className={styles.productWindow}>
            <div className={styles.windowBar}>
              <div className={styles.windowDots}><i /><i /><i /></div>
              <span>engineering-lens</span>
              <span className={styles.windowStatus}>● ready</span>
            </div>

            <div className={styles.windowBody}>
              <aside className={styles.previewRail}>
                <div className={styles.previewBrand}><BrandMark /><span>Lens</span></div>
                <span className={styles.previewActive}>⌂ <b>Dashboard</b></span>
                <span>&lt;/&gt; Algorithm Lab</span>
                <span>▱ System Design</span>
                <span>⌁ Architecture</span>
                <span>▥ Traffic</span>
                <span>△ Failure Lab</span>
              </aside>

              <div className={styles.previewMain}>
                <div className={styles.previewHeading}>
                  <div><small>WELCOME</small><strong>Build. Experiment. Understand.</strong></div>
                  <span className={styles.readyPill}>● systems ready</span>
                </div>

                <div className={styles.previewGrid}>
                  <div className={styles.previewCard}>
                    <div className={`${styles.previewCardIcon} ${styles.iconBlue}`}>&lt;/&gt;</div>
                    <strong>Algorithm Lab</strong>
                    <p>Visualize execution step by step.</p>
                    <button type="button" className={styles.algoMini} onClick={advancePreview} aria-label={`Bubble Sort preview: ${preview.label}. Show next step`}>
                      {preview.values.map((value, index) => (
                        <i key={`${value}-${index}`} className={preview.indices.includes(index) ? styles.algoActive : ''} style={{ height: `${Math.max(22, value)}%` }} />
                      ))}
                    </button>
                  </div>
                  <div className={styles.previewCard}>
                    <div className={`${styles.previewCardIcon} ${styles.iconSky}`}>▱</div>
                    <strong>System Design</strong>
                    <p>Explore production architecture.</p>
                    <div className={styles.archMini}><i>Client</i><span>→</span><b /><span>→</span><i>API</i></div>
                  </div>
                  <div className={styles.previewCard}>
                    <div className={`${styles.previewCardIcon} ${styles.iconGreen}`}>▥</div>
                    <strong>Traffic Simulator</strong>
                    <p>Test 1×, 10× and 100× scale.</p>
                    <div className={styles.trafficMini}>{[22, 34, 29, 48, 65, 82, 72].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
                  </div>
                  <div className={styles.previewCard}>
                    <div className={`${styles.previewCardIcon} ${styles.iconOrange}`}>△</div>
                    <strong>Failure Recovery</strong>
                    <p>Break safely. Learn recovery.</p>
                    <div className={styles.recoveryMini}><span /><span /></div>
                  </div>
                </div>

                <div className={styles.previewFooter}><span>›</span> Practice today. Build better tomorrow.</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className={styles.bottomLine} aria-hidden="true">
        <span>from fundamentals to real-world systems</span>
        <i />
        <strong>Built for curious developers</strong>
      </div>
    </div>
  )
}
