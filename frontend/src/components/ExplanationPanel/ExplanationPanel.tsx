import { Step, TemplateSolution } from '@/types'
import { ALGORITHM_EXPLANATIONS } from '@/data/algorithmExplanations'
import { getScenario, inferScenarioCategory, inferScenarioName } from '@/data/scenarios'
import styles from './ExplanationPanel.module.css'

interface ExplanationPanelProps {
  step: Step | null
  previousStep: Step | null
  allSteps: Step[]
  currentIndex: number
  template: TemplateSolution | null
  code: string
}

interface LiveExplanation {
  title: string
  doing: string
  why: string
  changed: string
}

const TIMELINE_PHASES: Record<string, [string, string, string]> = {
  'Counting Sort': ['Count each value into its frequency bin.', 'Convert the counts into an ordered reconstruction plan.', 'Write each value back the number of times it was counted.'],
  'Radix Sort': ['Distribute values by the current least-significant digit.', 'Collect the stable buckets and move to the next digit position.', 'Repeat until the most significant required digit has been processed.'],
  'BST Insert / Delete / Search': ['Compare the target key at the current tree node.', 'Follow the left/right ordering rule and update the needed link.', 'Preserve BST ordering as the operation completes.'],
  'AVL Tree Rotations': ['Perform the underlying BST update.', 'Measure subtree balance and identify the imbalance case.', 'Rotate the affected local subtree while preserving sorted key order.'],
  'Trie Insert / Search': ['Read the next character of the word or prefix.', 'Follow or create the matching character edge.', 'Mark or confirm the terminal path once all characters are consumed.'],
  'K-th Largest Element': ['Feed values into the top-k candidate heap.', 'Remove values that cannot remain among the k largest.', 'Read the heap minimum as the final k-th-largest threshold.'],
  'Bellman-Ford': ['Initialize only the source with a finite distance.', 'Relax every edge so cheaper paths propagate across the graph.', 'Check one extra round for an improvement that would reveal a negative cycle.'],
  'Floyd-Warshall': ['Start from direct pairwise distances.', 'Try another node as an allowed intermediate for every pair.', 'Finish the all-pairs table after every intermediate has been considered.'],
  'Union-Find / Disjoint Set': ['Find the representative root for the current elements.', 'Merge different roots when a new connection joins two groups.', 'Compress paths so later connectivity queries reach representatives faster.'],
  'Longest Common Subsequence': ['Compare the current prefix characters.', 'Reuse smaller prefix answers to fill the DP state.', 'Read the completed prefix table to recover the best common subsequence length.'],
  'Longest Increasing Subsequence': ['Read the next sequence value.', 'Locate the subsequence-tail position this value can improve.', 'Keep the best tail per length until the longest length is known.'],
  'Edit Distance': ['Compare the next pair of prefix characters.', 'Choose the cheapest insert, delete, replace, or match transition.', 'Finish the DP grid with the minimum total edits.'],
  'Coin Change': ['Consider the next amount and available coin choices.', 'Reuse smaller solved amounts to improve the current best coin count.', 'Complete the target amount from the best stored subproblem answers.'],
  'Matrix Chain Multiplication': ['Choose a matrix interval to optimize.', 'Try each possible split point and combine the two subchain costs.', 'Keep the cheapest split until the full chain has an optimal parenthesization.'],
  'Fibonacci (memoized)': ['Request a Fibonacci subproblem.', 'Return cached values or compute the two smaller missing values.', 'Store the result so later calls reuse it instead of recursing again.'],
  'Sudoku Solver': ['Choose the next empty cell and generate legal candidates.', 'Try a candidate and continue while row, column, and box constraints remain valid.', 'Undo contradictions or keep the choices that lead to the completed board.'],
  'Permutations / Subsets': ['Choose the next available item or include/exclude decision.', 'Recurse into the branch created by that choice.', 'Undo the choice and continue until every branch has been enumerated.'],
  'Rat in a Maze': ['Try a legal neighboring corridor.', 'Continue deeper while the partial route is still feasible.', 'Backtrack from dead ends and keep the branch that reaches the goal.'],
  'Activity Selection': ['Order activities by finishing time.', 'Accept the earliest-finishing activity compatible with the current schedule.', 'Continue greedily until no more compatible activities remain.'],
  'Huffman Coding': ['Rank symbol frequencies in a min-priority queue.', 'Merge the two least-frequent nodes into a new combined subtree.', 'Read root-to-leaf bit paths after one coding tree remains.'],
  'Fractional Knapsack': ['Rank items by value per unit weight.', 'Take as much as possible from the best remaining ratio.', 'Use a fraction of the final item if that is all the remaining capacity can hold.'],
  'Longest Palindromic Substring': ['Choose the next character or gap as a possible palindrome center.', 'Expand equally left and right while the characters match.', 'Keep the longest successful expansion seen across all centers.'],
  'GCD / LCM (Euclidean)': ['Start from the current pair of integers.', 'Replace the pair with the divisor and its remainder.', 'Stop when the remainder reaches zero; the last nonzero divisor is the GCD.'],
  'Fast Exponentiation': ['Inspect whether the current exponent is odd or even.', 'Accumulate the base when needed, then square the base.', 'Halve the exponent repeatedly until no exponent remains.'],
  'Bit Manipulation Basics': ['Build the mask for the bit positions of interest.', 'Apply the selected AND, OR, XOR, or shift operation.', 'Read the resulting flags or numeric value after the targeted bits change.'],
}

