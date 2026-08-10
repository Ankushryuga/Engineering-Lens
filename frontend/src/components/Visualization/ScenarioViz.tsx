import { useMemo } from 'react'
import { RenderType, Step, TemplateSolution } from '@/types'
import { getScenario, inferScenarioCategory, inferScenarioName, ScenarioDefinition } from '@/data/scenarios'
import styles from './ScenarioViz.module.css'

interface ScenarioVizProps {
  step: Step | null
  allSteps: Step[]
  currentIndex: number
  renderType: RenderType
  template: TemplateSolution | null
  code: string
}

interface NetworkState {
  nodes: string[]
  edges: [string, string, number?][]
  current?: string
  path: string[]
  visited: Set<string>
}

function latestArray(allSteps: Step[], currentIndex: number): (number | string)[] {
  for (let i = Math.min(currentIndex, allSteps.length - 1); i >= 0; i--) {
    if (allSteps[i].array) return allSteps[i].array ?? []
  }
  return []
}

function accumulateNetwork(allSteps: Step[], currentIndex: number): NetworkState {
  let nodes: string[] = []
  let edges: [string, string, number?][] = []
  let current: string | undefined
  let path: string[] = []
  const visited = new Set<string>()

  for (let i = 0; i <= currentIndex && i < allSteps.length; i++) {
    const item = allSteps[i]
    if (item.type === 'graph_init' || item.type === 'tree_init') {
      nodes = item.nodes ?? nodes
      edges = item.edges ?? edges
    }
    if (item.type === 'visit' && item.node) {
      current = item.node
      visited.add(item.node)
    }
    if (item.path) path = item.path
  }

  return { nodes, edges, current, path, visited }
}

function accumulateList(allSteps: Step[], currentIndex: number) {
  let nodes: string[] = []
  let lists: Record<string, string[]> = {}
  let pointers: Record<string, string | null> = {}
  let merged: string[] = []
  const visited = new Set<string>()

  for (let i = 0; i <= currentIndex && i < allSteps.length; i++) {
    const item = allSteps[i]
    if (item.type === 'list_init') {
      nodes = item.nodes ?? nodes
      lists = item.lists ?? lists
    }
    if (item.type === 'visit') {
      pointers = item.pointers ?? pointers
      if (item.node) visited.add(item.node)
      merged = item.merged ?? merged
    }
    if (item.path) merged = item.path
  }

  return { nodes, lists, pointers, merged, visited }
}

function objectLabel(scenario: ScenarioDefinition, category: string | undefined, value: number | string, index: number): string {
  switch (scenario.title) {
    case 'Warehouse Sorting Line': return `${value} kg package`
    case 'Picking the Lightest Item First': return `${value} kg grocery`
    case 'Sorting a Hand of Playing Cards': return `Card ${value}`
    case 'Merging Two Sorted Bookshelves': return `Book ${value}`
    case 'Splitting a Crowd by a Reference Height': return `${value} cm person`
    case 'Emergency Room Re-Triage': return `Urgency ${value}`
    case 'Tallying Election Ballots': return `Ballot group ${value}`
    case 'Sorting Mail by Postal Code': return `Postal code ${value}`
    case 'Looking Up a Word in a Dictionary': return `Page ${value}`
    case 'Digging Through an Unsorted Bag': return `Bag item ${value}`
    case 'Tuning a Radio Dial to Peak Signal': return `Dial ${value}`
  }

  switch (category) {
    case 'Sorting': return `Item ${value}`
    case 'Searching': return `Place ${value}`
    case 'Heaps & Priority Queues': return `Priority ${value}`
    case 'Dynamic Programming': return `Choice ${index + 1}: ${value}`
    case 'Greedy': return `Option ${value}`
    case 'Strings': return `Character ${value}`
    case 'Math & Bit Manipulation': return `Value ${value}`
    default: return String(value)
  }
}

function actionText(step: Step | null, scenario: ScenarioDefinition, category?: string): string {
  if (!step) return `Ready to explore: ${scenario.sub}`
  const indices = step.indices ?? []
  const node = step.node ? ` ${step.node}` : ''

  switch (step.type) {
    case 'compare':
      if (category === 'Sorting') return `The worker compares packages ${indices.map(i => i + 1).join(' and ')} before deciding their loading order.`
      if (category === 'Searching') return `We check the next likely place instead of scanning everything blindly.`
      return 'Two real-world choices are being compared before the next move.'
    case 'swap': return 'Those two items switch positions because their current order is not the best one.'
    case 'set': return 'This choice is saved because it improves the current plan.'
    case 'visit': return `We have reached${node || ' the next place'} and can now decide where to go next.`
    case 'relax': return 'A better connection has been found, so the current route estimate is updated.'
    case 'path': return 'The useful route or final sequence is now confirmed.'
    case 'done': return `Finished — the ${scenario.title.toLowerCase()} is resolved.`
    case 'call': return 'We break the problem into a smaller version of the same everyday task.'
    case 'return': return 'That smaller task is solved, so its answer is reused by the larger task.'
    case 'highlight': return 'The real-world process advances to its next decision or action.'
    default: return step.info || `Working through: ${scenario.sub}`
  }
}

