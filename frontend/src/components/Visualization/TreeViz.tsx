import { useMemo } from 'react'
import { Step } from '@/types'
import styles from './TreeViz.module.css'

interface TreeVizProps {
  step: Step | null
  allSteps: Step[]
  currentIndex: number
}

interface LayoutNode {
  id: string
  x: number
  y: number
  depth: number
}

/** Classic tree layout: x position by in-order leaf sequence, y by depth. */
function computeTreeLayout(
  root: string,
  children: Map<string, string[]>,
  width: number
): Map<string, LayoutNode> {
  const layout = new Map<string, LayoutNode>()
  let nextX = 0

  const NODE_GAP = 64
  const LEVEL_GAP = 64

  function assign(id: string, depth: number): number {
    const kids = children.get(id) ?? []
    if (kids.length === 0) {
      const x = nextX * NODE_GAP
      nextX++
      layout.set(id, { id, x, y: depth * LEVEL_GAP + 40, depth })
      return x
    }
    const childXs = kids.map(k => assign(k, depth + 1))
    const x = childXs.reduce((a, b) => a + b, 0) / childXs.length
    layout.set(id, { id, x, y: depth * LEVEL_GAP + 40, depth })
    return x
  }

  assign(root, 0)

  // Center horizontally within `width`.
  const xs = Array.from(layout.values()).map(n => n.x)
  const minX = Math.min(...xs, 0)
  const maxX = Math.max(...xs, 0)
  const treeWidth = maxX - minX
  const offset = (width - treeWidth) / 2 - minX
  for (const n of layout.values()) n.x += offset

  return layout
}

function accumulateState(allSteps: Step[], currentIndex: number) {
  let nodes: string[] = []
  let edges: [string, string, number?][] = []
  let root: string | undefined
  let current: string | undefined
  let path: string[] | undefined
  let highlightNode: string | undefined
  const order: string[] = []
  const visited = new Set<string>()

  for (let i = 0; i <= currentIndex && i < allSteps.length; i++) {
    const s = allSteps[i]
    if (s.type === 'tree_init') {
      nodes = s.nodes ?? []
      edges = s.edges ?? []
      root = s.source
    }
    if (s.type === 'visit' && s.node) {
      current = s.node
      if (!visited.has(s.node)) order.push(s.node)
      visited.add(s.node)
    }
    if (s.type === 'path' && s.path) {
      path = s.path
      highlightNode = s.node
    }
  }

  return { nodes, edges, root, current, path, highlightNode, visited, order }
}

const WIDTH = 480

export default function TreeViz({ step, allSteps, currentIndex }: TreeVizProps) {
  const state = useMemo(() => accumulateState(allSteps, currentIndex), [allSteps, currentIndex])

  const children = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const [parent, child] of state.edges) {
      if (!map.has(parent)) map.set(parent, [])
      map.get(parent)!.push(child)
    }
    return map
  }, [state.edges])

  const layout = useMemo(() => {
    if (!state.root) return new Map<string, LayoutNode>()
    return computeTreeLayout(state.root, children, WIDTH)
  }, [state.root, children])

  if (state.nodes.length === 0 || !state.root) {
    return (
      <div className={styles.empty}>
        <span>no tree data in this step</span>
      </div>
    )
  }

  const height = Math.max(...Array.from(layout.values()).map(n => n.y), 0) + 50
  const isPathStep = step?.type === 'path' || step?.type === 'done'
  const pathSet = new Set(isPathStep ? state.path ?? [] : [])

  const pathEdgeSet = new Set<string>()
  if (isPathStep && state.path) {
    for (let i = 0; i < state.path.length - 1; i++) {
      pathEdgeSet.add(`${state.path[i]}->${state.path[i + 1]}`)
      pathEdgeSet.add(`${state.path[i + 1]}->${state.path[i]}`)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.canvasWrap}>
        <svg viewBox={`0 0 ${WIDTH} ${height}`} className={styles.svg}>
          {/* Edges */}
          {state.edges.map(([parent, child], i) => {
            const a = layout.get(parent)
            const b = layout.get(child)
            if (!a || !b) return null
            const onPath = pathEdgeSet.has(`${parent}->${child}`)
            return (
              <line
                key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                className={onPath ? styles.edgePath : styles.edge}
              />
            )
          })}

          {/* Nodes */}
          {state.nodes.map(id => {
            const pos = layout.get(id)
            if (!pos) return null
            const isRoot = id === state.root
            const isCurrent = id === state.current
            const isVisited = state.visited.has(id)
            const onPath = pathSet.has(id)
            const isHighlight = id === state.highlightNode

            let nodeClass = styles.node
            if (isHighlight) nodeClass = styles.nodeHighlight
            else if (onPath) nodeClass = styles.nodePath
            else if (isCurrent) nodeClass = styles.nodeCurrent
            else if (isVisited) nodeClass = styles.nodeVisited

            return (
              <g key={id}>
                <circle cx={pos.x} cy={pos.y} r={18} className={nodeClass} />
                {isRoot && <circle cx={pos.x} cy={pos.y} r={24} className={styles.rootRing} />}
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" className={styles.nodeLabel}>
                  {id.length > 6 ? id.slice(0, 5) + '…' : id}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className={styles.legend}>
        <span><span className={styles.dotRoot} /> root</span>
        <span><span className={styles.dotCurrent} /> current</span>
        <span><span className={styles.dotVisited} /> visited</span>
        <span><span className={styles.dotPath} /> result path</span>
      </div>

      {step && <div className={styles.status}>{step.info}</div>}
    </div>
  )
}
