import { useMemo } from 'react'
import { Step } from '@/types'
import styles from './LinkedListViz.module.css'

interface LinkedListVizProps {
  step: Step | null
  allSteps: Step[]
  currentIndex: number
}

function accumulateState(allSteps: Step[], currentIndex: number) {
  let singleNodes: string[] | null = null
  let lists: Record<string, string[]> | null = null
  let next: Record<string, string | null> = {}
  let pointers: Record<string, string | null> = {}
  let merged: string[] | null = null
  let path: string[] | undefined
  const visitedOrder: string[] = []
  const seen = new Set<string>()

  for (let i = 0; i <= currentIndex && i < allSteps.length; i++) {
    const s = allSteps[i]
    if (s.type === 'list_init') {
      if (s.nodes) singleNodes = s.nodes
      if (s.lists) lists = s.lists
      if (s.next) next = { ...s.next }
    }
    if (s.type === 'relax' && s.edge) {
      const [from, to] = s.edge
      next = { ...next, [from]: to }
    }
    if (s.type === 'visit') {
      if (s.pointers) pointers = s.pointers
      if (s.node && !seen.has(s.node)) {
        seen.add(s.node)
        visitedOrder.push(s.node)
      }
      if (s.merged) merged = s.merged
    }
    if (s.type === 'path' && s.path) {
      path = s.path
    }
  }

  return { singleNodes, lists, next, pointers, merged, path, visitedOrder }
}

function Chain({
  rowLabel,
  nodeIds,
  next,
  pointers,
  visitedSet,
  pathSet,
  highlightLast,
}: {
  rowLabel?: string
  nodeIds: string[]
  next: Record<string, string | null>
  pointers: Record<string, string | null>
  visitedSet: Set<string>
  pathSet: Set<string>
  highlightLast?: boolean
}) {
  const pointerByNode = new Map<string, string[]>()
  for (const [label, nodeId] of Object.entries(pointers)) {
    if (!nodeId) continue
    if (!pointerByNode.has(nodeId)) pointerByNode.set(nodeId, [])
    pointerByNode.get(nodeId)!.push(label)
  }

  return (
    <div className={styles.row}>
      {rowLabel && <div className={styles.rowLabel}>{rowLabel}</div>}
      <div className={styles.chain}>
        {nodeIds.map((id, i) => {
          const isVisited = visitedSet.has(id)
          const onPath = pathSet.has(id)
          const pointerLabels = pointerByNode.get(id) ?? []
          const isReversedTarget = next[id] !== undefined && i > 0 && next[id] === nodeIds[i - 1]

          let nodeClass = styles.node
          if (onPath) nodeClass = styles.nodePath
          else if (pointerLabels.length > 0) nodeClass = styles.nodeCurrent
          else if (isVisited) nodeClass = styles.nodeVisited

          return (
            <div key={id} className={styles.nodeWrap}>
              <div className={nodeClass}>
                <span className={styles.nodeText}>{id}</span>
                {pointerLabels.length > 0 && (
                  <div className={styles.pointerLabels}>
                    {pointerLabels.map(l => (
                      <span key={l} className={styles.pointerTag}>{l}</span>
                    ))}
                  </div>
                )}
              </div>
              {i < nodeIds.length - 1 && (
                <div className={isReversedTarget ? styles.arrowReversed : styles.arrow}>
                  {isReversedTarget ? '←' : '→'}
                </div>
              )}
            </div>
          )
        })}
        {highlightLast && <span className={styles.nullTag}>null</span>}
      </div>
    </div>
  )
}

export default function LinkedListViz({ step, allSteps, currentIndex }: LinkedListVizProps) {
  const state = useMemo(() => accumulateState(allSteps, currentIndex), [allSteps, currentIndex])

  const isPathStep = step?.type === 'path' || step?.type === 'done'
  const pathSet = new Set(isPathStep ? state.path ?? [] : [])
  const visitedSet = new Set(state.visitedOrder)

  if (!state.singleNodes && !state.lists) {
    return (
      <div className={styles.empty}>
        <span>no linked-list data in this step</span>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.canvasWrap}>
        {state.lists && Object.entries(state.lists).map(([label, ids]) => (
          <Chain
            key={label}
            rowLabel={label}
            nodeIds={ids}
            next={state.next}
            pointers={state.pointers}
            visitedSet={visitedSet}
            pathSet={pathSet}
            highlightLast
          />
        ))}

        {state.merged && (
          <Chain
            rowLabel="Merged"
            nodeIds={state.merged}
            next={{}}
            pointers={{}}
            visitedSet={new Set()}
            pathSet={isPathStep ? pathSet : new Set()}
          />
        )}

        {state.singleNodes && (
          <Chain
            nodeIds={state.singleNodes}
            next={state.next}
            pointers={state.pointers}
            visitedSet={visitedSet}
            pathSet={pathSet}
            highlightLast
          />
        )}
      </div>

      <div className={styles.legend}>
        <span><span className={styles.dotCurrent} /> pointer</span>
        <span><span className={styles.dotVisited} /> visited</span>
        <span><span className={styles.dotPath} /> result order</span>
      </div>

      {step && <div className={styles.status}>{step.info}</div>}
    </div>
  )
}
