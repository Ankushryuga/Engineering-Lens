import { useMemo } from 'react'
import { Step } from '@/types'
import styles from './DeliveryRouteViz.module.css'

interface DeliveryRouteVizProps {
  step: Step | null
  allSteps: Step[]
  currentIndex: number
  algorithmName: string
}

interface DeliveryState {
  nodes: string[]
  edges: [string, string, number?][]
  source?: string
  current?: string
  activeEdge?: [string, string | null]
  distances: Record<string, number | string>
  visited: Set<string>
  visitOrder: string[]
  path: string[]
  finalPath: string[]
}

const ROWS = 9
const COLS = 16

// Deterministic city texture. This is deliberately component-owned data,
// not imported from the disposable HTML mocks folder.
const BUILDINGS = new Set([
  '0:2','0:3','0:8','0:9','0:13',
  '1:2','1:6','1:9','1:13',
  '2:6','2:11','2:12',
  '3:1','3:4','3:11','3:14',
  '4:4','4:8','4:14',
  '5:2','5:8','5:12',
  '6:2','6:5','6:12','6:15',
  '7:5','7:9','7:10','7:15',
  '8:1','8:9','8:13',
])

const TRAFFIC = new Set([
  '0:6','1:7','2:7','2:8','3:8','4:9','5:9','5:10','6:10','7:11','8:11',
])

function collectState(allSteps: Step[], currentIndex: number): DeliveryState {
  let nodes: string[] = []
  let edges: [string, string, number?][] = []
  let source: string | undefined
  let current: string | undefined
  let activeEdge: [string, string | null] | undefined
  let distances: Record<string, number | string> = {}
  const visitOrder: string[] = []
  let path: string[] = []
  let finalPath: string[] = []
  const visited = new Set<string>()

  for (const item of allSteps) {
    if (item.type === 'path' && item.path?.length) finalPath = item.path
  }

  for (let i = 0; i <= currentIndex && i < allSteps.length; i++) {
    const item = allSteps[i]
    if (item.type === 'graph_init') {
      nodes = item.nodes ?? nodes
      edges = item.edges ?? edges
      source = item.source ?? source
    }
    if (item.type === 'visit' && item.node) {
      current = item.node
      visited.add(item.node)
      if (visitOrder[visitOrder.length - 1] !== item.node) visitOrder.push(item.node)
    }
    if (item.type === 'relax') activeEdge = item.edge
    if (item.distances) distances = item.distances
    if (item.path?.length) path = item.path
  }

  return { nodes, edges, source, current, activeEdge, distances, visited, visitOrder, path, finalPath }
}

function nodePositions(nodes: string[]) {
  // Spread stops through the city in a repeatable left-to-right journey.
  const anchors = [
    { r: 4, c: 0 },
    { r: 1, c: 4 },
    { r: 6, c: 5 },
    { r: 2, c: 9 },
    { r: 6, c: 11 },
    { r: 4, c: 15 },
    { r: 0, c: 15 },
    { r: 8, c: 15 },
  ]
  return new Map(nodes.map((node, index) => [node, anchors[index % anchors.length]]))
}

function edgeKey(a: string, b: string) {
  return `${a}→${b}`
}

