import type { CSSProperties, ReactNode } from 'react'
import { Step } from '@/types'
import styles from './ConceptViz.module.css'

interface ConceptVizProps {
  name: string
  step: Step | null
  allSteps: Step[]
  currentIndex: number
}


const CONCEPT_NAMES = new Set([
  'Rat in a Maze', 'N-Queens', 'Sudoku Solver', 'Permutations / Subsets',
  'Counting Sort', 'Radix Sort', 'BST Insert / Delete / Search', 'AVL Tree Rotations',
  'Trie Insert / Search', 'K-th Largest Element', 'Bellman-Ford', 'Floyd-Warshall',
  'Union-Find / Disjoint Set', '0/1 Knapsack', 'Longest Common Subsequence',
  'Longest Increasing Subsequence', 'Edit Distance', 'Coin Change',
  'Matrix Chain Multiplication', 'Fibonacci (memoized)', 'A* Search', 'Topological Sort',
  "Kruskal's MST", "Prim's MST", 'Activity Selection', 'Huffman Coding',
  'Fractional Knapsack', 'Longest Palindromic Substring', 'GCD / LCM (Euclidean)',
  'Fast Exponentiation', 'Bit Manipulation Basics', 'KMP Pattern Matching', 'Rabin-Karp',
  'Z-Algorithm', 'Sieve of Eratosthenes', 'Heap Sort', 'Heap Insert / Extract-Min',
  'Build Heap (Heapify)', 'Level-Order (BFS) Traversal',
])

export function hasConceptVisualization(name: string) {
  return CONCEPT_NAMES.has(name)
}

function progressOf(step: Step | null, allSteps: Step[], currentIndex: number) {
  if (step?.type === 'done') return 1
  return Math.min(1, Math.max(0, currentIndex / Math.max(allSteps.length - 1, 1)))
}

function ConceptFrame({ title, subtitle, step, children }: { title: string; subtitle: string; step: Step | null; children: ReactNode }) {
  return (
    <div className={styles.frame}>
      <div className={styles.frameHead}>
        <div>
          <span className={styles.modelBadge}>Interactive concept model</span>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </div>
        {step?.line ? <span className={styles.lineBadge}>line {step.line}</span> : null}
      </div>
      <div className={styles.canvas}>{children}</div>
    </div>
  )
}

function MazeScene({ progress, step }: { progress: number; step: Step | null }) {
  const maze = [
    [1,0,0,0],
    [1,1,0,1],
    [0,1,0,0],
    [1,1,1,1],
  ]
  const route = [[0,0],[1,0],[1,1],[2,1],[3,1],[3,2],[3,3]]
  const revealed = Math.max(1, Math.ceil(progress * route.length))
  const active = route[Math.min(revealed - 1, route.length - 1)]
  const routeSet = new Set(route.slice(0, revealed).map(([r,c]) => `${r}:${c}`))
  return (
    <ConceptFrame title="Mouse in a Maze" subtitle="Try a corridor, keep valid moves, and backtrack from dead ends." step={step}>
      <div className={styles.mazeWrap}>
        <div className={styles.mazeGrid}>
          {maze.flatMap((row,r) => row.map((open,c) => {
            const key = `${r}:${c}`
            const isActive = active?.[0] === r && active?.[1] === c
            const isGoal = r === 3 && c === 3
            return <div key={key} className={`${styles.mazeCell} ${!open ? styles.mazeWall : ''} ${routeSet.has(key) ? styles.mazePath : ''} ${isActive ? styles.mazeActive : ''}`}>{!open ? '🧱' : isGoal ? '🧀' : isActive ? '🐭' : routeSet.has(key) ? '•' : ''}</div>
          }))}
        </div>
        <div className={styles.sideLesson}>
          <strong>{progress >= 1 ? 'Cheese reached!' : 'Current decision'}</strong>
          <span>{progress < .35 ? 'Move down because the right corridor is blocked.' : progress < .72 ? 'Keep following cells that are still valid.' : 'The open bottom corridor leads to the goal.'}</span>
          <div className={styles.miniTrack}><i style={{ width: `${Math.max(8, progress * 100)}%` }} /></div>
        </div>
      </div>
    </ConceptFrame>
  )
}

