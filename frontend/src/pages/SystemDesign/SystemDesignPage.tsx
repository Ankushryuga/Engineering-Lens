import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import {
  CATEGORY_META,
  DesignCategory,
  DesignEdgeKind,
  DesignLevel,
  DesignNode,
  SYSTEM_DESIGN_SCENARIOS,
  SystemDesignScenario,
} from '@/data/systemDesignScenarios'
import styles from './SystemDesignPage.module.css'
import SystemDesignTopicExplorer from './SystemDesignTopicExplorer'

const EDGE_KIND_LABELS: Record<DesignEdgeKind, string> = {
  sync: 'Synchronous',
  async: 'Asynchronous',
  data: 'Data path',
}

const LEVELS: DesignLevel[] = ['Fundamental', 'Intermediate', 'Senior', 'Staff']
const CATEGORIES: DesignCategory[] = ['backend', 'database', 'cloud', 'genai']

function nodeIcon(node: DesignNode) {
  const icons: Record<DesignNode['kind'], string> = {
    client: '◉',
    edge: '◇',
    service: '⬡',
    cache: '▤',
    database: '◫',
    queue: '⇥',
    worker: '⚙',
    storage: '▱',
    security: '◆',
    observability: '⌁',
    ai: '✦',
  }
  return icons[node.kind]
}

function edgePoint(node: DesignNode, toward: DesignNode) {
  const dx = toward.x - node.x
  const dy = toward.y - node.y
  const length = Math.max(Math.hypot(dx, dy), 1)
  return {
    x: node.x + (dx / length) * 6.8,
    y: node.y + (dy / length) * 5.8,
  }
}

function ArchitectureCanvas({
  scenario,
  stepIndex,
  failedNodeIds,
  pressureNodeIds,
  visibleKinds,
  selectedNodeId,
  onSelectNode,
}: {
  scenario: SystemDesignScenario
  stepIndex: number
  failedNodeIds: Set<string>
  pressureNodeIds: Set<string>
  visibleKinds: Set<DesignEdgeKind>
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
}) {
  const activeStep = scenario.steps[stepIndex]
  const activeEdges = new Set(activeStep.edgeIds)
  const activeNodes = new Set(activeStep.nodeIds)
  const nodesById = new Map(scenario.nodes.map(node => [node.id, node]))

  return (
    <div className={styles.canvasShell}>
      <svg className={styles.canvas} viewBox="0 0 100 100" role="img" aria-label={`${scenario.title} architecture diagram`}>
        <defs>
          <marker id="arrowSync" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" className={styles.arrowSync} />
          </marker>
          <marker id="arrowAsync" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" className={styles.arrowAsync} />
          </marker>
          <marker id="arrowData" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" className={styles.arrowData} />
          </marker>
          <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g className={styles.grid}>
          {Array.from({ length: 10 }, (_, i) => <line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" />)}
          {Array.from({ length: 10 }, (_, i) => <line key={`h-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />)}
        </g>

        <g>
          {scenario.edges.filter(edge => visibleKinds.has(edge.kind)).map(edge => {
            const from = nodesById.get(edge.from)
            const to = nodesById.get(edge.to)
            if (!from || !to) return null
            const start = edgePoint(from, to)
            const end = edgePoint(to, from)
            const active = activeEdges.has(edge.id)
            const failed = failedNodeIds.has(edge.from) || failedNodeIds.has(edge.to)
            const cx = (start.x + end.x) / 2
            const cy = (start.y + end.y) / 2
            return (
              <g key={edge.id} className={`${styles.edgeGroup} ${active ? styles.edgeActive : ''} ${failed ? styles.edgeFailed : ''}`}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  className={`${styles.edge} ${styles[`edge_${edge.kind}`]}`}
                  markerEnd={`url(#arrow${edge.kind === 'sync' ? 'Sync' : edge.kind === 'async' ? 'Async' : 'Data'})`}
                />
                <rect x={cx - 5.6} y={cy - 2.1} width="11.2" height="4.2" rx="2.1" className={styles.edgeLabelBg} />
                <text x={cx} y={cy + .65} textAnchor="middle" className={styles.edgeLabel}>{edge.label}</text>
                {active && !failed ? (
                  <circle r="1.05" className={styles.packet}>
                    <animateMotion dur="1.35s" repeatCount="indefinite" path={`M ${start.x} ${start.y} L ${end.x} ${end.y}`} />
                  </circle>
                ) : null}
              </g>
            )
          })}
        </g>

        <g>
          {scenario.nodes.map(node => {
            const active = activeNodes.has(node.id)
            const failed = failedNodeIds.has(node.id)
            const pressured = pressureNodeIds.has(node.id)
            const selected = selectedNodeId === node.id
            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`${node.label}: ${node.subtitle}`}
                className={`${styles.node} ${styles[`node_${node.kind}`]} ${active ? styles.nodeActive : ''} ${failed ? styles.nodeFailed : ''} ${pressured ? styles.nodePressure : ''} ${selected ? styles.nodeSelected : ''}`}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectNode(node.id)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') onSelectNode(node.id)
                }}
              >
                <rect x="-7.7" y="-6.5" width="15.4" height="13" rx="3.2" filter={active ? 'url(#nodeGlow)' : undefined} />
                <text x="-5.7" y="-1.3" className={styles.nodeIcon}>{nodeIcon(node)}</text>
                <text x="-2.5" y="-1.3" className={styles.nodeLabel}>{node.label}</text>
                <text x="-5.7" y="2.2" className={styles.nodeSubtitle}>{node.subtitle}</text>
                {failed ? <text x="5.7" y="-3.9" textAnchor="middle" className={styles.failureMark}>!</text> : null}
                {pressured && !failed ? <text x="5.7" y="-3.9" textAnchor="middle" className={styles.pressureMark}>↑</text> : null}
              </g>
            )
          })}
        </g>
      </svg>

      <div className={styles.canvasLegend}>
        {(['sync', 'async', 'data'] as DesignEdgeKind[]).map(kind => (
          <span key={kind}><i className={styles[`legend_${kind}`]} />{EDGE_KIND_LABELS[kind]}</span>
        ))}
      </div>
    </div>
  )
}