function numericDistance(value: number | string | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function travelerPosition(state: DeliveryState, positions: Map<string, { r: number; c: number }>) {
  const pointOf = (node?: string) => {
    if (!node) return null
    const pos = positions.get(node)
    if (!pos) return null
    return { x: pos.c * 50 + 25, y: pos.r * 50 + 25 }
  }

  const currentPoint = pointOf(state.current)
  if (state.activeEdge?.[0] && state.activeEdge?.[1]) {
    const from = pointOf(state.activeEdge[0])
    const to = pointOf(state.activeEdge[1] ?? undefined)
    if (from && to) {
      return {
        x: from.x + (to.x - from.x) * 0.55,
        y: from.y + (to.y - from.y) * 0.55,
      }
    }
  }

  if (currentPoint) return currentPoint
  return pointOf(state.source)
}

export default function DeliveryRouteViz({ step, allSteps, currentIndex, algorithmName }: DeliveryRouteVizProps) {
  const state = useMemo(() => collectState(allSteps, currentIndex), [allSteps, currentIndex])
  const positions = useMemo(() => nodePositions(state.nodes), [state.nodes])
  const pathEdges = useMemo(() => {
    const set = new Set<string>()
    const route = state.path.length ? state.path : []
    for (let i = 0; i < route.length - 1; i++) {
      set.add(edgeKey(route[i], route[i + 1]))
      set.add(edgeKey(route[i + 1], route[i]))
    }
    return set
  }, [state.path])
  const finalTarget = state.finalPath[state.finalPath.length - 1] ?? state.nodes[state.nodes.length - 1]
  const routeCost = numericDistance(finalTarget ? state.distances[finalTarget] : undefined)
  const progress = allSteps.length ? Math.round(((currentIndex + 1) / allSteps.length) * 100) : 0
  const currentInfo = step?.info ?? 'The driver has not started exploring roads yet.'

  if (!state.nodes.length) return null

  const courier = travelerPosition(state, positions)

  const cells = Array.from({ length: ROWS * COLS }, (_, index) => {
    const r = Math.floor(index / COLS)
    const c = index % COLS
    const key = `${r}:${c}`
    return { r, c, key }
  })

  return (
    <div className={styles.root}>
      <div className={styles.topbar}>
        <div className={styles.identity}>
          <span className={styles.brandIcon}>🚚</span>
          <div>
            <strong>Delivery Route Finder</strong>
            <span>{algorithmName} · shortest delivery route from the hub to the customer</span>
          </div>
        </div>
        <div className={styles.liveBadge}><span /> Live trace · {progress}%</div>
      </div>

      <div className={styles.stats}>
        <div><strong>{algorithmName.replace("'s Shortest Path", '')}</strong><span>Algorithm</span></div>
        <div><strong>{state.visited.size}</strong><span>Stops explored</span></div>
        <div className={styles.routeStat}><strong>{routeCost === null ? '—' : `${routeCost} km`}</strong><span>Best route cost</span></div>
        <div><strong>{state.current ?? 'Hub'}</strong><span>Current stop</span></div>
      </div>

      <div className={styles.legend}>
        <span><i className={styles.legendHub}>🏭</i> Dispatch hub</span>
        <span><i className={styles.legendCourier}>🚶</i> Courier</span>
        <span><i className={styles.legendVisit} /> Explored stop</span>
        <span><i className={styles.legendCurrent} /> Exploring now</span>
        <span><i className={styles.legendPath} /> Final route</span>
        <span><i className={styles.legendTraffic} /> Slow traffic</span>
      </div>

      <div className={styles.cityWrap}>
        <div className={styles.city} style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {cells.map(({ key }) => (
            <div
              key={key}
              className={`${styles.cell} ${BUILDINGS.has(key) ? styles.building : ''} ${TRAFFIC.has(key) ? styles.traffic : ''}`}
            >
              {BUILDINGS.has(key) ? '🏢' : ''}
            </div>
          ))}

          <svg className={styles.roads} viewBox={`0 0 ${COLS * 50} ${ROWS * 50}`} preserveAspectRatio="none" aria-hidden="true">
            {state.edges.map(([from, to, weight], index) => {
              const a = positions.get(from)
              const b = positions.get(to)
              if (!a || !b) return null
              const active = state.activeEdge?.[0] === from && state.activeEdge?.[1] === to
              const chosen = pathEdges.has(edgeKey(from, to))
              const x1 = a.c * 50 + 25
              const y1 = a.r * 50 + 25
              const x2 = b.c * 50 + 25
              const y2 = b.r * 50 + 25
              return (
                <g key={`${from}-${to}-${index}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} className={chosen ? styles.roadPath : active ? styles.roadActive : styles.road} />
                  {weight !== undefined && (
                    <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 7} className={styles.roadCost}>{weight} km</text>
                  )}
                </g>
              )
            })}
            {courier ? (
              <g transform={`translate(${courier.x}, ${courier.y - 36})`} aria-hidden="true">
                <circle r="16" className={styles.courierHalo} />
                <text y="6" textAnchor="middle" className={styles.courierEmoji}>🚶</text>
              </g>
            ) : null}
          </svg>

          {state.nodes.map(node => {
            const pos = positions.get(node)
            if (!pos) return null
            const isSource = node === state.source
            const isTarget = node === finalTarget
            const isCurrent = node === state.current
            const isVisited = state.visited.has(node)
            const isPath = state.path.includes(node)
            const distance = state.distances[node]
            return (
              <div
                key={node}
                className={`${styles.stop} ${isVisited ? styles.stopVisited : ''} ${isCurrent ? styles.stopCurrent : ''} ${isPath ? styles.stopPath : ''}`}
                style={{ gridColumn: pos.c + 1, gridRow: pos.r + 1 }}
              >
                <span className={styles.stopIcon}>{isSource ? '🏭' : isTarget ? '📦' : '📍'}</span>
                <strong>{node}</strong>
                <small>{numericDistance(distance) === null ? (isSource ? '0 km' : 'not reached') : `${distance} km`}</small>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.status} aria-live="polite">
        <span className={styles.statusDot} />
        <div>
          <strong>{step?.type === 'path' || step?.type === 'done' ? 'Route ready' : 'Dispatcher update'}</strong>
          <span>{currentInfo}</span>
        </div>
      </div>
      <p className={styles.note}>The disposable HTML mock is not used at runtime. This React scene is driven by the algorithm trace: visited stops, relaxed roads, distances, and the final path.</p>
    </div>
  )
}