function QueensScene({ progress, step }: { progress: number; step: Step | null }) {
  const solution = [1,3,0,2]
  const count = Math.min(4, Math.max(1, Math.ceil(progress * 4)))
  return (
    <ConceptFrame title="Seating Four Queens Safely" subtitle="Place one queen per row without sharing a column or diagonal." step={step}>
      <div className={styles.queenLayout}>
        <div className={styles.chessboard}>
          {Array.from({length:16},(_,i) => {
            const r = Math.floor(i/4), c = i%4
            const queen = r < count && solution[r] === c
            return <div key={i} className={`${styles.chessCell} ${(r+c)%2 ? styles.chessDark : ''}`}>{queen ? '♛' : ''}</div>
          })}
        </div>
        <div className={styles.ruleStack}>
          <span className={count >= 1 ? styles.ruleDone : ''}>✓ one queen in each row</span>
          <span className={count >= 2 ? styles.ruleDone : ''}>✓ no shared columns</span>
          <span className={count >= 3 ? styles.ruleDone : ''}>✓ no shared diagonals</span>
          <span className={count >= 4 ? styles.ruleDone : ''}>✓ complete safe arrangement</span>
        </div>
      </div>
    </ConceptFrame>
  )
}

function SudokuScene({ progress, step }: { progress: number; step: Step | null }) {
  const solved = [
    1,2,3,4,5,6,7,8,9,
    4,5,6,7,8,9,1,2,3,
    7,8,9,1,2,3,4,5,6,
    2,3,4,5,6,7,8,9,1,
    5,6,7,8,9,1,2,3,4,
    8,9,1,2,3,4,5,6,7,
    3,4,5,6,7,8,9,1,2,
    6,7,8,9,1,2,3,4,5,
    9,1,2,3,4,5,6,7,8,
  ]
  const reveal = Math.max(1, Math.floor(progress * 81))
  return (
    <ConceptFrame title="Sudoku Candidate Tester" subtitle="Try a number, check row/column/box rules, undo it when a contradiction appears." step={step}>
      <div className={styles.sudokuWrap}>
        <div className={styles.sudokuGrid}>
          {solved.map((value,i) => <div key={i} className={`${styles.sudokuCell} ${i < reveal ? styles.sudokuFilled : ''}`}>{i < reveal ? value : ''}</div>)}
        </div>
        <div className={styles.sideLesson}><strong>{reveal}/81 cells demonstrated</strong><span>The real solver repeatedly tests candidates and backtracks. This model exposes that growing valid board instead of the generic four-card timeline.</span></div>
      </div>
    </ConceptFrame>
  )
}

function PermutationScene({ progress, step }: { progress: number; step: Step | null }) {
  const perms = ['1 2 3','1 3 2','2 1 3','2 3 1','3 1 2','3 2 1']
  const visible = Math.max(1, Math.ceil(progress * perms.length))
  return (
    <ConceptFrame title="Trying Every Seating Order" subtitle="Choose one remaining item, recurse, then undo the choice to try the next." step={step}>
      <div className={styles.permScene}>
        <div className={styles.choiceCards}><span>1</span><span>2</span><span>3</span></div>
        <div className={styles.arrow}>→</div>
        <div className={styles.permList}>{perms.map((p,i) => <span key={p} className={i < visible ? styles.permVisible : ''}>{i < visible ? p : '· · ·'}</span>)}</div>
      </div>
    </ConceptFrame>
  )
}