function timelinePhase(name: string, progress: number): string | null {
  const phases = TIMELINE_PHASES[name]
  if (!phases) return null
  const phase = progress < 0.34 ? 0 : progress < 0.72 ? 1 : 2
  return phases[phase]
}

function valueAt(step: Step | null, index: number): number | string | undefined {
  return step?.array?.[index]
}

function arrayChange(step: Step, previousStep: Step | null): string {
  if (!step.array?.length) return 'The visible algorithm state advances to the next recorded step.'
  if (!previousStep?.array?.length) return `The current state contains ${step.array.length} visible items.`

  const changes: string[] = []
  for (let index = 0; index < step.array.length; index++) {
    if (step.array[index] !== previousStep.array[index]) {
      changes.push(`position ${index + 1}: ${String(previousStep.array[index])} → ${String(step.array[index])}`)
    }
  }
  return changes.length ? changes.slice(0, 3).join(' · ') : 'No array value changed in this step; the algorithm gathered information for its next decision.'
}

function liveExplanation(step: Step | null, previousStep: Step | null, category: string, name: string, progress: number): LiveExplanation {
  if (!step) {
    return {
      title: 'Ready to begin',
      doing: 'Run the lesson to see the explanation follow the algorithm one decision at a time.',
      why: 'The explanation is synchronized with the same trace that drives the visualization.',
      changed: 'No execution state has changed yet.',
    }
  }

  const indices = step.indices ?? []
  const first = indices[0]
  const second = indices[1]
  const firstValue = first === undefined ? undefined : valueAt(step, first)
  const secondValue = second === undefined ? undefined : valueAt(step, second)

  switch (step.type) {
    case 'compare':
      return {
        title: category === 'Searching' ? 'Check a candidate' : 'Compare current choices',
        doing: first !== undefined && second !== undefined
          ? `The algorithm compares positions ${first + 1} and ${second + 1}${firstValue !== undefined && secondValue !== undefined ? ` (${String(firstValue)} and ${String(secondValue)})` : ''}.`
          : first !== undefined
            ? `The algorithm checks position ${first + 1}${firstValue !== undefined ? ` containing ${String(firstValue)}` : ''}.`
            : 'The algorithm compares the current candidates.',
        why: category === 'Sorting'
          ? 'This comparison tells the algorithm whether the local order already satisfies the sorting rule.'
          : category === 'Searching'
            ? 'This check tells the algorithm whether it found the target or can safely move to another candidate.'
            : 'The result of this comparison decides which branch or update is valid next.',
        changed: 'A comparison usually changes knowledge, not data. The visible values may stay the same until the next update step.',
      }
    case 'swap':
      return {
        title: 'Reorder two items',
        doing: indices.length >= 2 ? `Positions ${indices[0] + 1} and ${indices[1] + 1} exchange their values.` : 'Two out-of-order items exchange positions.',
        why: 'The previous comparison showed that their current ordering violated the algorithm’s rule.',
        changed: arrayChange(step, previousStep),
      }
    case 'set':
      return {
        title: 'Write an updated value',
        doing: first !== undefined ? `The algorithm writes the newest result into position ${first + 1}.` : 'The algorithm stores a newly computed state value.',
        why: category === 'Dynamic Programming'
          ? 'Saving this state lets larger subproblems reuse the answer instead of solving the same smaller problem again.'
          : 'The update records the best or correct value discovered at this point in the algorithm.',
        changed: arrayChange(step, previousStep),
      }
    case 'grid_init':
      return {
        title: 'Build the weighted map',
        doing: `The pathfinding lesson creates a ${step.grid?.length ?? 0}×${step.grid?.[0]?.length ?? 0} grid with a start, destination, buildings, and travel costs.`,
        why: 'Dijkstra and A* need explicit traversal costs so they can compare routes by total cost rather than visual straightness.',
        changed: 'The search state is initialized; no location has been settled yet.',
      }
    case 'graph_init':
      return {
        title: 'Build the network',
        doing: `The algorithm loads ${step.nodes?.length ?? 0} nodes and ${step.edges?.length ?? 0} connections${step.source ? `, starting from ${step.source}` : ''}.`,
        why: 'Graph algorithms need the available connections before they can traverse, rank, or optimize them.',
        changed: 'The graph structure is now available to the search or optimization process.',
      }
    case 'tree_init':
      return {
        title: 'Build the tree',
        doing: `The lesson initializes a hierarchy with ${step.nodes?.length ?? 0} visible nodes.`,
        why: 'Tree algorithms make decisions from parent/child structure, so the hierarchy is established before traversal or updates begin.',
        changed: 'The tree structure is ready; traversal state has not advanced yet.',
      }
    case 'list_init':
      return {
        title: 'Build the linked structure',
        doing: `The lesson initializes ${step.nodes?.length ?? Object.values(step.lists ?? {}).flat().length} linked nodes.`,
        why: 'Linked-list algorithms operate on connections between nodes rather than array positions.',
        changed: 'The starting links are established before pointers begin moving or changing.',
      }
    case 'visit':
      return {
        title: step.cell ? 'Settle the next map cell' : 'Visit the next node',
        doing: step.cell
          ? `The algorithm processes grid cell (${step.cell[0]}, ${step.cell[1]}).`
          : step.node
            ? `The algorithm processes ${step.node}.`
            : 'The algorithm processes the next reachable state.',
        why: name === "Dijkstra's Shortest Path"
          ? 'This is currently the cheapest unsettled location, so with non-negative costs its distance can now be treated as final.'
          : name === 'A* Search'
            ? 'This location currently has the best combination of cost-so-far and estimated remaining cost.'
            : category === 'Graphs' || category === 'Trees'
              ? 'Visiting records that this node has been reached so the algorithm can inspect its neighbors or children without repeating work.'
              : 'This state is the next one selected by the algorithm’s traversal rule.',
        changed: step.distances ? 'The current best-known distance table is carried forward to this visit.' : 'The visited/explored set grows by this state.',
      }
    case 'relax':
      return {
        title: 'Try a cheaper route',
        doing: step.from_cell && step.to_cell
          ? `The algorithm tests whether moving from (${step.from_cell[0]}, ${step.from_cell[1]}) to (${step.to_cell[0]}, ${step.to_cell[1]}) improves the known cost.`
          : step.edge
            ? `The algorithm tests the connection ${step.edge[0]} → ${step.edge[1] ?? 'neighbor'}.`
            : 'The algorithm tests whether the current connection improves a known cost.',
        why: 'Relaxation is the key shortest-path update: a route is kept only when its total cost is better than the best route known before it.',
        changed: step.cell_cost !== undefined
          ? `The candidate step has traversal cost ${step.cell_cost}; the destination state is updated only if the total becomes cheaper.`
          : 'One best-known distance or predecessor may have been improved by this connection.',
      }
    case 'call':
      return {
        title: 'Solve a smaller subproblem',
        doing: 'The algorithm enters another recursive call.',
        why: category === 'Backtracking'
          ? 'The current choice is provisionally accepted, so the algorithm explores what becomes possible after that choice.'
          : 'The original problem can be expressed in terms of smaller instances of the same problem.',
        changed: 'A new recursive frame is added; the caller’s state waits for this smaller result.',
      }
    case 'return':
      return {
        title: 'Return from a subproblem',
        doing: 'A smaller recursive problem has finished and returns control to its caller.',
        why: category === 'Backtracking'
          ? 'Returning lets the algorithm either keep a successful branch or undo a failed choice and try another.'
          : 'The returned result is combined with or reused by the larger problem.',
        changed: 'One recursive frame is completed and its result becomes available to the previous frame.',
      }
    case 'path':
      return {
        title: 'Reconstruct the chosen result',
        doing: step.grid_path?.length
          ? `The confirmed grid route now contains ${step.grid_path.length - 1} moves.`
          : step.path?.length
            ? `The confirmed route or sequence contains ${step.path.length} recorded states.`
            : 'The algorithm reconstructs the final route or result sequence.',
        why: 'The search phase stored enough predecessor or decision information to trace the winning solution back in order.',
        changed: 'The final answer becomes explicit instead of remaining only as costs, parents, or intermediate decisions.',
      }
    case 'highlight':
      return {
        title: step.line ? `Execute source line ${step.line}` : 'Advance the current operation',
        doing: timelinePhase(name, progress) ?? step.info ?? 'The algorithm advances through its next conceptual operation.',
        why: timelinePhase(name, progress)
          ? `This phase is part of ${name}’s core decision process; the concept view shows the algorithm-level state even when the tracer only exposes source-line progress.`
          : 'This line-level trace keeps the explanation synchronized even for algorithms whose important state is not a simple array or graph.',
        changed: timelinePhase(name, progress)
          ? 'The lesson advances to the next conceptual state for this algorithm; source-line details remain available on demand.'
          : 'The execution position advances; the concept visualization reflects the corresponding phase of the algorithm.',
      }
    case 'done':
      return {
        title: 'Algorithm complete',
        doing: step.info ?? 'The algorithm has reached its final recorded state.',
        why: 'All required decisions, visits, comparisons, or state transitions for this run are finished.',
        changed: 'The current visualization now represents the final result for this input.',
      }
    default:
      return {
        title: 'Advance the algorithm',
        doing: step.info ?? 'The algorithm moves to its next recorded state.',
        why: 'This step follows the algorithm’s rule for progressing toward the final result.',
        changed: 'The trace advances by one state.',
      }
  }
}

