import { useMemo, useState, type CSSProperties } from 'react'
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
          <a href="#dashboard" className={styles.docsLink}>Features</a>
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

      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
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
          </div>

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
        </section>

        <section id="dashboard" className={styles.dashboard} aria-labelledby="dashboard-title">
          <div className={styles.dashboardIntro}>
            <div>
              <span className={styles.eyebrow}>Product dashboard</span>
              <h2 id="dashboard-title">One workspace for learning execution and architecture.</h2>
            </div>
            <p>
              Every surface is interactive. The motion below mirrors the behavior you can inspect inside each learning experience.
            </p>
          </div>

          <div className={styles.statStrip} aria-label="Engineering Lens coverage">
            <div><strong>55</strong><span>guided algorithms</span></div>
            <div><strong>1,077+</strong><span>system-design topics</span></div>
            <div><strong>2</strong><span>execution runtimes</span></div>
            <div><strong>3</strong><span>traffic scale levels</span></div>
          </div>

          <div className={styles.featureGrid}>
            <button type="button" className={`${styles.featureCard} ${styles.algorithmCard}`} onClick={() => navigate('/app?mode=guided')}>
              <div className={styles.featureCardHead}>
                <span className={styles.featureIcon}>✦</span>
                <span className={styles.featureStatus}><i /> Live trace</span>
              </div>
              <div className={styles.algorithmMotion} aria-hidden="true">
                {[38, 72, 50, 86, 62, 100].map((height, index) => (
                  <span key={height} style={{ '--bar-height': `${height}%`, '--bar-delay': `${index * 90}ms` } as CSSProperties} />
                ))}
              </div>
              <div className={styles.featureCopy}>
                <span className={styles.featureKicker}>Algorithm Lab</span>
                <h3>Watch real execution become a story.</h3>
                <p>Play, pause, scrub and explain each step across 55 guided algorithms.</p>
              </div>
              <span className={styles.featureLink}>Open guided lessons <b>→</b></span>
            </button>

            <button type="button" className={`${styles.featureCard} ${styles.topicCard}`} onClick={() => navigate('/system-design')}>
              <div className={styles.featureCardHead}>
                <span className={styles.featureIcon}>⌁</span>
                <span className={styles.featureStatus}>1,077+ topics</span>
              </div>
              <div className={styles.topicMotion} aria-hidden="true">
                <span className={styles.searchGhost}>Search: distributed systems</span>
                <div className={styles.topicRows}>
                  <span><i /> Rate limiting <b>Backend</b></span>
                  <span><i /> Multi-region failover <b>Cloud</b></span>
                  <span><i /> Vector retrieval <b>GenAI</b></span>
                </div>
              </div>
              <div className={styles.featureCopy}>
                <span className={styles.featureKicker}>Topic Explorer</span>
                <h3>Move from a concept to its actual mechanics.</h3>
                <p>Search Backend, Database, Cloud and GenAI topics with topic-specific visualizations.</p>
              </div>
              <span className={styles.featureLink}>Explore system design <b>→</b></span>
            </button>

            <button type="button" className={`${styles.featureCard} ${styles.flowCard}`} onClick={() => navigate('/system-design')}>
              <div className={styles.featureCardHead}>
                <span className={styles.featureIcon}>⇄</span>
                <span className={styles.featureStatus}><i /> Request flow</span>
              </div>
              <div className={styles.flowMotion} aria-hidden="true">
                <span className={styles.flowNode}>Client</span>
                <span className={styles.flowLine}><i /></span>
                <span className={styles.flowNode}>API</span>
                <span className={styles.flowLine}><i /></span>
                <span className={styles.flowNode}>Data</span>
              </div>
              <div className={styles.featureCopy}>
                <span className={styles.featureKicker}>Architecture Labs</span>
                <h3>Follow requests through production architectures.</h3>
                <p>Inspect components, data movement, operating metrics, decisions and trade-offs.</p>
              </div>
              <span className={styles.featureLink}>Open architecture labs <b>→</b></span>
            </button>

            <button type="button" className={`${styles.featureCard} ${styles.scaleCard}`} onClick={() => navigate('/system-design')}>
              <div className={styles.featureCardHead}>
                <span className={styles.featureIcon}>↗</span>
                <span className={styles.featureStatus}>Traffic simulator</span>
              </div>
              <div className={styles.scaleMotion} aria-hidden="true">
                <div className={styles.scaleBars}>
                  <span><i /><b>1×</b></span>
                  <span><i /><b>10×</b></span>
                  <span><i /><b>100×</b></span>
                </div>
                <div className={styles.scalePulse}><i /><i /><i /><i /></div>
              </div>
              <div className={styles.featureCopy}>
                <span className={styles.featureKicker}>Scale Simulation</span>
                <h3>See architecture pressure before it breaks.</h3>
                <p>Move between 1×, 10× and 100× traffic to see bottlenecks and system behavior change.</p>
              </div>
              <span className={styles.featureLink}>Simulate load <b>→</b></span>
            </button>

            <button type="button" className={`${styles.featureCard} ${styles.failureCard}`} onClick={() => navigate('/system-design')}>
              <div className={styles.featureCardHead}>
                <span className={styles.featureIcon}>⚠</span>
                <span className={styles.featureStatus}>Failure mode</span>
              </div>
              <div className={styles.failureMotion} aria-hidden="true">
                <span className={styles.healthyNode}>API</span>
                <span className={styles.failureConnector} />
                <span className={styles.failingNode}>DB<i /></span>
                <span className={styles.failureConnector} />
                <span className={styles.healthyNode}>Replica</span>
                <b className={styles.recoveryBadge}>recovering</b>
              </div>
              <div className={styles.featureCopy}>
                <span className={styles.featureKicker}>Failure &amp; Recovery</span>
                <h3>Break the system safely, then reason about recovery.</h3>
                <p>Inject failures and inspect the impact, recovery guidance, and resilient design choices.</p>
              </div>
              <span className={styles.featureLink}>Test failure modes <b>→</b></span>
            </button>

            <button type="button" className={`${styles.featureCard} ${styles.codeCard}`} onClick={() => navigate('/app?mode=custom')}>
              <div className={styles.featureCardHead}>
                <span className={styles.featureIcon}>⌨</span>
                <span className={styles.featureStatus}>Python + Go</span>
              </div>
              <div className={styles.codeMotion} aria-hidden="true">
                <div className={styles.codeTabs}><span>python</span><span>go</span></div>
                <div className={styles.codeLines}>
                  <i /><i /><i /><i />
                </div>
                <span className={styles.codeCursor} />
              </div>
              <div className={styles.featureCopy}>
                <span className={styles.featureKicker}>Custom Code</span>
                <h3>Run your own code and reveal source only when useful.</h3>
                <p>Execute Python or Go in isolated workers, then connect the trace back to code and explanations.</p>
              </div>
              <span className={styles.featureLink}>Try your own code <b>→</b></span>
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