function BucketScene({ name, progress, step }: { name: string; progress: number; step: Step | null }) {
  const radix = name === 'Radix Sort'
  const values = radix ? [329,457,657,839,436,720,355] : [4,2,2,8,3,3,1]
  const activeCount = Math.max(1, Math.ceil(progress * values.length))
  const digitPlace = progress < .34 ? 1 : progress < .67 ? 10 : 100
  const bins = radix ? Array.from({length:10},(_,i) => i) : Array.from({length:9},(_,i) => i)
  const bucketFor = (v:number) => radix ? Math.floor(v / digitPlace) % 10 : v
  return (
    <ConceptFrame title={radix ? 'Postal Sorting Bins' : 'Ballot Counting Bins'} subtitle={radix ? `Sort by the ${digitPlace === 1 ? 'ones' : digitPlace === 10 ? 'tens' : 'hundreds'} digit, then collect and repeat.` : 'Count how many times each value occurs instead of comparing pairs.'} step={step}>
      <div className={styles.bucketScene}>
        <div className={styles.tokenRow}>{values.map((v,i) => <span key={i} className={i < activeCount ? styles.tokenActive : ''}>{v}</span>)}</div>
        <div className={styles.bins}>{bins.map(bin => {
          const count = values.slice(0,activeCount).filter(v => bucketFor(v) === bin).length
          return <div key={bin} className={count ? styles.binActive : ''}><strong>{bin}</strong><span>{'●'.repeat(Math.min(4,count)) || '·'}</span></div>
        })}</div>
      </div>
    </ConceptFrame>
  )
}

function TreeConceptScene({ name, progress, step }: { name: string; progress: number; step: Step | null }) {
  const trie = name === 'Trie Insert / Search'
  const avl = name === 'AVL Tree Rotations'
  const nodes = trie ? ['ROOT','c','ca','cat','car','d','do','dog'] : avl ? ['30','20','40','10','25','22'] : ['50','30','70','20','40','60','80']
  const visible = Math.max(2, Math.ceil(progress * nodes.length))
  const coords = trie
    ? [[50,4],[27,62],[73,62],[18,122],[38,122],[64,122],[82,122],[82,170]]
    : [[50,4],[29,66],[71,66],[17,132],[40,132],[61,132],[84,132],[84,178]]
  return (
    <ConceptFrame title={trie ? 'Autocomplete Prefix Tree' : avl ? 'Self-Balancing Filing Tree' : 'Reference-Number Filing Tree'} subtitle={trie ? 'Letters sharing a prefix share the same path.' : avl ? 'Rotate an unbalanced branch so lookup stays shallow.' : 'Smaller keys go left; larger keys go right.'} step={step}>
      <div className={styles.treeConcept}>
        {nodes.map((n,i) => <div key={n} className={`${styles.treeNode} ${i < visible ? styles.treeVisible : ''}`} style={{ left: `${coords[i][0]}%`, top: `${coords[i][1]}px` }}><span>{trie ? '🔤' : '🗂️'}</span><strong>{n}</strong></div>)}
      </div>
    </ConceptFrame>
  )
}

function LeaderboardScene({ progress, step }: { progress: number; step: Step | null }) {
  const bids = [92,78,88,65,83,97,74]
  const seen = Math.max(1,Math.ceil(progress*bids.length))
  const top = [...bids.slice(0,seen)].sort((a,b)=>b-a).slice(0,3)
  return (
    <ConceptFrame title="Auction Top-3 Tracker" subtitle="Keep only the three strongest bids instead of sorting every bid." step={step}>
      <div className={styles.leaderboard}>
        <div className={styles.bidStream}>{bids.map((b,i)=><span key={i} className={i < seen ? styles.bidSeen : ''}>₹{b}k</span>)}</div>
        <div className={styles.podium}>{top.map((b,i)=><div key={b}><span>{['🥇','🥈','🥉'][i]}</span><strong>₹{b}k</strong></div>)}</div>
      </div>
    </ConceptFrame>
  )
}

function CurrencyScene({ progress, step }: { progress:number; step:Step|null }) {
  const edges = [['USD','EUR','0.92'],['EUR','GBP','0.86'],['GBP','JPY','191'],['JPY','USD','0.0068']]
  const active = Math.min(edges.length-1,Math.floor(progress*edges.length))
  return (
    <ConceptFrame title="Currency Exchange Route Checker" subtitle="Relax every exchange repeatedly; a continuously improving loop signals arbitrage." step={step}>
      <div className={styles.currencyScene}>
        {edges.map(([a,b,w],i)=><div key={a+b} className={`${styles.currencyEdge} ${i<=active?styles.currencyActive:''}`}><span>{a}</span><b>→</b><small>{w}</small><span>{b}</span></div>)}
      </div>
    </ConceptFrame>
  )
}