export default function ExplanationPanel({ step, previousStep, allSteps, currentIndex, template, code }: ExplanationPanelProps) {
  const name = template?.name ?? inferScenarioName(code) ?? 'Custom Algorithm'
  const category = template?.category ?? inferScenarioCategory(code) ?? 'Algorithms'
  const scenario = getScenario(name, category)
  const definition = ALGORITHM_EXPLANATIONS[name]
  const progress = allSteps.length > 0 ? Math.round(((currentIndex + 1) / allSteps.length) * 100) : 0
  const live = liveExplanation(step, previousStep, category, name, progress / 100)

  return (
    <aside className={styles.root} aria-label="algorithm explanation" aria-live="polite">
      <div className={styles.head}>
        <div>
          <span className={styles.eyebrow}>Explain how it works</span>
          <strong>{name}</strong>
        </div>
        <span className={styles.progress}>{progress}%</span>
      </div>

      <section className={styles.overview}>
        <span>Big idea</span>
        <p>{definition?.coreRule ?? scenario.blurb}</p>
      </section>

      <section className={styles.liveCard}>
        <div className={styles.liveTitle}>
          <span className={styles.liveDot} />
          <strong>{live.title}</strong>
        </div>
        <div className={styles.explainRows}>
          <div><span>What</span><p>{live.doing}</p></div>
          <div><span>Why</span><p>{live.why}</p></div>
          <div><span>Changed</span><p>{live.changed}</p></div>
        </div>
      </section>

      <section className={styles.reason}>
        <span>Why the algorithm works</span>
        <p>{definition?.whyItWorks ?? scenario.blurb}</p>
      </section>

      <section className={styles.question}>
        <span>Ask yourself</span>
        <p>{definition?.keyQuestion ?? `What decision does ${name} make next, and what information lets it make that decision?`}</p>
      </section>

      {step?.line ? <div className={styles.sourceHint}>Source line {step.line} is active. Use “Show source code” when you want to connect this explanation to the implementation.</div> : null}
    </aside>
  )
}