function ProcessScenario({ allSteps, currentIndex, scenario }: {
  allSteps: Step[]
  currentIndex: number
  scenario: ScenarioDefinition
}) {
  const total = Math.max(allSteps.length - 1, 1)
  const progress = Math.min(1, Math.max(0, currentIndex / total))
  const stages = [
    { icon: scenario.icon, label: 'Set up the situation' },
    { icon: '👀', label: 'Try the next useful move' },
    { icon: '🧠', label: 'Update the plan from what happened' },
    { icon: '✅', label: 'Reach the outcome' },
  ]
  const activeStage = Math.min(stages.length - 1, Math.floor(progress * stages.length))

  return (
    <div className={styles.processScene}>
      <div className={styles.processLabel}>Everyday task progress</div>
      <div className={styles.processStages}>
        {stages.map((stage, index) => (
          <div
            key={stage.label}
            className={`${styles.processStage} ${index < activeStage ? styles.processDone : ''} ${index === activeStage ? styles.processActive : ''}`}
          >
            <span>{stage.icon}</span>
            <strong>{stage.label}</strong>
          </div>
        ))}
      </div>
      <div className={styles.processTrack}>
        <div className={styles.processFill} style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <div className={styles.processCaption}>
        This algorithm does not expose a single flat list to draw, so the player shows real execution progress through the scenario without inventing fake data.
      </div>
    </div>
  )
}