function MatrixScene({ progress, step }: { progress:number; step:Step|null }) {
  const labels=['A','B','C','D']
  const values=[[0,3,8,7],[3,0,2,4],[8,2,0,1],[7,4,1,0]]
  const reveal=Math.max(1,Math.ceil(progress*16))
  return (
    <ConceptFrame title="All-Cities Distance Table" subtitle="Ask whether going through one intermediate city shortens each pair." step={step}>
      <div className={styles.matrixScene}>
        <div className={styles.matrixCorner}>via?</div>{labels.map(l=><strong key={`h${l}`}>{l}</strong>)}
        {labels.flatMap((r,ri)=>[<strong key={`r${r}`}>{r}</strong>,...labels.map((_,ci)=>{const i=ri*4+ci;return <span key={`${ri}-${ci}`} className={i<reveal?styles.matrixKnown:''}>{i<reveal?values[ri][ci]:'∞'}</span>})])}
      </div>
    </ConceptFrame>
  )
}

function ClusterScene({ progress, step }: { progress:number; step:Step|null }) {
  const merge = progress < .34 ? 0 : progress < .67 ? 1 : 2
  return (
    <ConceptFrame title="Friend Groups Merging" subtitle="Union connects groups; Find answers whether two people now share a group." step={step}>
      <div className={styles.clusterScene}>
        <div className={`${styles.cluster} ${merge>=1?styles.clusterJoined:''}`}><span>👩 A</span><span>👨 B</span></div>
        <div className={`${styles.cluster} ${merge>=2?styles.clusterJoined:''}`}><span>👩 C</span><span>👨 D</span></div>
        <div className={styles.cluster}><span>🧑 E</span></div>
        <div className={styles.clusterCaption}>{merge===0?'Separate circles':merge===1?'A-B group connected':'Two groups now belong to one larger set'}</div>
      </div>
    </ConceptFrame>
  )
}

const DP_MODELS: Record<string,{title:string;subtitle:string;rows:string[];cols:string[]}> = {
  'Longest Common Subsequence': { title:'DNA Similarity Table', subtitle:'Reuse answers for shorter prefixes of ABCBDAB and BDCABA.', rows:['–','A','B','C','B','D','A','B'], cols:['–','B','D','C','A','B','A'] },
  'Longest Increasing Subsequence': { title:'Rising-Score Tracker', subtitle:'Maintain the smallest possible tail for each increasing length.', rows:['length'], cols:['10','9','2','5','3','7','101','18'] },
  'Edit Distance': { title:'Autocorrect Edit Grid', subtitle:'Build the cheapest edits to turn “horse” into “ros”.', rows:['–','h','o','r','s','e'], cols:['–','r','o','s'] },
  'Coin Change': { title:'Cashier Change Planner', subtitle:'Best number of coins needed for every amount up to ₹11.', rows:['coins'], cols:['0','1','2','3','4','5','6','7','8','9','10','11'] },
  'Matrix Chain Multiplication': { title:'Matrix Multiplication Planner', subtitle:'Choose split points that minimize total multiplication work.', rows:['A₁','A₂','A₃','A₄'], cols:['A₁','A₂','A₃','A₄'] },
  'Fibonacci (memoized)': { title:'Remembered Rabbit Counts', subtitle:'Once F(n) is known, later recursive calls reuse it.', rows:['memo'], cols:['F0','F1','F2','F3','F4','F5','F6','F7'] },
  '0/1 Knapsack': { title:'Suitcase Value Table', subtitle:'For each item and weight limit, compare take vs leave.', rows:['0kg','2kg','3kg','4kg'], cols:['0','1','2','3','4','5','6'] },
}

function DpScene({ name, progress, step }: { name:string; progress:number; step:Step|null }) {
  const model=DP_MODELS[name]
  if(!model) return null
  const cells=model.rows.length*model.cols.length
  const reveal=Math.max(1,Math.ceil(progress*cells))
  return (
    <ConceptFrame title={model.title} subtitle={model.subtitle} step={step}>
      <div className={styles.dpScroll}>
        <div className={styles.dpGrid} style={{gridTemplateColumns:`90px repeat(${model.cols.length}, minmax(34px,1fr))`}}>
          <span className={styles.dpCorner}>state</span>{model.cols.map(c=><strong key={`c${c}`}>{c}</strong>)}
          {model.rows.flatMap((r,ri)=>[<strong key={`r${r}-${ri}`}>{r}</strong>,...model.cols.map((_,ci)=>{const index=ri*model.cols.length+ci;return <span key={`${ri}-${ci}`} className={index<reveal?styles.dpKnown:''}>{index<reveal?'✓':'·'}</span>})])}
        </div>
      </div>
    </ConceptFrame>
  )
}

