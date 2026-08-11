export interface AlgorithmExplanationDefinition {
  coreRule: string
  whyItWorks: string
  keyQuestion: string
}

export const ALGORITHM_EXPLANATIONS: Record<string, AlgorithmExplanationDefinition> = {
  'Bubble Sort': {
    coreRule: 'Compare neighboring items and swap them when they are out of order. After each full pass, one largest remaining item has bubbled into its final position.',
    whyItWorks: 'Every swap removes a local inversion. Repeating passes eventually removes every inversion, leaving the whole sequence sorted.',
    keyQuestion: 'Which two neighbors are being compared, and which part of the array is already permanently sorted?',
  },
  'Insertion Sort': {
    coreRule: 'Grow a sorted prefix one item at a time by shifting larger items right and inserting the current key into the gap.',
    whyItWorks: 'Before each insertion the prefix is already sorted; placing the next key in its correct location preserves that invariant.',
    keyQuestion: 'Where should the current key be inserted inside the already-sorted left side?',
  },
  'Selection Sort': {
    coreRule: 'Find the smallest remaining item and place it at the next unsorted position.',
    whyItWorks: 'Each pass permanently fixes one position, so the sorted prefix grows until no unsorted items remain.',
    keyQuestion: 'What is the smallest value seen in this pass, and where will it be placed?',
  },
  'Merge Sort': {
    coreRule: 'Split the input into smaller halves, sort those halves, then merge two sorted halves by repeatedly taking the smaller front item.',
    whyItWorks: 'Single-item lists are already sorted, and merging two sorted lists can always produce a correctly sorted larger list.',
    keyQuestion: 'Which of the two front items should be copied next during the merge?',
  },
  'Quick Sort': {
    coreRule: 'Choose a pivot, partition values around it, then recursively sort the smaller partitions.',
    whyItWorks: 'Partitioning places the pivot in a position consistent with the final ordering and separates the remaining work into independent subproblems.',
    keyQuestion: 'Which values belong on the lower side of the pivot and which belong on the higher side?',
  },
  'Heap Sort': {
    coreRule: 'Build a max heap, repeatedly move its maximum item to the end, then restore the heap property in the remaining prefix.',
    whyItWorks: 'A max heap exposes the largest remaining value at its root, so each extraction fixes one final sorted position.',
    keyQuestion: 'Which child must move upward to restore the heap after extracting the root?',
  },
  'Counting Sort': {
    coreRule: 'Count how many times each value occurs, then rebuild the output by reading those counts in value order.',
    whyItWorks: 'When values come from a small known range, frequency counts contain enough information to reconstruct the sorted sequence without comparisons.',
    keyQuestion: 'How many copies of each value have been counted so far?',
  },
  'Radix Sort': {
    coreRule: 'Stable-sort values by one digit position at a time, starting with the least significant digit.',
    whyItWorks: 'Stable ordering preserves the work of earlier digit passes, so after the final digit every number is ordered by all of its digits.',
    keyQuestion: 'Which digit position is controlling the buckets in this pass?',
  },
  'Linear Search': {
    coreRule: 'Check candidates one by one until the target is found or every candidate has been examined.',
    whyItWorks: 'Without ordering information, no unchecked position can safely be ruled out.',
    keyQuestion: 'Is the current item the target, and if not, which item is checked next?',
  },
  'Binary Search': {
    coreRule: 'Compare with the middle of a sorted range and discard the half that cannot contain the target.',
    whyItWorks: 'Sorted order tells us that every value on one side of the midpoint is either too small or too large, so half the candidates can be removed at once.',
    keyQuestion: 'Does the middle value tell us to keep the left half or the right half?',
  },
  'Ternary Search': {
    coreRule: 'Probe two points that split a unimodal search interval into thirds, then keep only the third that can still contain the optimum.',
    whyItWorks: 'For a unimodal function, the relative values at the two probes reveal which outer region cannot contain the single peak or valley.',
    keyQuestion: 'Which third of the interval can be discarded from the two probe values?',
  },
  'Reverse a Linked List': {
    coreRule: 'Walk node by node, save the next node, reverse the current next pointer, then continue from the saved node.',
    whyItWorks: 'Saving the forward link before changing it prevents the unprocessed remainder of the list from being lost.',
    keyQuestion: 'Have we saved the next node before redirecting the current pointer?',
  },
  "Cycle Detection (Floyd's)": {
    coreRule: 'Move one pointer one step at a time and another two steps at a time; if a cycle exists, the faster pointer eventually catches the slower one.',
    whyItWorks: 'Inside a finite cycle, their relative distance changes by one position per iteration, so they must eventually meet.',
    keyQuestion: 'Are the slow and fast pointers converging to the same node?',
  },
  'Merge Two Sorted Lists': {
    coreRule: 'Compare the two current list heads, append the smaller one, and advance only that list.',
    whyItWorks: 'Because both inputs are already sorted, the smaller current head is always the smallest remaining value overall.',
    keyQuestion: 'Which list head is smaller and should become the next node in the merged list?',
  },
  'Inorder / Preorder / Postorder Traversal': {
    coreRule: 'Visit the same tree recursively but change whether the node itself is processed before, between, or after its child subtrees.',
    whyItWorks: 'Every traversal reaches every node exactly once while the chosen processing order defines the resulting sequence.',
    keyQuestion: 'At this node, do we process the node before its children, between them, or after them?',
  },
  'Level-Order (BFS) Traversal': {
    coreRule: 'Use a queue to visit all nodes at the current tree depth before moving to the next depth.',
    whyItWorks: 'FIFO ordering preserves the order in which children are discovered, so shallower nodes leave the queue before deeper nodes.',
    keyQuestion: 'Which nodes are currently waiting in the queue for the next tree level?',
  },
  'BST Insert / Delete / Search': {
    coreRule: 'At each node, go left for smaller keys and right for larger keys; insertion, lookup, and deletion all preserve that ordering rule.',
    whyItWorks: 'The binary-search-tree invariant lets one comparison eliminate an entire subtree from consideration.',
    keyQuestion: 'Does the key belong in the left subtree, the right subtree, or at this node?',
  },
  'AVL Tree Rotations': {
    coreRule: 'Perform normal BST updates, measure subtree balance, and rotate locally whenever a node becomes too left-heavy or right-heavy.',
    whyItWorks: 'Rotations preserve BST key order while reducing height imbalance, keeping the tree logarithmically shallow.',
    keyQuestion: 'Which imbalance case occurred, and which rotation restores balance without changing key order?',
  },
  'Trie Insert / Search': {
    coreRule: 'Follow or create one tree edge per character, sharing common prefixes between words.',
    whyItWorks: 'Words with the same prefix reuse the same path, so lookup time depends on word length rather than the number of stored words.',
    keyQuestion: 'Which character edge should be followed or created next?',
  },
  'Lowest Common Ancestor': {
    coreRule: 'Find the deepest tree node whose subtree contains both requested nodes.',
    whyItWorks: 'When the two targets split into different child branches, the current node is the first shared ancestor on their paths upward.',
    keyQuestion: 'Do both target nodes lie below the same child, or do their paths split here?',
  },
  'Heap Insert / Extract-Min': {
    coreRule: 'Insert at the end and bubble upward, or remove the root, move the last item to the root, and bubble downward.',
    whyItWorks: 'Only the ancestor path of an inserted item or the descendant path of a replaced root can violate the heap rule.',
    keyQuestion: 'Which parent-child relationship currently violates min-heap order?',
  },
  'Build Heap (Heapify)': {
    coreRule: 'Starting from the last internal node, push each subtree root downward until every parent satisfies the heap rule.',
    whyItWorks: 'Processing bottom-up means each node is repaired only after its children already root valid heaps.',
    keyQuestion: 'Which child should become the parent to make this subtree a valid heap?',
  },
  'K-th Largest Element': {
    coreRule: 'Keep a min-heap containing only the k largest values seen so far; discard anything that cannot belong to that top-k set.',
    whyItWorks: 'The smallest value in the size-k heap is exactly the threshold for entering the current top k.',
    keyQuestion: 'Is the incoming value large enough to replace the smallest member of the current top k?',
  },
  'Breadth-First Search': {
    coreRule: 'Explore a graph in layers using a queue, visiting every node at distance d before nodes at distance d+1.',
    whyItWorks: 'In an unweighted graph, the first time BFS reaches a node is through a path with the fewest edges.',
    keyQuestion: 'Which frontier nodes are waiting to be explored at the next distance layer?',
  },
  'Depth-First Search': {
    coreRule: 'Follow one branch as deeply as possible before backtracking to explore another branch.',
    whyItWorks: 'Marking visited nodes prevents cycles from causing repeated work while recursion or a stack remembers where to continue after a dead end.',
    keyQuestion: 'Can we continue deeper from this node, or is it time to backtrack?',
  },
  "Dijkstra's Shortest Path": {
    coreRule: 'Repeatedly settle the unfinished location with the smallest known travel cost, then relax its outgoing routes to improve neighboring costs.',
    whyItWorks: 'With non-negative weights, once a location has the smallest tentative cost, no later route through an unsettled location can make it cheaper.',
    keyQuestion: 'Which unsettled location has the cheapest known cost, and which neighboring costs improve through it?',
  },
  'Bellman-Ford': {
    coreRule: 'Relax every edge repeatedly for up to V−1 rounds, then do one extra round to detect a reachable negative cycle.',
    whyItWorks: 'Any simple shortest path contains at most V−1 edges, so repeated full-edge relaxation propagates optimal costs across paths of increasing length.',
    keyQuestion: 'Did this edge improve a distance, and can any edge still improve after V−1 rounds?',
  },
  'Floyd-Warshall': {
    coreRule: 'For every intermediate node k, test whether i→k→j is cheaper than the best currently known i→j route.',
    whyItWorks: 'After processing k, each table entry is optimal among paths whose allowed intermediate nodes come from the processed set.',
    keyQuestion: 'Does routing this pair through the current intermediate node reduce its distance?',
  },
  'A* Search': {
    coreRule: 'Explore the location with the smallest estimated total cost f = cost-so-far + heuristic-to-goal.',
    whyItWorks: 'An admissible heuristic guides exploration toward the goal without overestimating the remaining cost, preserving optimality while reducing unnecessary exploration.',
    keyQuestion: 'Which candidate has the best combination of known cost and estimated remaining cost?',
  },
  'Topological Sort': {
    coreRule: 'Repeatedly output a node whose prerequisites are already satisfied, then remove its outgoing dependency effects.',
    whyItWorks: 'A directed acyclic graph always has at least one zero-indegree node, and removing such nodes preserves dependency order.',
    keyQuestion: 'Which task currently has no unmet prerequisites?',
  },
  "Kruskal's MST": {
    coreRule: 'Consider edges globally from cheapest to most expensive and keep an edge only when it joins two previously separate components.',
    whyItWorks: 'The cut property guarantees that a cheapest edge crossing a component boundary is safe to include in some minimum spanning tree.',
    keyQuestion: 'Does this cheap edge connect two separate components, or would it create a cycle?',
  },
  "Prim's MST": {
    coreRule: 'Grow one connected tree by repeatedly taking the cheapest edge from the built region to an unconnected node.',
    whyItWorks: 'The cut property makes the cheapest edge leaving the current tree a safe choice for an MST.',
    keyQuestion: 'What is the cheapest edge that expands the current connected region?',
  },
  'Union-Find / Disjoint Set': {
    coreRule: 'Represent each connected group by a root; Find locates roots and Union links roots, with path compression and ranking keeping trees shallow.',
    whyItWorks: 'Two elements are connected exactly when Find returns the same representative for both.',
    keyQuestion: 'Do these two elements already have the same representative, or should their groups be merged?',
  },
  '0/1 Knapsack': {
    coreRule: 'For each item and capacity, compare the best value when the item is skipped with the best value when it is taken once.',
    whyItWorks: 'Every optimal solution for a state must make one of those two choices, so smaller capacity states contain all information needed for larger states.',
    keyQuestion: 'For this item and capacity, is taking the item better than leaving it?',
  },
  'Longest Common Subsequence': {
    coreRule: 'Build answers for prefixes of two sequences: matching characters extend a previous answer, while mismatches keep the better of dropping one side.',
    whyItWorks: 'The optimal subsequence for two prefixes is composed from optimal answers to strictly smaller prefix pairs.',
    keyQuestion: 'Do these two characters match, or should we reuse the better neighboring prefix answer?',
  },
  'Longest Increasing Subsequence': {
    coreRule: 'Track the smallest possible tail value for increasing subsequences of each length, replacing tails with binary search as values arrive.',
    whyItWorks: 'A smaller tail leaves more room to extend a subsequence later, so only the best tail per length needs to be retained.',
    keyQuestion: 'Which subsequence length should this value extend or improve?',
  },
  'Edit Distance': {
    coreRule: 'For each pair of prefixes, take the cheapest among insert, delete, or replace unless the current characters already match.',
    whyItWorks: 'Any final edit operation reduces the problem to an optimal edit sequence for smaller prefixes.',
    keyQuestion: 'Which operation—insert, delete, replace, or match—gives the cheapest transition into this cell?',
  },
  'Coin Change': {
    coreRule: 'Build the best answer for each amount by trying every usable coin as the final coin and reusing the answer for the remaining amount.',
    whyItWorks: 'If an optimal solution ends with coin c, everything before it must optimally solve amount−c.',
    keyQuestion: 'Which coin produces the best answer from a previously solved smaller amount?',
  },
  'Matrix Chain Multiplication': {
    coreRule: 'Try every split point for each matrix interval and keep the multiplication order with the lowest total scalar-operation cost.',
    whyItWorks: 'Once the final split is chosen, the left and right matrix subchains can be optimized independently.',
    keyQuestion: 'Which split point gives the cheapest left cost + right cost + final multiplication cost?',
  },
  'Fibonacci (memoized)': {
    coreRule: 'Compute F(n) recursively but store each result so repeated calls for the same n return immediately.',
    whyItWorks: 'The recursion has many overlapping subproblems; memoization converts repeated exponential work into one computation per n.',
    keyQuestion: 'Is this Fibonacci value already cached, or must it be computed from the previous two values?',
  },
  'N-Queens': {
    coreRule: 'Place one queen in a safe column for the current row, recurse to the next row, and remove the queen when the partial board leads to a dead end.',
    whyItWorks: 'Backtracking explores every feasible placement while pruning any partial board that already violates row, column, or diagonal constraints.',
    keyQuestion: 'Is this square safe, and if later rows fail, which queen must be removed?',
  },
  'Sudoku Solver': {
    coreRule: 'Choose an empty cell, try each legal digit, recurse, and undo the digit if a contradiction appears later.',
    whyItWorks: 'Every valid solution must choose one legal value for each empty cell; pruning illegal partial boards avoids exploring impossible completions.',
    keyQuestion: 'Which digits are legal in this cell, and does this choice keep the remaining puzzle solvable?',
  },
  'Permutations / Subsets': {
    coreRule: 'Choose an available item, recurse with that choice included, then undo it so the next possible choice starts from the same prior state.',
    whyItWorks: 'Systematic choose–recurse–undo traversal enumerates every decision branch exactly from the state that defines it.',
    keyQuestion: 'Which choice is being added now, and what state must be restored before trying the next choice?',
  },
  'Rat in a Maze': {
    coreRule: 'Move into a valid unvisited corridor, recurse from there, and undo the move when that corridor cannot reach the goal.',
    whyItWorks: 'Every valid path is a sequence of legal moves; backtracking eliminates dead-end prefixes while preserving alternatives at earlier junctions.',
    keyQuestion: 'Is this corridor still capable of reaching the goal, or should we return to the previous junction?',
  },
  'Activity Selection': {
    coreRule: 'Sort activities by finish time and repeatedly choose the next activity that starts after the last chosen one finishes.',
    whyItWorks: 'Finishing as early as possible leaves at least as much remaining room as any other feasible first choice.',
    keyQuestion: 'Which compatible activity finishes earliest and therefore leaves the most time for later activities?',
  },
  'Huffman Coding': {
    coreRule: 'Repeatedly merge the two least frequent symbols or subtrees, assigning shorter codes to symbols that remain closer to the root.',
    whyItWorks: 'An optimal prefix code can place the two least frequent symbols as deepest siblings, so greedily merging them reduces the problem safely.',
    keyQuestion: 'Which two least-frequent nodes should be merged next?',
  },
  'Fractional Knapsack': {
    coreRule: 'Sort items by value per unit weight and take as much as possible from the highest ratio before moving to the next.',
    whyItWorks: 'Because fractions are allowed, replacing lower-ratio weight with higher-ratio weight can only improve total value.',
    keyQuestion: 'Which remaining item gives the most value for each unit of capacity?',
  },
  'KMP Pattern Matching': {
    coreRule: 'Use the LPS table to reuse the longest useful matched prefix after a mismatch instead of restarting the pattern at zero.',
    whyItWorks: 'The LPS value identifies a prefix that is already known to equal a suffix of the matched portion, so those characters need not be compared again.',
    keyQuestion: 'After this mismatch, how much of the matched prefix can be kept using LPS?',
  },
  'Rabin-Karp': {
    coreRule: 'Compare rolling hashes of the pattern and each text window, verifying characters only when the hashes match.',
    whyItWorks: 'A rolling hash updates a window fingerprint in constant time, allowing most non-matching windows to be rejected cheaply.',
    keyQuestion: 'Does this window hash match the pattern hash, and if so, do the actual characters match too?',
  },
  'Z-Algorithm': {
    coreRule: 'For each position, compute how many characters match the prefix and reuse a previously known matching Z-box whenever possible.',
    whyItWorks: 'Positions inside an existing Z-box inherit already-proven prefix comparisons, avoiding repeated character checks.',
    keyQuestion: 'Is this position inside the current Z-box, and how much prefix-match information can be reused?',
  },
  'Longest Palindromic Substring': {
    coreRule: 'Treat each character or gap as a center and expand outward while the two sides remain equal.',
    whyItWorks: 'Every palindrome has a center, so examining all possible centers covers every candidate while expansion directly tests symmetry.',
    keyQuestion: 'Do the characters equally far from this center still match?',
  },
  'Sieve of Eratosthenes': {
    coreRule: 'Starting from the smallest unmarked number, mark all of its multiples as composite, then continue to the next unmarked number.',
    whyItWorks: 'Every composite number has a prime factor no larger than its square root, so repeated multiple-marking eventually removes every composite.',
    keyQuestion: 'Which confirmed prime is crossing out its multiples now?',
  },
  'GCD / LCM (Euclidean)': {
    coreRule: 'Replace (a,b) with (b,a mod b) until the remainder becomes zero; the last nonzero value is the GCD.',
    whyItWorks: 'Replacing a by its remainder modulo b does not change the set of common divisors.',
    keyQuestion: 'What remainder makes this pair smaller while preserving the same common divisors?',
  },
  'Fast Exponentiation': {
    coreRule: 'Square the base while halving the exponent, multiplying the result only when the current exponent bit is 1.',
    whyItWorks: 'Exponent identities let two equal multiplications be replaced by one squaring, reducing the exponent roughly by half each round.',
    keyQuestion: 'Is the current exponent odd, and what gets squared before the exponent is halved?',
  },
  'Bit Manipulation Basics': {
    coreRule: 'Use masks with AND, OR, XOR, shifts, and NOT to inspect or modify selected binary positions.',
    whyItWorks: 'Each bitwise operator applies independently to corresponding bit positions, so a carefully chosen mask targets only the intended flags.',
    keyQuestion: 'Which bit positions does the current mask read, set, clear, or toggle?',
  },
}
