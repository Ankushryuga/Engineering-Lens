import { useMemo } from 'react'
import { Step } from '@/types'
import styles from './PathfindingGridViz.module.css'

interface PathfindingGridVizProps {
  step: Step | null
  allSteps: Step[]
  currentIndex: number
  algorithmName: string
}

interface GridState {
  grid: number[][]
  start?: [number, number]
  goal?: [number, number]
  current?: [number, number]
  visited: Set<string>
  frontier: Set<string>
  path: Set<string>
  pathCells: [number, number][]
  pathLength: number
  pathCost: number | null
}

const keyOf = (cell: [number, number]) => `${cell[0]}:${cell[1]}`

function sameCell(a?: [number, number], b?: [number, number]) {
  return Boolean(a && b && a[0] === b[0] && a[1] === b[1])
}

function weightedPathCost(grid: number[][], path: [number, number][]) {
  if (path.length < 2) return path.length === 1 ? 0 : null
  let total = 0
  for (let i = 1; i < path.length; i++) {
    const [r, c] = path[i]
    const weight = grid[r]?.[c]
    if (typeof weight !== 'number' || weight < 0) return null
    total += weight
  }
  return total
}

function collectGridState(allSteps: Step[], currentIndex: number): GridState {
  let grid: number[][] = []
  let start: [number, number] | undefined
  let goal: [number, number] | undefined
  let current: [number, number] | undefined
  let currentPath: [number, number][] = []
  const visited = new Set<string>()
  const frontier = new Set<string>()

  for (let i = 0; i <= currentIndex && i < allSteps.length; i++) {
    const item = allSteps[i]
    if (item.type === 'grid_init') {
      grid = item.grid ?? grid
      start = item.start_cell ?? start
      goal = item.goal_cell ?? goal
    }

    if (item.type === 'visit' && item.cell) {
      current = item.cell
      const key = keyOf(item.cell)
      visited.add(key)
      frontier.delete(key)
    }

    if (item.type === 'relax' && item.to_cell) {
      current = item.to_cell
      const key = keyOf(item.to_cell)
      if (!visited.has(key)) frontier.add(key)
    }

    if (item.type === 'path' && item.grid_path) {
      currentPath = item.grid_path
      current = item.cell ?? currentPath[currentPath.length - 1] ?? current
    }

    if (item.type === 'done' && item.grid_path) {
      currentPath = item.grid_path
      current = item.cell ?? goal ?? current
    }
  }

  return {
    grid,
    start,
    goal,
    current,
    visited,
    frontier,
    path: new Set(currentPath.map(keyOf)),
    pathCells: currentPath,
    pathLength: Math.max(0, currentPath.length - 1),
    pathCost: weightedPathCost(grid, currentPath),
  }
}

function trafficLabel(weight: number) {
  if (weight >= 5) return 'very heavy traffic'
  if (weight === 4) return 'heavy traffic'
  if (weight === 3) return 'moderate traffic'
  if (weight === 2) return 'light traffic'
  return 'clear street'
}

function straightLineBaseline(grid: number[][], start?: [number, number], goal?: [number, number]) {
  if (!start || !goal) return null
  const cells: [number, number][] = []
  if (start[0] === goal[0]) {
    const step = start[1] <= goal[1] ? 1 : -1
    for (let c = start[1]; c !== goal[1] + step; c += step) cells.push([start[0], c])
  } else if (start[1] === goal[1]) {
    const step = start[0] <= goal[0] ? 1 : -1
    for (let r = start[0]; r !== goal[0] + step; r += step) cells.push([r, start[1]])
  } else {
    return null
  }
  if (cells.some(([r, c]) => (grid[r]?.[c] ?? -1) < 0)) return null
  return { blocks: Math.max(0, cells.length - 1), cost: weightedPathCost(grid, cells) }
}