function ScheduleScene({ progress, step }: { progress:number; step:Step|null }) {
  const acts=[[1,4],[3,5],[0,6],[5,7],[8,11],[12,16]]
  const considered=Math.max(1,Math.ceil(progress*acts.length))
  let end=-1
  const selected=new Set<number>()
  acts.slice(0,considered).sort((a,b)=>a[1]-b[1]).forEach(a=>{if(a[0]>=end){selected.add(acts.indexOf(a));end=a[1]}})
  return (
    <ConceptFrame title="Meeting-Room Schedule" subtitle="Always take the compatible meeting that finishes earliest." step={step}>
      <div className={styles.schedule}>{acts.map(([s,e],i)=><div key={i} className={`${styles.activity} ${i<considered?styles.activitySeen:''} ${selected.has(i)?styles.activityChosen:''}`} style={{marginLeft:`${s*4}%`,width:`${Math.max(9,(e-s)*4)}%`}}><strong>{s}:00–{e}:00</strong></div>)}</div>
    </ConceptFrame>
  )
}

function HuffmanScene({ progress, step }: { progress:number; step:Step|null }) {
  const leaves=[['a',5],['b',2],['r',2],['c',1],['d',1]] as const
  const merged=Math.max(1,Math.ceil(progress*4))
  return (
    <ConceptFrame title="Compressing “abracadabra”" subtitle="Repeatedly merge the two least-frequent symbols into a binary tree." step={step}>
      <div className={styles.huffman}><div className={styles.huffmanLeaves}>{leaves.map(([c,f])=><span key={c}><b>{c}</b><small>{f}×</small></span>)}</div><div className={styles.huffmanMerge}>{Array.from({length:4},(_,i)=><span key={i} className={i<merged?styles.mergeDone:''}>{i<merged?'merge ✓':'merge'}</span>)}</div><div className={styles.codeBits}><span>left = 0</span><span>right = 1</span></div></div>
    </ConceptFrame>
  )
}

function FractionalScene({ progress, step }: { progress:number; step:Step|null }) {
  const items=[['Camera',60,10],['Laptop',100,20],['Jacket',120,30]] as const
  const take=Math.max(1,Math.ceil(progress*items.length))
  return (
    <ConceptFrame title="Filling a Limited Cargo Bag" subtitle="Rank by value per kilogram; unlike 0/1 knapsack, fractions are allowed." step={step}>
      <div className={styles.knapsack}><div className={styles.items}>{items.map(([n,v,w],i)=><div key={n} className={i<take?styles.itemTaken:''}><span>📦</span><strong>{n}</strong><small>₹{v} / {w}kg</small></div>)}</div><div className={styles.bag}><span>🎒</span><strong>{Math.round(progress*100)}%</strong><small>capacity used</small></div></div>
    </ConceptFrame>
  )
}

function PalindromeScene({ progress, step }: {progress:number; step:Step|null}) {
  const text='babad'
  const radius=Math.max(0,Math.floor(progress*2))
  const center=2
  return (
    <ConceptFrame title="Expanding Around a Word Center" subtitle="Compare matching characters on both sides and grow while they agree." step={step}>
      <div className={styles.textScene}>{text.split('').map((ch,i)=><span key={i} className={Math.abs(i-center)<=radius?styles.charActive:''}>{ch}</span>)}</div>
    </ConceptFrame>
  )
}




function FloorTraversalScene({ progress, step }: { progress:number; step:Step|null }) {
  const floors=[['CEO'],['VP Eng','VP Sales'],['Mgr A','Mgr B','Sales Mgr'],['Alice','Bob','Chen']]
  const active=Math.min(floors.length-1,Math.floor(progress*floors.length))
  return (
    <ConceptFrame title="Floor-by-Floor Building Check" subtitle="Visit everybody on the current level before moving down to the next level." step={step}>
      <div className={styles.floorScene}>{floors.map((people,i)=><div key={i} className={`${styles.floor} ${i<active?styles.floorDone:''} ${i===active?styles.floorActive:''}`}><strong>Level {i}</strong><div>{people.map(p=><span key={p}>👤 {p}</span>)}</div></div>)}</div>
    </ConceptFrame>
  )
}

