import { Link } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import styles from './DashboardPage.module.css'

type IconName = 'algorithm' | 'system' | 'architecture' | 'traffic' | 'failure' | 'code'

const features: Array<{
  title: string
  description: string
  to: string
  icon: IconName
  label: string
}> = [
  { title: 'Algorithm Lab', description: 'Solve and visualize 55+ algorithms with step-by-step execution.', to: '/app?mode=guided', icon: 'algorithm', label: 'Start lesson' },
  { title: 'System Design Explorer', description: 'Explore 1,077+ engineering topics with practical system context.', to: '/system-design?view=topics', icon: 'system', label: 'Explore topics' },
  { title: 'Architecture Lab', description: 'Visualize request paths, components, data movement, and trade-offs.', to: '/system-design?view=labs', icon: 'architecture', label: 'Open lab' },
  { title: 'Traffic Simulator', description: 'Stress architecture at 1×, 10×, and 100× traffic levels.', to: '/system-design?view=labs', icon: 'traffic', label: 'Scale system' },
  { title: 'Failure Recovery', description: 'Inject failures and study impact, recovery, and resilience decisions.', to: '/system-design?view=labs', icon: 'failure', label: 'Test resilience' },
  { title: 'Code Playground', description: 'Write, run, and visualize your own Python or Go implementation.', to: '/app?mode=custom', icon: 'code', label: 'Write code' },
]

function BrandMark() {
  return <span className={styles.brandMark} aria-hidden="true"><span /></span>
}

function FeatureVisual({ icon }: { icon: IconName }) {
  if (icon === 'algorithm') {
    return <div className={styles.algorithmVisual}><span /><span /><span /><span /><span /></div>
  }
  if (icon === 'system') {
    return <div className={styles.systemVisual}><span>LB</span><i /><span>Cache</span><i /><span>DB</span></div>
  }
  if (icon === 'architecture') {
    return <div className={styles.archVisual}><span>Client</span><i /><b /><i /><span>Service</span><em /></div>
  }
  if (icon === 'traffic') {
    return <div className={styles.trafficVisual}>{[34, 48, 40, 65, 56, 82, 70, 96].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
  }
  if (icon === 'failure') {
    return <div className={styles.failureVisual}><p>Injecting failure… <b>60%</b></p><span><i /></span><p>Recovering system… <b>100%</b></p><span><i /></span></div>
  }
  return <div className={styles.codeVisual}><span><b>1</b> func main() {'{'}</span><span><b>2</b> &nbsp;&nbsp;build(<i>"understanding"</i>)</span><span><b>3</b> {'}'}</span><em /></div>
}

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand}><BrandMark /><span>Engineering Lens</span></Link>
        <nav className={styles.nav} aria-label="Workspace navigation">
          <span className={styles.navLabel}>Workspace</span>
          <Link to="/dashboard" className={`${styles.navItem} ${styles.navActive}`}><b>⌂</b> Dashboard</Link>
          <Link to="/app?mode=guided" className={styles.navItem}><b>&lt;/&gt;</b> Algorithm Lab</Link>
          <Link to="/system-design?view=topics" className={styles.navItem}><b>▱</b> System Design</Link>
          <Link to="/system-design?view=labs" className={styles.navItem}><b>⌁</b> Architecture Lab</Link>
          <Link to="/system-design?view=labs" className={styles.navItem}><b>▥</b> Traffic Simulator</Link>
          <Link to="/system-design?view=labs" className={styles.navItem}><b>△</b> Failure Lab</Link>
          <Link to="/app?mode=custom" className={styles.navItem}><b>›_</b> Code Playground</Link>
        </nav>
        <div className={styles.sideBottom}>
          <Link to="/docs" className={styles.docsLink}>? &nbsp; Documentation</Link>
          <div className={styles.sideTag}><span>●</span><div><strong>Ready to learn</strong><small>Choose any workspace</small></div></div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}><span>Workspace</span><b>/</b><strong>Dashboard</strong></div>
          <div className={styles.topActions}>
            <span className={styles.systemReady}><i /> All systems ready</span>
            <button type="button" className={styles.themeButton} onClick={toggleTheme} aria-label={`switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
              {theme === 'dark' ? '☀' : '☾'}
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.welcome}>
            <div>
              <span className={styles.eyebrow}>Engineering workspace</span>
              <h1>Your Engineering Playground</h1>
              <p>Practice. Experiment. Visualize. Master real-world engineering concepts.</p>
            </div>
            <div className={styles.quote}><span>“</span><p>Turn concepts into clarity with hands-on practice.</p><i /></div>
          </section>

          <section className={styles.stats} aria-label="Product statistics">
            <div><span className={styles.statIcon}>&lt;/&gt;</span><p><strong>55</strong><small>Algorithms</small></p></div>
            <div><span className={styles.statIcon}>▱</span><p><strong>1,077+</strong><small>System Design Topics</small></p></div>
            <div><span className={styles.statIcon}>›_</span><p><strong>Python + Go</strong><small>Supported runtimes</small></p></div>
            <div><span className={`${styles.statIcon} ${styles.statTraffic}`}>▥</span><p><strong>1× / 10× / 100×</strong><small>Traffic simulation</small></p></div>
          </section>

          <section className={styles.featuresSection}>
            <div className={styles.sectionHeading}><div><h2>Explore features</h2><p>Choose a workspace and start learning by doing.</p></div><Link to="/docs">How it works <span>→</span></Link></div>

            <div className={styles.featureGrid}>
              {features.map(feature => (
                <Link key={feature.title} to={feature.to} className={`${styles.featureCard} ${styles[`card_${feature.icon}`]}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardIcon}>{feature.icon === 'algorithm' ? '</>' : feature.icon === 'system' ? '▱' : feature.icon === 'architecture' ? '⌁' : feature.icon === 'traffic' ? '▥' : feature.icon === 'failure' ? '△' : '›_'}</span>
                    <span className={styles.arrow}>→</span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <FeatureVisual icon={feature.icon} />
                  <span className={styles.cardAction}>{feature.label} <b>→</b></span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.continueBar}>
            <span className={styles.spark}>✦</span>
            <div><strong>Keep building your skills.</strong><small>Consistency turns learning into engineering intuition.</small></div>
            <Link to="/app?mode=guided">Continue learning <span>→</span></Link>
          </section>
        </div>
      </main>
    </div>
  )
}