export default function PathfindingGridViz({ step, allSteps, currentIndex, algorithmName }: PathfindingGridVizProps) {
  const state = useMemo(() => collectGridState(allSteps, currentIndex), [allSteps, currentIndex])
  const rows = state.grid.length
  const cols = state.grid[0]?.length ?? 0
  const progress = allSteps.length ? Math.round(((currentIndex + 1) / allSteps.length) * 100) : 0
  const routePhase = step?.type === 'path' || step?.type === 'done'
  const done = step?.type === 'done'

  if (!rows || !cols) {
    return (
      <div className={styles.root}>
        <div className={styles.compatibilityNotice} role="status">
          <span>🧭</span>
          <div>
            <strong>Waiting for weighted-grid trace data</strong>
            <p>This run used an older trace format. The lesson will automatically use its compatible route view instead of leaving the visualization blank.</p>
          </div>
        </div>
      </div>
    )
  }

  const currentWeight = state.current ? state.grid[state.current[0]]?.[state.current[1]] : undefined
  const currentLabel = state.current ? `row ${state.current[0] + 1}, column ${state.current[1] + 1}` : 'dispatch hub'
  const algorithmLabel = algorithmName === 'A* Search' ? 'A*' : 'Dijkstra'
  const straightBaseline = straightLineBaseline(state.grid, state.start, state.goal)
  const beatsStraightLine = Boolean(
    straightBaseline && state.pathCost !== null && straightBaseline.cost !== null && state.pathCost < straightBaseline.cost
  )

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <div className={styles.identity}>
          <span className={styles.mapIcon}>🗺️</span>
          <div>
            <strong>Delivery Route Finder</strong>
            <span>{algorithmName} on a weighted city grid</span>
          </div>
        </div>
        <span className={styles.live}>Live trace · {progress}%</span>
      </div>

      <div className={styles.stats}>
        <div><strong>{algorithmLabel}</strong><span>Algorithm</span></div>
        <div><strong>{state.pathLength || '—'}</strong><span>Route blocks</span></div>
        <div className={styles.costStat}><strong>{state.pathCost === null ? '—' : state.pathCost}</strong><span>Weighted cost</span></div>
        <div><strong>{state.visited.size}</strong><span>Blocks scanned</span></div>
      </div>

      <div className={styles.legend}>
        <span><i className={styles.legendBuilding}>🏢</i> Building</span>
        <span><i className={styles.legendTraffic} /> Traffic</span>
        <span><i className={styles.legendScanned} /> {routePhase ? 'Explored earlier' : 'Scanned'}</span>
        {!routePhase ? <span><i className={styles.legendFrontier} /> Next to inspect</span> : null}
        <span><i className={styles.legendRoute} /> {routePhase ? 'Chosen route' : 'Route as confirmed'}</span>
        <span><i className={styles.legendCourier}>🚶</i> Courier</span>
      </div>

      <div className={`${styles.gridScroller} ${routePhase ? styles.routeFocused : ''}`}>
        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          role="img"
          aria-label={`${algorithmName} weighted pathfinding grid with ${rows} rows and ${cols} columns`}
        >
          {state.grid.flatMap((row, r) => row.map((weight, c) => {
            const cell: [number, number] = [r, c]
            const key = keyOf(cell)
            const isWall = weight < 0
            const isStart = sameCell(cell, state.start)
            const isGoal = sameCell(cell, state.goal)
            const isCurrent = sameCell(cell, state.current)
            const isPath = state.path.has(key)
            const isVisited = state.visited.has(key)
            const isFrontier = !routePhase && state.frontier.has(key)
            const trafficClass = weight >= 5
              ? styles.traffic5
              : weight === 4
                ? styles.traffic4
                : weight === 3
                  ? styles.traffic3
                  : weight === 2
                    ? styles.traffic2
                    : ''

            const className = [
              styles.cell,
              trafficClass,
              isWall ? styles.wall : '',
              isVisited && !isWall ? (routePhase && !isPath ? styles.visitedFaded : styles.visited) : '',
              isFrontier && !isWall ? styles.frontier : '',
              isPath && !isWall ? styles.path : '',
              isStart ? styles.start : '',
              isGoal ? styles.goal : '',
              isCurrent ? styles.current : '',
            ].filter(Boolean).join(' ')

            return (
              <div
                key={key}
                className={className}
                title={isWall ? `Block ${r + 1}, ${c + 1}: building` : `Block ${r + 1}, ${c + 1}: ${trafficLabel(weight)}`}
              >
                {isWall ? <span className={styles.cellIcon}>🏢</span> : null}
                {isStart ? <span className={styles.cellIcon}>🏭</span> : null}
                {isGoal ? <span className={styles.cellIcon}>📍</span> : null}
                {isCurrent ? (
                  <span className={`${styles.courier} ${isGoal ? styles.courierAtGoal : ''}`} aria-hidden="true">🚶</span>
                ) : null}
              </div>
            )
          }))}
        </div>
      </div>

      {done ? (
        <div className={styles.resultSummary}>
          <span className={styles.resultIcon}>✓</span>
          <div>
            <strong>Why this route wins</strong>
            <span>
              {beatsStraightLine && straightBaseline ? (
                <>The straight {straightBaseline.blocks}-block route costs {straightBaseline.cost} because of traffic, while the chosen {state.pathLength}-block route costs only {state.pathCost}. </>
              ) : (
                <>{algorithmLabel} selected {state.pathLength} blocks with weighted cost {state.pathCost ?? '—'}. </>
              )}
              It scanned {state.visited.size} blocks before settling the customer; cells still waiting in the frontier are no longer needed.
            </span>
          </div>
        </div>
      ) : null}

      <div className={styles.status} aria-live="polite">
        <span className={styles.statusDot} />
        <div>
          <strong>{done ? 'Delivery complete' : step?.type === 'path' ? 'Following confirmed route' : 'Courier is exploring'}</strong>
          <span>{step?.info ?? `Currently at ${currentLabel}${currentWeight && currentWeight > 1 ? ` through ${trafficLabel(currentWeight)}` : ''}.`}</span>
        </div>
      </div>
    </div>
  )
}