function StringSearchScene({ name, progress, step }: { name:string; progress:number; step:Step|null }) {
  const isKmp=name==='KMP Pattern Matching'
  const isRabin=name==='Rabin-Karp'
  const text=isKmp?'ababcabcabababd':isRabin?'GEEKS FOR GEEKS':'aabxaabxcaabxaabxay'
  const pattern=isKmp?'abab':isRabin?'GEEK':'aabx'
  const maxOffset=Math.max(0,text.length-pattern.length)
  const offset=Math.min(maxOffset,Math.floor(progress*(maxOffset+1)))
  return (
    <ConceptFrame title={isKmp?'KMP Text Scanner':isRabin?'Rolling-Hash Document Search':'Z-Window Prefix Matcher'} subtitle={isKmp?'When a mismatch occurs, reuse the LPS table instead of restarting from the next character.':isRabin?'Compare compact hashes first; inspect characters only when hashes agree.':'Reuse the current matching window when the same prefix appears later.'} step={step}>
      <div className={styles.stringSearch}>
        <div className={styles.stringRow}><small>text</small>{text.split('').map((ch,i)=><span key={i} className={i>=offset&&i<offset+pattern.length?styles.stringWindow:''}>{ch===' '?'·':ch}</span>)}</div>
        <div className={styles.patternOffset} style={{paddingLeft:`${Math.min(70,offset*18)}px`}}><small>pattern</small>{pattern.split('').map((ch,i)=><span key={i} className={styles.patternChar}>{ch}</span>)}</div>
        <div className={styles.stringRule}>{isKmp?'LPS tells us how much matched prefix can be kept.':isRabin?'Rolling hash updates the whole window in O(1).':'The Z box remembers a prefix match interval.'}</div>
      </div>
    </ConceptFrame>
  )
}

function SieveScene({ progress, step }: { progress:number; step:Step|null }) {
  const max=30
  const eliminated=new Set<number>()
  const primes=[2,3,5]
  const rounds=Math.max(1,Math.ceil(progress*primes.length))
  for(const p of primes.slice(0,rounds)) for(let n=p*p;n<=max;n+=p) eliminated.add(n)
  return (
    <ConceptFrame title="Crossing Out Composite Numbers" subtitle="Take the next prime and cross out its multiples; numbers left standing are prime." step={step}>
      <div className={styles.sieve}>{Array.from({length:max-1},(_,i)=>i+2).map(n=><span key={n} className={eliminated.has(n)?styles.composite:styles.primeCandidate}>{n}</span>)}</div>
    </ConceptFrame>
  )
}

function HeapScene({ name, progress, step }: { name:string; progress:number; step:Step|null }) {
  const values=name==='Heap Sort'?[9,7,8,3,2,5,6]:name==='Build Heap (Heapify)'?[4,10,3,5,1,8,2]:[2,4,6,9,7,8]
  const active=Math.min(values.length-1,Math.floor(progress*values.length))
  return (
    <ConceptFrame title={name==='Heap Sort'?'Emergency Priority Heap':name==='Build Heap (Heapify)'?'Bulk Triage Rebuild':'Hospital Priority Queue'} subtitle={name==='Heap Sort'?'Repeatedly remove the highest-priority patient, then restore the heap.':name==='Build Heap (Heapify)'?'Turn an unsorted waiting list into a valid heap from the bottom upward.':'Insert or remove one patient while keeping the most urgent case at the root.'} step={step}>
      <div className={styles.heapScene}>
        {values.map((v,i)=><div key={i} className={`${styles.heapNode} ${i<=active?styles.heapSeen:''}`} style={{'--heap-i':i} as CSSProperties}><span>{i===0?'🚑':'👤'}</span><strong>{v}</strong><small>priority</small></div>)}
      </div>
    </ConceptFrame>
  )
}