function ArrayScenario({ step, allSteps, currentIndex, scenario, category }: {
  step: Step | null
  allSteps: Step[]
  currentIndex: number
  scenario: ScenarioDefinition
  category?: string
}) {
  const values = step?.array ?? latestArray(allSteps, currentIndex)
  if (values.length === 0) return <ProcessScenario allSteps={allSteps} currentIndex={currentIndex} scenario={scenario} />

  return (
    <div className={styles.objectScene}>
      <div className={styles.conveyorLabel}>{category === 'Searching' ? 'Places left to check' : 'Real-world items'}</div>
      <div className={styles.objectRow}>
        {values.map((value, index) => {
          const active = step?.indices?.includes(index) ?? false
          const stateClass = active
            ? step?.type === 'swap' ? styles.objectSwap : styles.objectActive
            : step?.type === 'done' ? styles.objectDone : ''
          return (
            <div key={`${index}-${String(value)}`} className={`${styles.objectCard} ${stateClass}`}>
              <span className={styles.objectIcon}>{scenario.icon}</span>
              <strong>{objectLabel(scenario, category, value, index)}</strong>
              <span>item {index + 1}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const NETWORK_WIDTH = 620
const NETWORK_HEIGHT = 310

function networkLayout(nodes: string[]) {
  const cx = NETWORK_WIDTH / 2
  const cy = NETWORK_HEIGHT / 2
  const radius = Math.min(NETWORK_WIDTH, NETWORK_HEIGHT) / 2 - 55
  return new Map(nodes.map((id, index) => {
    const angle = (2 * Math.PI * index) / Math.max(nodes.length, 1) - Math.PI / 2
    return [id, { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }]
  }))
}

function NetworkScenario({ allSteps, currentIndex, scenario, category }: {
  allSteps: Step[]
  currentIndex: number
  scenario: ScenarioDefinition
  category?: string
}) {
  const state = useMemo(() => accumulateNetwork(allSteps, currentIndex), [allSteps, currentIndex])
  const layout = useMemo(() => networkLayout(state.nodes), [state.nodes])
  const pathEdges = new Set<string>()
  for (let i = 0; i < state.path.length - 1; i++) {
    pathEdges.add(`${state.path[i]}->${state.path[i + 1]}`)
    pathEdges.add(`${state.path[i + 1]}->${state.path[i]}`)
  }

  if (state.nodes.length === 0) return <div className={styles.noData}>This run did not emit route or hierarchy data yet.</div>

  const placeIcon = category === 'Trees' ? '👤' : category === 'Graphs' ? '📍' : scenario.icon
  return (
    <div className={styles.mapScene}>
      <svg viewBox={`0 0 ${NETWORK_WIDTH} ${NETWORK_HEIGHT}`} className={styles.mapSvg}>
        {state.edges.map(([from, to, weight], index) => {
          const a = layout.get(from)
          const b = layout.get(to)
          if (!a || !b) return null
          const onPath = pathEdges.has(`${from}->${to}`)
          return (
            <g key={`${from}-${to}-${index}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={onPath ? styles.roadChosen : styles.road} />
              {weight !== undefined && <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 5} className={styles.roadLabel}>{weight}</text>}
            </g>
          )
        })}
        {state.nodes.map(id => {
          const p = layout.get(id)
          if (!p) return null
          const isPath = state.path.includes(id)
          const isCurrent = state.current === id
          const isVisited = state.visited.has(id)
          const cls = isPath ? styles.placeChosen : isCurrent ? styles.placeCurrent : isVisited ? styles.placeVisited : styles.place
          return (
            <g key={id} transform={`translate(${p.x}, ${p.y})`}>
              <rect x="-48" y="-24" width="96" height="48" rx="12" className={cls} />
              <text x="0" y="-4" textAnchor="middle" className={styles.placeIcon}>{placeIcon}</text>
              <text x="0" y="14" textAnchor="middle" className={styles.placeLabel}>{id.length > 14 ? `${id.slice(0, 13)}…` : id}</text>
            </g>
          )
        })}
      </svg>
      <div className={styles.sceneHint}>{category === 'Trees' ? 'People are connected by reporting relationships.' : 'Places are connected by roads; highlighted roads form the chosen route.'}</div>
    </div>
  )
}

function ListScenario({ allSteps, currentIndex }: { allSteps: Step[]; currentIndex: number }) {
  const state = useMemo(() => accumulateList(allSteps, currentIndex), [allSteps, currentIndex])
  const rows: [string, string[]][] = Object.keys(state.lists).length > 0
    ? Object.entries(state.lists)
    : [['Train', state.nodes]]
  if (rows.every(([, ids]) => ids.length === 0)) return <div className={styles.noData}>Run the list algorithm to see the train couplings change.</div>

  return (
    <div className={styles.trainScene}>
      {rows.map(([label, ids]) => (
        <div className={styles.trainRow} key={label}>
          <span className={styles.trainLabel}>{label}</span>
          {ids.map((id, index) => {
            const pointerHere = Object.values(state.pointers).includes(id)
            const complete = state.merged.includes(id)
            return (
              <div className={styles.trainPart} key={id}>
                <div className={`${styles.trainCar} ${pointerHere ? styles.trainCurrent : ''} ${complete ? styles.trainDone : ''}`}>
                  <span>🚃</span><strong>{id}</strong>
                </div>
                {index < ids.length - 1 && <span className={styles.coupling}>—</span>}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function ScenarioViz({ step, allSteps, currentIndex, renderType, template, code }: ScenarioVizProps) {
  const inferredName = template?.name ?? inferScenarioName(code)
  const inferredCategory = template?.category ?? inferScenarioCategory(code)
  const scenario = getScenario(inferredName, inferredCategory)
  const category = inferredCategory ?? scenario.category

  return (
    <div className={styles.root}>
      <div className={styles.storyHeader}>
        <div className={styles.heroIcon}>{scenario.icon}</div>
        <div>
          <div className={styles.eyebrow}>real-world scenario</div>
          <h3>{scenario.title}</h3>
          <p>{scenario.sub}</p>
        </div>
      </div>
      <div className={styles.blurb}>{scenario.blurb}</div>

      <div className={styles.scene}>
        {renderType === 'linked_list' ? (
          <ListScenario allSteps={allSteps} currentIndex={currentIndex} />
        ) : renderType === 'graph' || renderType === 'tree' ? (
          <NetworkScenario allSteps={allSteps} currentIndex={currentIndex} scenario={scenario} category={category} />
        ) : (
          <ArrayScenario step={step} allSteps={allSteps} currentIndex={currentIndex} scenario={scenario} category={category} />
        )}
      </div>

      <div className={styles.actionLine}>
        <span className={styles.actionDot} />
        <span>{actionText(step, scenario, category)}</span>
      </div>

      <div className={styles.useCases}>
        <span className={styles.useCasesLabel}>Where this shows up</span>
        {scenario.irl.map(item => <span className={styles.useCase} key={item.text}>{item.icon} {item.text}</span>)}
      </div>
    </div>
  )
}
