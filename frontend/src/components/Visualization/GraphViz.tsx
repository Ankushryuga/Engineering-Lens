import { useMemo } from 'react'
import { Step } from '@/types'
import styles from './GraphViz.module.css'

interface GraphVizProps {
  step: Step | null
  allSteps: Step[]
  currentIndex: number
}

interface LayoutNode {
  id: string
  x: number
  y: number
}

/** Arrange nodes evenly around a circle — generic, works for any graph shape. */
function computeLayout(nodes: string[], width: number, height: number): Map<string, LayoutNode> {
  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(width, height) / 2 - 48
  const layout = new Map<string, LayoutNode>()
  nodes.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1) - Math.PI / 2
    layout.set(id, {
      id,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    })
  })
  return layout
}

/** Accumulate graph state (nodes/edges/source/distances/current/path) by
 * scanning every step up to and including currentIndex — each step only
 * carries incremental info, so the visualization needs the running total. */
function accumulateState(allSteps: Step[], currentIndex: number) {
  let nodes: string[] = []
  let edges: [string, string, number?][] = []
  let source: string | undefined
  let distances: Record<string, number | string> = {}
  let current: string | undefined
  let currentEdge: [string, string | null] | undefined
  let path: string[] | undefined
  const visited = new Set<string>()

  for (let i = 0; i <= currentIndex && i < allSteps.length; i++) {
    const s = allSteps[i]
    if (s.type === 'graph_init') {
      nodes = s.nodes ?? []
      edges = s.edges ?? []
      source = s.source
    }
    if (s.type === 'visit' && s.node) {
      current = s.node
      visited.add(s.node)
      currentEdge = undefined
    }
    if (s.type === 'relax' && s.edge) {
      currentEdge = s.edge
    }
    if (s.distances) {
      distances = s.distances
    }
    if (s.type === 'path' && s.path) {
      path = s.path
    }
  }

  return { nodes, edges, source, distances, current, currentEdge, path, visited }
}

const WIDTH = 480
const HEIGHT = 320

export default function GraphViz({ step, allSteps, currentIndex }: GraphVizProps) {
  const state = useMemo(
    () => accumulateState(allSteps, currentIndex),
    [allSteps, currentIndex]
  )
  const layout = useMemo(
    () => computeLayout(state.nodes, WIDTH, HEIGHT),
    [state.nodes]
  )

  if (state.nodes.length === 0) {
    return (
      <div className={styles.empty}>
        <span>no graph data in this step</span>
      </div>
    )
  }

  const pathEdgeSet = new Set<string>()
  if (state.path) {
    for (let i = 0; i < state.path.length - 1; i++) {
      pathEdgeSet.add(`${state.path[i]}->${state.path[i + 1]}`)
    }
  }

  const isPathStep = step?.type === 'path' || step?.type === 'done'

  return (
    <div className={styles.root}>
      <div className={styles.canvasWrap}>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.svg}>
          {/* Edges */}
          {state.edges.map(([from, to, weight], i) => {
            const a = layout.get(from)
            const b = layout.get(to)
            if (!a || !b) return null
            const key = `${from}->${to}`
            const onPath = isPathStep && pathEdgeSet.has(key)
            const isCurrent = state.currentEdge && state.currentEdge[0] === from && state.currentEdge[1] === to
            const midX = (a.x + b.x) / 2
            const midY = (a.y + b.y) / 2
            return (
              <g key={i}>
                <line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  className={
                    onPath ? styles.edgePath : isCurrent ? styles.edgeActive : styles.edge
                  }
                  markerEnd={onPath ? 'url(#arrowPath)' : isCurrent ? 'url(#arrowActive)' : 'url(#arrow)'}
                />
                {weight !== undefined ? (
                  <>
                    <rect x={midX - 10} y={midY - 8} width={20} height={14} className={styles.weightBg} />
                    <text x={midX} y={midY + 3} className={styles.weightLabel} textAnchor="middle">{weight}</text>
                  </>
                ) : null}
              </g>
            )
          })}

          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className={styles.arrowFill} />
            </marker>
            <marker id="arrowActive" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className={styles.arrowActiveFill} />
            </marker>
            <marker id="arrowPath" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className={styles.arrowPathFill} />
            </marker>
          </defs>

          {/* Nodes */}
          {state.nodes.map(id => {
            const pos = layout.get(id)
            if (!pos) return null
            const isSource = id === state.source
            const isCurrent = id === state.current
            const isVisited = state.visited.has(id)
            const onPath = isPathStep && state.path?.includes(id)
            const dist = state.distances[id]

            let nodeClass = styles.node
            if (onPath) nodeClass = styles.nodePath
            else if (isCurrent) nodeClass = styles.nodeCurrent
            else if (isVisited) nodeClass = styles.nodeVisited

            return (
              <g key={id}>
                <circle cx={pos.x} cy={pos.y} r={20} className={nodeClass} />
                {isSource && <circle cx={pos.x} cy={pos.y} r={26} className={styles.sourceRing} />}
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" className={styles.nodeLabel}>{id}</text>
                {dist !== undefined && (
                  <text x={pos.x} y={pos.y + 38} textAnchor="middle" className={styles.distLabel}>
                    {dist === Infinity ? '∞' : dist}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className={styles.legend}>
        <span><span className={styles.dotSource} /> source</span>
        <span><span className={styles.dotCurrent} /> current</span>
        <span><span className={styles.dotVisited} /> visited</span>
        <span><span className={styles.dotPath} /> shortest path</span>
      </div>

      {step?.info ? <div className={styles.status}>{step.info}</div> : null}
    </div>
  )
}