function AStarGridScene({ progress, step }: { progress:number; step:Step|null }) {
  const cells = [
    ['S', '.', '.'],
    ['.', '#', '.'],
    ['.', '.', 'G'],
  ]
  const visit = [[0,0],[0,1],[1,0],[0,2],[2,0],[1,2],[2,1],[2,2]]
  const path = new Set(['0:0','0:1','0:2','1:2','2:2'])
  const seen = Math.max(1, Math.ceil(progress * visit.length))
  const seenSet = new Set(visit.slice(0,seen).map(([r,c])=>`${r}:${c}`))
  const active = visit[Math.min(seen-1,visit.length-1)]
  return (
    <ConceptFrame title="Delivery Route Finder · A*" subtitle="Explore streets using distance-so-far plus an estimate of how close each street is to the customer." step={step}>
      <div className={styles.routeGridWrap}>
        <div className={styles.routeGrid}>
          {cells.flatMap((row,r)=>row.map((cell,c)=>{
            const key=`${r}:${c}`
            const onPath=progress>.76&&path.has(key)
            const isActive=active?.[0]===r&&active?.[1]===c
            return <div key={key} className={`${styles.routeCell} ${cell==='#'?styles.routeBuilding:''} ${seenSet.has(key)?styles.routeSeen:''} ${isActive?styles.routeActive:''} ${onPath?styles.routePath:''}`}>{cell==='S'?'🏭':cell==='G'?'📦':cell==='#'?'🏢':''}</div>
          }))}
        </div>
        <div className={styles.sideLesson}><strong>{progress>.76?'Best route highlighted':'Choosing the next promising street'}</strong><span>A* differs from Dijkstra by adding a heuristic: it prefers streets that also look closer to the destination.</span></div>
      </div>
    </ConceptFrame>
  )
}

function DependencyScene({ progress, step }: { progress:number; step:Step|null }) {
  const tasks=['Mix batter','Bake cake','Cool cake','Make icing','Frost cake']
  const count=Math.max(1,Math.ceil(progress*tasks.length))
  return (
    <ConceptFrame title="Recipe Dependency Planner" subtitle="A task enters the schedule only after all prerequisites are complete." step={step}>
      <div className={styles.dependencyScene}>{tasks.map((task,i)=><div key={task} className={i<count?styles.dependencyDone:''}><span>{i<count?'✓':i+1}</span><strong>{task}</strong>{i<tasks.length-1?<b>→</b>:null}</div>)}</div>
    </ConceptFrame>
  )
}

function MstScene({ name, progress, step }: { name:string; progress:number; step:Step|null }) {
  const prim=name==="Prim's MST"
  const links=prim
    ? [['A','B',2],['B','C',1],['B','D',4],['A','C',3],['C','D',5]] as const
    : [['A','C',1],['B','D',1],['B','C',2],['A','B',4],['C','D',5]] as const
  const chosen=prim ? [0,1,2] : [0,1,2]
  const considered=Math.max(1,Math.ceil(progress*links.length))
  return (
    <ConceptFrame title={prim?'Growing a Power Grid':'Cheapest-Road Village Network'} subtitle={prim?'Grow outward from one powered town, always attaching the cheapest new town.':'Sort all possible roads by cost and keep the cheapest links that do not create a cycle.'} step={step}>
      <div className={styles.mstScene}>
        <div className={styles.mstNodes}><span>A</span><span>B</span><span>C</span><span>D</span></div>
        <div className={styles.mstLinks}>{links.map(([a,b,w],i)=><div key={`${a}${b}`} className={`${i<considered?styles.mstSeen:''} ${i<considered&&chosen.includes(i)?styles.mstChosen:''}`}><strong>{a}—{b}</strong><small>cost {w}</small><span>{i<considered&&chosen.includes(i)?'keep':'consider'}</span></div>)}</div>
      </div>
    </ConceptFrame>
  )
}