export default function SystemDesignPage() {
  const { theme, toggleTheme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeView = searchParams.get('view') === 'labs' ? 'labs' : 'topics'
  const changeView = (view: 'topics' | 'labs') => {
    const next = new URLSearchParams(searchParams)
    next.set('view', view)
    if (view === 'labs') next.delete('topic')
    setSearchParams(next)
  }
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<DesignCategory | 'all'>('all')
  const [level, setLevel] = useState<DesignLevel | 'all'>('all')
  const [selectedId, setSelectedId] = useState(SYSTEM_DESIGN_SCENARIOS[0].id)
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [traffic, setTraffic] = useState<1 | 10 | 100>(1)
  const [failureId, setFailureId] = useState('none')
  const [activeTab, setActiveTab] = useState<'guide' | 'requirements' | 'tradeoffs'>('guide')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [visibleKinds, setVisibleKinds] = useState<Set<DesignEdgeKind>>(new Set(['sync', 'async', 'data']))
  const timerRef = useRef<number | null>(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return SYSTEM_DESIGN_SCENARIOS.filter(item => {
      const matchesCategory = category === 'all' || item.category === category
      const matchesLevel = level === 'all' || item.level === level
      const haystack = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase()
      return matchesCategory && matchesLevel && (!needle || haystack.includes(needle))
    })
  }, [category, level, query])

  useEffect(() => {
    if (!filtered.some(item => item.id === selectedId) && filtered[0]) setSelectedId(filtered[0].id)
  }, [filtered, selectedId])

  const scenario = SYSTEM_DESIGN_SCENARIOS.find(item => item.id === selectedId) ?? SYSTEM_DESIGN_SCENARIOS[0]
  const failure = scenario.failures.find(item => item.id === failureId)
  const scaleTier = scenario.scaleTiers.find(item => item.multiplier === traffic) ?? scenario.scaleTiers[0]
  const failedNodeIds = new Set(failure?.nodeIds ?? [])
  const pressureNodeIds = new Set(scaleTier.pressureNodeIds)
  const selectedNode = scenario.nodes.find(node => node.id === selectedNodeId) ?? null

  useEffect(() => {
    setStepIndex(0)
    setPlaying(false)
    setTraffic(1)
    setFailureId('none')
    setSelectedNodeId(null)
  }, [scenario.id])

  useEffect(() => {
    if (!playing) return
    timerRef.current = window.setInterval(() => {
      setStepIndex(index => {
        if (index >= scenario.steps.length - 1) {
          setPlaying(false)
          return 0
        }
        return index + 1
      })
    }, 1800 / speed)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [playing, scenario.steps.length, speed])

  const toggleEdgeKind = (kind: DesignEdgeKind) => {
    setVisibleKinds(current => {
      const next = new Set(current)
      if (next.has(kind)) next.delete(kind)
      else next.add(kind)
      return next
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.brand} aria-label="Engineering Lens home">
          <span className={styles.brandMark}>⌁</span>
          <span>Engineering Lens</span>
        </Link>
        <div className={styles.productTitle}>
          <span>System Design</span>
          <small>Technical topic explorer + architecture labs</small>
        </div>
        <nav className={styles.topnav}>
          <Link to="/app?mode=guided">Algorithms</Link>
          <button type="button" className={activeView === 'topics' ? styles.topnavActive : ''} onClick={() => changeView('topics')}>All Topics</button>
          <button type="button" className={activeView === 'labs' ? styles.topnavActive : ''} onClick={() => changeView('labs')}>Architecture Labs</button>
          <Link to="/docs">Docs</Link>
          <button type="button" onClick={toggleTheme} aria-label={`switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </nav>
      </header>

      {activeView === 'topics' ? <SystemDesignTopicExplorer /> : (
      <main className={styles.workspace}>
        <aside className={styles.catalog}>
          <div className={styles.catalogHeader}>
            <span className={styles.eyebrow}>Design library</span>
            <strong>{filtered.length} architectures</strong>
          </div>

          <label className={styles.search}>
            <span>⌕</span>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search designs..." />
          </label>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Domain</span>
            <div className={styles.chips}>
              <button type="button" className={category === 'all' ? styles.chipActive : ''} onClick={() => setCategory('all')}>All</button>
              {CATEGORIES.map(item => (
                <button type="button" key={item} className={category === item ? styles.chipActive : ''} onClick={() => setCategory(item)}>
                  {CATEGORY_META[item].label.replace(' Systems', '').replace(' Architecture', '')}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Level</span>
            <select value={level} onChange={event => setLevel(event.target.value as DesignLevel | 'all')}>
              <option value="all">All levels</option>
              {LEVELS.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className={styles.scenarioList}>
            {filtered.map(item => (
              <button
                type="button"
                key={item.id}
                className={`${styles.scenarioCard} ${item.id === scenario.id ? styles.scenarioCardActive : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                <div>
                  <span>{CATEGORY_META[item.category].label}</span>
                  <em>{item.level}</em>
                </div>
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
                <footer>{item.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</footer>
              </button>
            ))}
            {!filtered.length ? <div className={styles.emptyList}>No matching designs. Clear a filter or try a broader search.</div> : null}
          </div>
        </aside>

        <section className={styles.stage}>
          <div className={styles.stageHeader}>
            <div>
              <div className={styles.stageMeta}>
                <span>{CATEGORY_META[scenario.category].label}</span>
                <i>•</i>
                <span>{scenario.level}</span>
              </div>
              <h1>{scenario.title}</h1>
              <p>{scenario.goal}</p>
            </div>
            <div className={styles.stageBadges}>
              {scenario.tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>
          </div>

          <div className={styles.simulatorBar}>
            <div className={styles.controlGroup}>
              <span>Traffic</span>
              <div className={styles.segmented}>
                {([1, 10, 100] as const).map(multiplier => (
                  <button type="button" key={multiplier} className={traffic === multiplier ? styles.segmentActive : ''} onClick={() => setTraffic(multiplier)}>
                    {multiplier}×
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.controlGroup}>
              <span>Inject failure</span>
              <select value={failureId} onChange={event => setFailureId(event.target.value)}>
                <option value="none">Healthy system</option>
                {scenario.failures.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>

            <div className={styles.controlGroup}>
              <span>Connections</span>
              <div className={styles.layerButtons}>
                {(['sync', 'async', 'data'] as DesignEdgeKind[]).map(kind => (
                  <button type="button" key={kind} className={visibleKinds.has(kind) ? styles.layerActive : ''} onClick={() => toggleEdgeKind(kind)}>
                    {kind === 'sync' ? 'Sync' : kind === 'async' ? 'Async' : 'Data'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.canvasWrap}>
            <ArchitectureCanvas
              scenario={scenario}
              stepIndex={stepIndex}
              failedNodeIds={failedNodeIds}
              pressureNodeIds={pressureNodeIds}
              visibleKinds={visibleKinds}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />

            <div className={styles.statusStrip}>
              <div className={`${styles.statusCard} ${traffic === 1 ? '' : styles.statusWarn}`}>
                <span>Scale simulation</span>
                <strong>{scaleTier.label}</strong>
                <p>{scaleTier.guidance}</p>
              </div>
              <div className={`${styles.statusCard} ${failure ? styles.statusFail : styles.statusHealthy}`}>
                <span>Failure mode</span>
                <strong>{failure ? failure.label : 'All components healthy'}</strong>
                <p>{failure ? failure.impact : 'Inject a realistic failure to see blast radius and recovery guidance.'}</p>
              </div>
            </div>
          </div>

          <div className={styles.player}>
            <div className={styles.playerInfo}>
              <span>Step {stepIndex + 1} of {scenario.steps.length}</span>
              <strong>{scenario.steps[stepIndex].title}</strong>
              <p>{scenario.steps[stepIndex].description}</p>
            </div>
            <div className={styles.playerControls}>
              <button type="button" onClick={() => setStepIndex(index => Math.max(0, index - 1))} disabled={stepIndex === 0}>←</button>
              <button type="button" className={styles.playButton} onClick={() => setPlaying(value => !value)}>{playing ? 'Pause' : 'Play'}</button>
              <button type="button" onClick={() => setStepIndex(index => Math.min(scenario.steps.length - 1, index + 1))} disabled={stepIndex === scenario.steps.length - 1}>→</button>
              <select value={speed} onChange={event => setSpeed(Number(event.target.value))} aria-label="playback speed">
                <option value={0.75}>0.75×</option>
                <option value={1}>1×</option>
                <option value={1.5}>1.5×</option>
                <option value={2}>2×</option>
              </select>
            </div>
            <input
              className={styles.timeline}
              type="range"
              min={0}
              max={scenario.steps.length - 1}
              value={stepIndex}
              onChange={event => setStepIndex(Number(event.target.value))}
              aria-label="system design step"
            />
          </div>
        </section>

        <aside className={styles.inspector}>
          <div className={styles.tabs}>
            <button type="button" className={activeTab === 'guide' ? styles.tabActive : ''} onClick={() => setActiveTab('guide')}>Guide</button>
            <button type="button" className={activeTab === 'requirements' ? styles.tabActive : ''} onClick={() => setActiveTab('requirements')}>Design</button>
            <button type="button" className={activeTab === 'tradeoffs' ? styles.tabActive : ''} onClick={() => setActiveTab('tradeoffs')}>Trade-offs</button>
          </div>

          {activeTab === 'guide' ? (
            <div className={styles.inspectorBody}>
              <section className={styles.infoSection}>
                <span className={styles.sectionLabel}>What to notice</span>
                <h2>{scenario.steps[stepIndex].title}</h2>
                <p>{scenario.steps[stepIndex].description}</p>
              </section>

              {selectedNode ? (
                <section className={`${styles.infoSection} ${styles.nodeDetail}`}>
                  <div className={styles.nodeDetailHead}>
                    <span className={styles.nodeDetailIcon}>{nodeIcon(selectedNode)}</span>
                    <div><strong>{selectedNode.label}</strong><small>{selectedNode.subtitle}</small></div>
                    <button type="button" onClick={() => setSelectedNodeId(null)} aria-label="close component details">×</button>
                  </div>
                  <p>{selectedNode.details}</p>
                </section>
              ) : (
                <section className={styles.tipCard}>
                  <strong>Inspect the diagram</strong>
                  <p>Click any component to see why it exists and what responsibility it owns.</p>
                </section>
              )}

              {failure ? (
                <section className={styles.recoveryCard}>
                  <span>Recovery path</span>
                  <p>{failure.recovery}</p>
                </section>
              ) : null}

              <section className={styles.infoSection}>
                <span className={styles.sectionLabel}>Production signals</span>
                <ul>{scenario.metrics.map(item => <li key={item}>{item}</li>)}</ul>
              </section>
            </div>
          ) : null}

          {activeTab === 'requirements' ? (
            <div className={styles.inspectorBody}>
              <section className={styles.infoSection}>
                <span className={styles.sectionLabel}>Requirements</span>
                <ul>{scenario.requirements.map(item => <li key={item}>{item}</li>)}</ul>
              </section>
              <section className={styles.infoSection}>
                <span className={styles.sectionLabel}>Scale assumptions</span>
                <ul>{scenario.scale.map(item => <li key={item}>{item}</li>)}</ul>
              </section>
              <section className={styles.infoSection}>
                <span className={styles.sectionLabel}>Key decisions</span>
                <ol>{scenario.decisions.map(item => <li key={item}>{item}</li>)}</ol>
              </section>
            </div>
          ) : null}

          {activeTab === 'tradeoffs' ? (
            <div className={styles.inspectorBody}>
              <section className={styles.infoSection}>
                <span className={styles.sectionLabel}>Architecture trade-offs</span>
                <div className={styles.tradeoffList}>
                  {scenario.tradeoffs.map((item, index) => (
                    <article key={item}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <p>{item}</p>
                    </article>
                  ))}
                </div>
              </section>
              <section className={styles.interviewCard}>
                <span>Senior / Staff prompt</span>
                <strong>What breaks next?</strong>
                <p>Change traffic to 10× or 100×, inject a failure, then explain the smallest architecture change that satisfies the new requirement.</p>
              </section>
            </div>
          ) : null}
        </aside>
      </main>
      )}
    </div>
  )
}
