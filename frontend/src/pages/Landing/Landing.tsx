import { useNavigate } from 'react-router-dom'
import styles from './Landing.module.css'

const DEMO_CODE = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`

const BARS = [
  { h: 35, cls: '' },
  { h: 78, cls: 'compare' },
  { h: 55, cls: 'compare' },
  { h: 95, cls: '' },
  { h: 20, cls: '' },
  { h: 65, cls: '' },
]

const FEATURES = [
  {
    tag: 'Isolation',
    title: 'Sandboxed by default',
    body: 'Every run executes in a container with no network access, capped memory, and a hard timeout.',
  },
  {
    tag: 'Coverage',
    title: 'One engine, any algorithm',
    body: 'Sorting, graph traversal, recursion, and dynamic programming all use the same step-recording engine.',
  },
  {
    tag: 'Templates',
    title: 'Full DSA catalog on tap',
    body: 'Every classic algorithm across sorting, graphs, trees, DP, backtracking, and strings — pick one from a single dropdown, no browsing required.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.eyebrow}>
          SANDBOXED EXECUTION · PYTHON · GO · JAVA · JAVASCRIPT · C/C++
        </div>
        <h1 className={styles.h1}>
          Step through exactly how your algorithm executes.
        </h1>
        <p className={styles.sub}>
          Paste a function, run it in an isolated sandbox, and inspect every comparison,
          swap, and recursive call as a reproducible sequence of steps.
        </p>
        <div className={styles.ctas}>
          <button className={styles.btnPrimary} onClick={() => navigate('/app')}>
            Open app
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnGhost}
          >
            View on GitHub
          </a>
        </div>
      </div>

      {/* Preview panel */}
      <div className={styles.previewWrap}>
        <div className={styles.previewInner}>
          <div className={styles.previewHead}>
            <span>solution.py — step 7 of 24</span>
          </div>
          <div className={styles.split}>
            <div className={styles.codeArea}>
              <div className={styles.lineNums}>
                {DEMO_CODE.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre className={styles.code}>{
                DEMO_CODE
                  .replace(/\bdef\b/g, '<kw>def</kw>')
                  .replace(/\bfor\b/g, '<kw>for</kw>')
                  .replace(/\bin\b/g, '<kw>in</kw>')
                  .replace(/\bif\b/g, '<kw>if</kw>')
                  .replace(/\breturn\b/g, '<kw>return</kw>')
              }</pre>
              <pre className={styles.codeRaw}>{DEMO_CODE}</pre>
            </div>
            <div className={styles.vizArea}>
              {BARS.map((b, i) => (
                <div
                  key={i}
                  className={styles.bar + (b.cls ? ' ' + styles[b.cls as keyof typeof styles] : '')}
                  style={{ height: b.h + '%' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className={styles.features}>
        {FEATURES.map(f => (
          <div key={f.tag} className={styles.feature}>
            <div className={styles.featureTag}>{f.tag}</div>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureBody}>{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