function MathScene({ name, progress, step }: {name:string;progress:number;step:Step|null}) {
  if(name==='GCD / LCM (Euclidean)') {
    const seq=[[48,18],[18,12],[12,6],[6,0]]
    const active=Math.min(seq.length-1,Math.floor(progress*seq.length))
    return <ConceptFrame title="Sharing Into Equal-Sized Groups" subtitle="Replace (a,b) with (b,a mod b) until the remainder becomes zero." step={step}><div className={styles.euclid}>{seq.map(([a,b],i)=><div key={i} className={i<=active?styles.mathActive:''}><span>{a}</span><b>mod</b><span>{b}</span>{i<seq.length-1?<em>→</em>:<strong>GCD = {a}</strong>}</div>)}</div></ConceptFrame>
  }
  if(name==='Fast Exponentiation') {
    const seq=['2¹³','2⁶ × 2','2³ × 2','2¹ × 2','result']
    const active=Math.min(seq.length-1,Math.floor(progress*seq.length))
    return <ConceptFrame title="Doubling by Squaring" subtitle="Halve the exponent repeatedly instead of multiplying one-by-one." step={step}><div className={styles.powerChain}>{seq.map((s,i)=><span key={s} className={i<=active?styles.mathActive:''}>{s}</span>)}</div></ConceptFrame>
  }
  if(name==='Bit Manipulation Basics') {
    const bits='10110110'.split('')
    const active=Math.min(bits.length-1,Math.floor(progress*bits.length))
    return <ConceptFrame title="Switchboard of On/Off Flags" subtitle="Masks read, set, clear, or toggle individual binary switches." step={step}><div className={styles.bits}>{bits.map((b,i)=><span key={i} className={i===active?styles.bitActive:''}>{b}<small>{i}</small></span>)}</div></ConceptFrame>
  }
  return null
}

export default function ConceptViz({ name, step, allSteps, currentIndex }: ConceptVizProps) {
  const progress=progressOf(step,allSteps,currentIndex)
  if(name==='Level-Order (BFS) Traversal') return <FloorTraversalScene progress={progress} step={step}/>
  if(name==='KMP Pattern Matching'||name==='Rabin-Karp'||name==='Z-Algorithm') return <StringSearchScene name={name} progress={progress} step={step}/>
  if(name==='Sieve of Eratosthenes') return <SieveScene progress={progress} step={step}/>
  if(name==='Heap Sort'||name==='Heap Insert / Extract-Min'||name==='Build Heap (Heapify)') return <HeapScene name={name} progress={progress} step={step}/>
  if(name==='Rat in a Maze') return <MazeScene progress={progress} step={step}/>
  if(name==='N-Queens') return <QueensScene progress={progress} step={step}/>
  if(name==='Sudoku Solver') return <SudokuScene progress={progress} step={step}/>
  if(name==='Permutations / Subsets') return <PermutationScene progress={progress} step={step}/>
  if(name==='Counting Sort'||name==='Radix Sort') return <BucketScene name={name} progress={progress} step={step}/>
  if(name==='BST Insert / Delete / Search'||name==='AVL Tree Rotations'||name==='Trie Insert / Search') return <TreeConceptScene name={name} progress={progress} step={step}/>
  if(name==='K-th Largest Element') return <LeaderboardScene progress={progress} step={step}/>
  if(name==='Bellman-Ford') return <CurrencyScene progress={progress} step={step}/>
  if(name==='Floyd-Warshall') return <MatrixScene progress={progress} step={step}/>
  if(name==='Union-Find / Disjoint Set') return <ClusterScene progress={progress} step={step}/>
  if(DP_MODELS[name]) return <DpScene name={name} progress={progress} step={step}/>
  if(name==='A* Search') return <AStarGridScene progress={progress} step={step}/>
  if(name==='Topological Sort') return <DependencyScene progress={progress} step={step}/>
  if(name==="Kruskal's MST"||name==="Prim's MST") return <MstScene name={name} progress={progress} step={step}/>
  if(name==='Activity Selection') return <ScheduleScene progress={progress} step={step}/>
  if(name==='Huffman Coding') return <HuffmanScene progress={progress} step={step}/>
  if(name==='Fractional Knapsack') return <FractionalScene progress={progress} step={step}/>
  if(name==='Longest Palindromic Substring') return <PalindromeScene progress={progress} step={step}/>
  if(name==='GCD / LCM (Euclidean)'||name==='Fast Exponentiation'||name==='Bit Manipulation Basics') return <MathScene name={name} progress={progress} step={step}/>
  return null
}
