import { useMemo } from 'react'
import { RenderType, Step, TemplateSolution } from '@/types'
import { getScenario, inferScenarioCategory, inferScenarioName, ScenarioDefinition } from '@/data/scenarios'
import PathfindingGridViz from './PathfindingGridViz'
import DeliveryRouteViz from './DeliveryRouteViz'
import ConceptViz, { hasConceptVisualization } from './ConceptViz'
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

interface LearningStage {
  icon: string
  title: string
  detail: string
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


const ALGORITHM_NOTICES: Record<string, string> = {
  "Dijkstra's Shortest Path": 'Watch the best-known distance labels. A stop becomes settled only when no cheaper unfinished route can reach it.',
  'A* Search': 'Notice how A* combines cost-so-far with an estimate to the customer, so it explores fewer irrelevant streets.',
  'Rat in a Maze': 'A move is kept only while it can still lead to the cheese. Dead ends are explicitly undone.',
  'N-Queens': 'Every queen rules out a column and two diagonals for all later rows.',
  'Sudoku Solver': 'Each candidate must satisfy three constraints at once: its row, its column, and its 3×3 box.',
  'Permutations / Subsets': 'The key motion is choose → recurse → undo, which restores the exact state needed for the next choice.',
  'Counting Sort': 'Values are counted into bins; items never need pairwise comparison.',
  'Radix Sort': 'The same stable bucket operation is repeated for one digit position at a time.',
  'Bellman-Ford': 'Every edge gets another chance to improve a route; an improvement after V−1 rounds reveals a negative cycle.',
  'Floyd-Warshall': 'Each matrix cell asks one question: is going through the current intermediate city shorter?',
  'Topological Sort': 'A task becomes placeable only after its dependencies are already satisfied.',
  "Kruskal's MST": 'Roads are considered globally from cheapest upward, and cycle-making roads are skipped.',
  "Prim's MST": 'The network grows from one connected region by attaching its cheapest outgoing edge.',
  'Union-Find / Disjoint Set': 'Find identifies a group representative; Union merges two representatives rather than rescanning every member.',
  'KMP Pattern Matching': 'A mismatch does not throw away the whole match—the LPS table preserves the useful prefix.',
  'Rabin-Karp': 'Most windows are rejected by their rolling hash before a full character comparison is needed.',
  'Z-Algorithm': 'The Z-box lets later positions reuse prefix comparisons that were already proven.',
  'Sieve of Eratosthenes': 'Once a number is known prime, cross out its multiples; never test those composites from scratch.',
  'GCD / LCM (Euclidean)': 'The pair gets strictly smaller: gcd(a,b) = gcd(b,a mod b).',
  'Fast Exponentiation': 'The exponent is halved each round, turning a linear number of multiplications into logarithmic work.',
  'Bit Manipulation Basics': 'A mask changes only the selected bits; the other binary flags remain untouched.',
}

function conceptAction(name: string | undefined, progress: number): string | null {
  if (!name) return null
  const phase = progress < .34 ? 0 : progress < .72 ? 1 : 2
  const actions: Record<string, [string, string, string]> = {
    'Rat in a Maze': ['The mouse is testing an open corridor from the current cell.', 'The current route is still valid, so exploration continues deeper.', 'The surviving corridor is being completed toward the cheese.'],
    'N-Queens': ['A queen position is being tested for column and diagonal conflicts.', 'Safe queen positions are accumulating row by row.', 'The board is converging on a complete non-attacking arrangement.'],
    'Sudoku Solver': ['A candidate digit is being checked against Sudoku constraints.', 'Valid candidates are kept while contradictions cause backtracking.', 'The board is filling with a consistent set of choices.'],
    'Permutations / Subsets': ['Choose one remaining item for the next position.', 'Recurse with fewer remaining items, then restore the previous choice.', 'Completed arrangements are being collected.'],
    'Bellman-Ford': ['Start with only the source distance known.', 'Relax every exchange/road edge and keep cheaper costs.', 'Check whether one more relaxation is still possible.'],
    'Floyd-Warshall': ['Start from the direct-distance table.', 'Use another city as a possible intermediate shortcut.', 'The all-pairs distance table is approaching its final values.'],
    'Topological Sort': ['Follow dependencies before placing a task.', 'Completed prerequisites allow more tasks to enter the order.', 'The dependency-safe sequence is being finalized.'],
    "Kruskal's MST": ['Sort roads by construction cost.', 'Keep cheap roads only when they join separate components.', 'Enough non-cycling roads are being kept to connect every village.'],
    "Prim's MST": ['Start with one powered town.', 'Choose the cheapest cable leaving the powered region.', 'The connected grid is expanding toward all remaining towns.'],
    'KMP Pattern Matching': ['Build or consult prefix knowledge.', 'Compare the pattern while preserving useful matched prefixes.', 'Matches are found without restarting every comparison from zero.'],
    'Rabin-Karp': ['Compute the pattern and first window hashes.', 'Roll the text hash forward one character at a time.', 'Hash matches are verified against the actual characters.'],
    'Z-Algorithm': ['Establish the current prefix-match window.', 'Reuse the Z-box for positions that fall inside the known window.', 'Extend or move the prefix window as new matches are discovered.'],
    'Sieve of Eratosthenes': ['Begin with every number marked as a possible prime.', 'Cross out multiples of each confirmed prime.', 'Numbers left unmarked are the prime numbers.'],
  }
  return actions[name]?.[phase] ?? null
}

function actionText(step: Step | null, scenario: ScenarioDefinition, category?: string, algorithmName?: string, progress = 0): string {
  if (!step) return `Ready to explore: ${scenario.sub}`
  const indices = step.indices ?? []
  const node = step.node ? ` ${step.node}` : ''

  switch (step.type) {
    case 'compare':
      if (category === 'Sorting') return `Compare the highlighted items and decide whether their order should change.`
      if (category === 'Searching') return `Check the highlighted location against what we are looking for.`
      return 'Compare the current choices before making the next decision.'
    case 'swap': return 'These two items exchange positions because the current order is not correct yet.'
    case 'set': return indices.length ? `Update item ${indices[0] + 1} with the newest result.` : 'Save the newest useful result.'
    case 'visit': return `We have reached${node || ' the next place'} and can now decide where to go next.`
    case 'relax': return 'A better connection has been found, so the current route estimate is improved.'
    case 'path': return 'The useful route or final sequence is now confirmed.'
    case 'done': return `Finished — the ${scenario.title.toLowerCase()} is resolved.`
    case 'call': return 'Break the problem into a smaller version of the same everyday task.'
    case 'return': return 'That smaller task is solved, so its answer can be reused.'
    case 'highlight': return conceptAction(algorithmName, progress) ?? (step.line ? `Follow source line ${step.line}; this execution step advances the concept model above.` : 'The process advances to its next decision.')
    default: return step.info || `Working through: ${scenario.sub}`
  }
}

function learningStages(category: string | undefined, scenario: ScenarioDefinition): LearningStage[] {
  switch (category) {
    case 'Sorting':
      return [
        { icon: scenario.icon, title: 'Start with the items', detail: 'Look at the current order before changing anything.' },
        { icon: '🔎', title: 'Compare', detail: 'Inspect the items the algorithm considers next.' },
        { icon: '↔️', title: 'Rearrange', detail: 'Move or place an item when the ordering rule says to.' },
        { icon: '✅', title: 'Sorted result', detail: 'Repeat until every item is in the required order.' },
      ]
    case 'Searching':
      return [
        { icon: '🎯', title: 'Know the target', detail: 'Start with the thing we want to find.' },
        { icon: '👀', title: 'Check a location', detail: 'Inspect the next useful candidate.' },
        { icon: '✂️', title: 'Reduce the search', detail: 'Discard places that cannot contain the answer.' },
        { icon: '✅', title: 'Found or finished', detail: 'Stop when the target is found or no candidates remain.' },
      ]
    case 'Linked Lists':
      return [
        { icon: '🚃', title: 'Follow the current link', detail: 'Each item only knows what comes next.' },
        { icon: '📌', title: 'Remember what follows', detail: 'Save the next connection before changing links.' },
        { icon: '🔗', title: 'Reconnect safely', detail: 'Redirect or merge links one connection at a time.' },
        { icon: '✅', title: 'Complete the chain', detail: 'The final list remains connected in the new order.' },
      ]
    case 'Trees':
      return [
        { icon: '🌳', title: 'Start at the top', detail: 'Begin from the root or current decision point.' },
        { icon: '🧭', title: 'Choose a branch', detail: 'Use the rule to decide which child or subtree matters.' },
        { icon: '👣', title: 'Visit or rebalance', detail: 'Process the node and continue through the hierarchy.' },
        { icon: '✅', title: 'Finish the traversal', detail: 'Every required node or relationship has been handled.' },
      ]
    case 'Heaps & Priority Queues':
      return [
        { icon: '🚑', title: 'Add priorities', detail: 'Items arrive with different importance.' },
        { icon: '⚖️', title: 'Restore the heap rule', detail: 'Move items until the highest-priority choice is easy to reach.' },
        { icon: '⬆️', title: 'Take the next item', detail: 'The most urgent or best candidate comes out first.' },
        { icon: '✅', title: 'Keep the queue valid', detail: 'Repeat while preserving the priority structure.' },
      ]
    case 'Graphs':
      return [
        { icon: '📍', title: 'Choose a starting place', detail: 'Begin from a location or node in the network.' },
        { icon: '🛣️', title: 'Inspect connections', detail: 'Look at the roads or relationships available next.' },
        { icon: '🧠', title: 'Update the plan', detail: 'Mark visits, costs, parents, or the best route found so far.' },
        { icon: '🏁', title: 'Reach the goal', detail: 'Finish the traversal, route, or network structure.' },
      ]
    case 'Dynamic Programming':
      return [
        { icon: '🧩', title: 'Split into small questions', detail: 'Describe the larger problem using smaller states.' },
        { icon: '🗃️', title: 'Remember answers', detail: 'Store solved states so the same work is not repeated.' },
        { icon: '➕', title: 'Combine results', detail: 'Build bigger answers from the smaller solved ones.' },
        { icon: '✅', title: 'Read the final answer', detail: 'The desired solution is now available from the completed states.' },
      ]
    case 'Backtracking':
      return [
        { icon: '👉', title: 'Choose', detail: 'Try one valid-looking option.' },
        { icon: '🔍', title: 'Explore', detail: 'Continue while the partial solution still works.' },
        { icon: '↩️', title: 'Undo a dead end', detail: 'Back up when a choice makes the goal impossible.' },
        { icon: '✅', title: 'Keep a solution', detail: 'Stop or continue once a complete valid arrangement is found.' },
      ]
    case 'Greedy':
      return [
        { icon: '📋', title: 'Rank the options', detail: 'Look at the choices using the algorithm’s local rule.' },
        { icon: '⭐', title: 'Take the best next move', detail: 'Commit to the strongest feasible choice right now.' },
        { icon: '🧱', title: 'Protect feasibility', detail: 'Skip choices that would break the constraints.' },
        { icon: '✅', title: 'Finish the plan', detail: 'The sequence of local choices forms the final result.' },
      ]
    case 'Strings':
      return [
        { icon: '🔤', title: 'Align the text', detail: 'Start at a candidate position in the text or pattern.' },
        { icon: '🔎', title: 'Compare characters', detail: 'Check the next characters that matter.' },
        { icon: '⏩', title: 'Reuse what we know', detail: 'Skip unnecessary work using information from earlier matches.' },
        { icon: '✅', title: 'Report the match', detail: 'Return the match, palindrome, or processed string state.' },
      ]
    case 'Math & Bit Manipulation':
      return [
        { icon: '🔢', title: 'Represent the problem', detail: 'Start from the numbers or bits we need to transform.' },
        { icon: '⚙️', title: 'Apply the rule', detail: 'Perform one reduction, bit operation, or arithmetic step.' },
        { icon: '🔁', title: 'Repeat efficiently', detail: 'Reuse the reduced state instead of starting over.' },
        { icon: '✅', title: 'Produce the result', detail: 'The repeated rule reaches the final value.' },
      ]
    default:
      return [
        { icon: scenario.icon, title: 'Set up the situation', detail: 'Understand the real-world problem we want to solve.' },
        { icon: '👀', title: 'Make the next decision', detail: 'Inspect the current state and choose the next action.' },
        { icon: '🧠', title: 'Update what we know', detail: 'Use the result of that action to improve the plan.' },
        { icon: '✅', title: 'Reach the outcome', detail: 'Repeat until the goal is complete.' },
      ]
  }
}

function noticeText(category: string | undefined, algorithmName?: string): string {
  if (algorithmName && ALGORITHM_NOTICES[algorithmName]) return ALGORITHM_NOTICES[algorithmName]
  switch (category) {
    case 'Sorting': return 'Watch which items are compared and how the sorted portion grows.'
    case 'Searching': return 'Notice how many candidates can be ruled out after each check.'
    case 'Linked Lists': return 'The important part is changing links without losing the rest of the chain.'
    case 'Trees': return 'Watch how one local branch decision controls which part of the hierarchy is visited next.'
    case 'Heaps & Priority Queues': return 'The entire structure is arranged so the next priority item is always easy to access.'
    case 'Graphs': return 'Separate “where we can go” from “where we have already gone” and from the best route known so far.'
    case 'Dynamic Programming': return 'The speed-up comes from remembering smaller answers and reusing them.'
    case 'Backtracking': return 'A wrong choice is not failure—it is information that tells us to undo and try another branch.'
    case 'Greedy': return 'Each choice is locally best; the interesting question is why those local choices lead to a valid final result.'
    case 'Strings': return 'Good string algorithms avoid rechecking characters that previous comparisons already told us about.'
    case 'Math & Bit Manipulation': return 'Look for the repeated reduction rule that makes the problem smaller every step.'
    default: return 'Watch how the state changes after each decision.'
  }
}

function ProcessScenario({ step, allSteps, currentIndex, scenario, category }: {
  step: Step | null
  allSteps: Step[]
  currentIndex: number
  scenario: ScenarioDefinition
  category?: string
}) {
  const total = Math.max(allSteps.length - 1, 1)
  const progress = step?.type === 'done' ? 1 : Math.min(1, Math.max(0, currentIndex / total))
  const stages = learningStages(category, scenario)
  const activeStage = step?.type === 'done'
    ? stages.length - 1
    : Math.min(stages.length - 1, Math.floor(progress * stages.length))

  const percent = Math.max(4, Math.round(progress * 100))

  return (
    <div className={styles.processScene}>
      <div className={styles.processTopline}>
        <span>How the idea unfolds</span>
        <strong>{percent}%</strong>
      </div>
      <div className={styles.processStages}>
        {stages.map((stage, index) => (
          <div
            key={stage.title}
            className={`${styles.processStage} ${index < activeStage ? styles.processDone : ''} ${index === activeStage ? styles.processActive : ''}`}
          >
            <span className={styles.stageIcon}>{stage.icon}</span>
            <strong>{stage.title}</strong>
            <small>{stage.detail}</small>
          </div>
        ))}
      </div>
      <div className={styles.processTrackWrap}>
        <div className={styles.processTrack}>
          <div className={styles.processFill} style={{ width: `${percent}%` }} />
        </div>
        <div className={styles.processTraveler} style={{ left: `calc(${percent}% - 13px)` }} aria-hidden="true">🚶</div>
      </div>
      <div className={styles.processCaption}>
        {step?.line ? <span className={styles.lineBadge}>code line {step.line}</span> : null}
        <span>{actionText(step, scenario, category, undefined, progress)}</span>
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
  if (values.length === 0) {
    return <ProcessScenario step={step} allSteps={allSteps} currentIndex={currentIndex} scenario={scenario} category={category} />
  }

  return (
    <div className={styles.objectScene}>
      <div className={styles.conveyorLabel}>{category === 'Searching' ? 'Places being checked' : 'Items in the current state'}</div>
      <div className={styles.objectRow}>
        {values.map((value, index) => {
          const active = step?.indices?.includes(index) ?? false
          const stateClass = active
            ? step?.type === 'swap' ? styles.objectSwap : styles.objectActive
            : step?.type === 'done' ? styles.objectDone : ''
          const guideHere = active || (step?.type === 'done' && index === values.length - 1)
          return (
            <div key={`${index}-${String(value)}`} className={styles.objectSlot}>
              {guideHere ? <div className={styles.objectGuide} aria-hidden="true">🧑‍🏫</div> : null}
              <div className={`${styles.objectCard} ${stateClass}`}>
                <span className={styles.objectIcon}>{scenario.icon}</span>
                <strong>{objectLabel(scenario, category, value, index)}</strong>
                <span>position {index + 1}</span>
              </div>
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

function NetworkScenario({ step, allSteps, currentIndex, scenario, category }: {
  step: Step | null
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

  if (state.nodes.length === 0) {
    return <ProcessScenario step={step} allSteps={allSteps} currentIndex={currentIndex} scenario={scenario} category={category} />
  }

  const placeIcon = category === 'Trees' ? '👤' : category === 'Graphs' ? '📍' : scenario.icon
  const travelerNode = state.current ?? state.path[state.path.length - 1] ?? state.nodes[0]
  const travelerPoint = travelerNode ? layout.get(travelerNode) : undefined

  return (
    <div className={styles.mapScene}>
      <svg viewBox={`0 0 ${NETWORK_WIDTH} ${NETWORK_HEIGHT}`} className={styles.mapSvg} role="img" aria-label={`${scenario.title} network visualization`}>
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
        {travelerPoint ? (
          <g transform={`translate(${travelerPoint.x}, ${travelerPoint.y - 36})`} aria-hidden="true">
            <circle r="16" className={styles.travelerHalo} />
            <text y="6" textAnchor="middle" className={styles.travelerEmoji}>🚶</text>
          </g>
        ) : null}
      </svg>
      <div className={styles.sceneHint}>{category === 'Trees' ? 'Follow the hierarchy and watch which person or branch becomes active.' : 'Follow the network and watch visits, route updates, and the final path.'}</div>
    </div>
  )
}

function ListScenario({ step, allSteps, currentIndex, scenario, category }: {
  step: Step | null
  allSteps: Step[]
  currentIndex: number
  scenario: ScenarioDefinition
  category?: string
}) {
  const state = useMemo(() => accumulateList(allSteps, currentIndex), [allSteps, currentIndex])
  const rows: [string, string[]][] = Object.keys(state.lists).length > 0
    ? Object.entries(state.lists)
    : [['Train', state.nodes]]
  if (rows.every(([, ids]) => ids.length === 0)) {
    return <ProcessScenario step={step} allSteps={allSteps} currentIndex={currentIndex} scenario={scenario} category={category} />
  }

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
                {pointerHere ? <div className={styles.trainGuide} aria-hidden="true">🚶</div> : null}
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
  const inferredName = template?.name ?? inferScenarioName(code) ?? 'Custom Algorithm'
  const inferredCategory = template?.category ?? inferScenarioCategory(code)
  const scenario = getScenario(inferredName, inferredCategory)
  const category = inferredCategory ?? scenario.category
  const progress = allSteps.length > 0 ? Math.round(((currentIndex + 1) / allSteps.length) * 100) : 0
  const hasGridTrace = allSteps.some(item => item.type === 'grid_init' && Boolean(item.grid?.length))
  const hasGraphTrace = allSteps.some(item => item.type === 'graph_init' && Boolean(item.nodes?.length))
  const isPathfindingLesson = inferredName === "Dijkstra's Shortest Path" || inferredName === 'A* Search'

  return (
    <div className={styles.root}>
      <div className={styles.storyHeader}>
        <div className={styles.heroIcon}>{scenario.icon}</div>
        <div className={styles.storyCopy}>
          <div className={styles.eyebrow}>Story mode · learn by analogy</div>
          <h3>{scenario.title}</h3>
          <p>{scenario.sub}</p>
        </div>
        <div className={styles.progressPill}>{progress}%</div>
      </div>

      <div className={styles.learningGrid}>
        <div className={styles.learningCard}>
          <span>Why this analogy works</span>
          <p>{scenario.blurb}</p>
        </div>
        <div className={styles.learningCard}>
          <span>What to notice</span>
          <p>{noticeText(category, inferredName)}</p>
        </div>
      </div>

      <div className={styles.scene}>
        {isPathfindingLesson && hasGridTrace ? (
          <PathfindingGridViz
            step={step}
            allSteps={allSteps}
            currentIndex={currentIndex}
            algorithmName={inferredName}
          />
        ) : isPathfindingLesson && hasGraphTrace ? (
          <DeliveryRouteViz
            step={step}
            allSteps={allSteps}
            currentIndex={currentIndex}
            algorithmName={inferredName}
          />
        ) : hasConceptVisualization(inferredName) ? (
          <ConceptViz
            name={inferredName}
            step={step}
            allSteps={allSteps}
            currentIndex={currentIndex}
          />
        ) : renderType === 'linked_list' ? (
          <ListScenario step={step} allSteps={allSteps} currentIndex={currentIndex} scenario={scenario} category={category} />
        ) : renderType === 'graph' || renderType === 'tree' ? (
          <NetworkScenario step={step} allSteps={allSteps} currentIndex={currentIndex} scenario={scenario} category={category} />
        ) : (
          <ArrayScenario step={step} allSteps={allSteps} currentIndex={currentIndex} scenario={scenario} category={category} />
        )}
      </div>

      <div className={styles.actionLine} aria-live="polite">
        <span className={styles.actionDot} />
        <div>
          <strong>What is happening now</strong>
          <span>{actionText(step, scenario, category, inferredName, progress / 100)}</span>
        </div>
      </div>

      <div className={styles.useCases}>
        <span className={styles.useCasesLabel}>You may see this idea in</span>
        {scenario.irl.map(item => <span className={styles.useCase} key={item.text}>{item.icon} {item.text}</span>)}
      </div>
    </div>
  )
}
