import { Link } from 'react-router-dom'
import styles from './DocsPage.module.css'
import { LANGUAGE_LIST } from '@/types'

export default function DocsPage() {
  return (
    <div className={styles.shell}>
      {/* Sidebar nav */}
      <nav className={styles.nav}>
        <div className={styles.navGroup}>
          <h5>Getting started</h5>
          <a href="#overview" className={styles.current}>Overview</a>
          <a href="#first-run">Your first run</a>
          <a href="#step-schema">Step schema</a>
        </div>
        <div className={styles.navGroup}>
          <h5>Languages</h5>
          <a href="#languages">Support matrix</a>
          <a href="#sandbox">Sandbox &amp; safety</a>
        </div>
        <div className={styles.navGroup}>
          <h5>Algorithm templates</h5>
          <a href="#catalog">Full catalog</a>
          <a href="#api">API reference</a>
        </div>
      </nav>

      {/* Content */}
      <main className={styles.content}>
        <section id="overview">
          <h1>AlgoWeave</h1>
          <p>
            AlgoWeave is an interactive algorithm learning lab. Start from a guided real-world
            Story view or run your own code, then inspect the same execution as a reproducible,
            seekable trace. Explanations and source code are optional layers so the concept can
            stay visible before implementation detail takes over.
          </p>
          <p>
            The guided catalog and custom-code path share the same sandbox, normalized step
            format, and player. The bundled catalog contains 55 canonical lessons across all 11
            DSA categories, with both Python and Go reference solutions for every lesson.
          </p>
        </section>

        <section id="first-run">
          <h2>Your first run</h2>
          <ol className={styles.steps}>
            <li>Open <Link to="/app?mode=guided">Guided lessons</Link> or the <Link to="/app?mode=custom">custom-code lab</Link>.</li>
            <li>For a guided lesson, search the catalog and choose an algorithm card.</li>
            <li>Click <strong>Run &amp; visualize</strong>. Source code stays hidden unless you choose <strong>Show source code</strong>.</li>
            <li>Use the player above the visualization to play, pause, step forward/back, and scrub through the trace.</li>
            <li>Enable <strong>Explain how it works</strong> to see what the current step is doing, why it happens, and what changed.</li>
          </ol>
        </section>

        <section id="step-schema">
          <h2>Step schema</h2>
          <p>
            Every sandbox normalises its output to the same JSON shape, regardless of
            language. The frontend player and the rest of the pipeline are fully
            language-agnostic.
          </p>
          <div className={styles.codeBlock}>
{`{
  "type":    "compare" | "swap" | "set" | "visit" | "relax" | "path" | "done" | ... ,
  "indices": [1, 2],          // element positions involved (optional)
  "array":   [5, 3, 8, 1],   // full array state at this step (optional)
  "line":    5,               // source line that produced this step (optional)
  "info":    "comparing arr[1] and arr[2]", // human-readable message (optional)
  "grid":    [[1, 1, -1], ...],             // pathfinding state when relevant
  "cell":    [7, 12]                         // current grid cell when relevant
}`}
          </div>
        </section>

        <section id="languages">
          <h2>Language support</h2>
          <p>
            Python and Go both normalise to the same <code>steps[]</code> output, so the
            player and every other learning surface use the same execution contract.
          </p>
          <div className={styles.tableScroll}><table className={styles.table}>
            <thead>
              <tr>
                <th>Language</th>
                <th>Runtime</th>
                <th>Execution model</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {LANGUAGE_LIST.map(([key, meta]) => (
                <tr key={key}>
                  <td>{meta.label}</td>
                  <td><code>{meta.runtime.split(' · ')[0]}</code></td>
                  <td>{meta.runtime.split(' · ').slice(1).join(' · ') || 'Sandboxed execution'}</td>
                  <td>
                    <span className={styles.chip + ' ' + (meta.status === 'beta' ? styles.beta : styles.stable)}>
                      {meta.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </section>

        <section id="sandbox">
          <h2>Sandbox &amp; safety</h2>
          <p>
            Python and Go each run in their own Docker image. Sandboxes are configured with:
          </p>
          <ul className={styles.list}>
            <li>No outbound network access (workers are attached only to an internal Kafka network)</li>
            <li>Hard wall-clock timeout (10 s for Python, 20 s for Go)</li>
            <li>Memory cap (128 MB for Python, 256 MB for Go)</li>
            <li>Read-only filesystem except a per-job scratch directory</li>
            <li>Non-root user inside the container</li>
          </ul>
          <p>
            Additionally, a static pre-check rejects obviously malicious patterns
            (e.g. <code>os.system</code> in Python and <code>os/exec</code> in Go)
            before code reaches the sandbox. This is defense-in-depth, not a
            replacement for the container isolation.
          </p>
        </section>

        <section id="catalog">
          <h2>Algorithm catalog</h2>
          <p>
            The catalog contains 55 canonical, team-authored algorithms across 11
            categories. Every entry stores: name, category, difficulty tier
            (Fundamental / Intermediate / Advanced), time and space complexity, and
            reference solutions. Every guided lesson ships in both Python and Go, and the custom-code path intentionally supports those same two runtimes only.
          </p>
          <div className={styles.tableScroll}><table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Example entries</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Sorting', 'Bubble Sort, Merge Sort, Quick Sort, Heap Sort, Counting Sort'],
                ['Searching', 'Binary Search, Ternary Search'],
                ['Linked Lists', "Reverse, Cycle Detection (Floyd's), Merge Sorted"],
                ['Trees', 'Inorder / BFS Traversal, BST Insert/Delete, LCA, Trie'],
                ['Heaps', 'Insert / Extract-Min, Build Heap, K-th Largest'],
                ['Graphs', "BFS, DFS, Dijkstra, Bellman-Ford, A*, Kruskal's, Prim's"],
                ['Dynamic Programming', '0/1 Knapsack, LCS, LIS, Edit Distance, Coin Change'],
                ['Backtracking', 'N-Queens, Sudoku Solver, Permutations'],
                ['Greedy', 'Activity Selection, Huffman Coding, Fractional Knapsack'],
                ['Strings', 'KMP, Rabin-Karp, Z-Algorithm, Longest Palindromic Substring'],
                ['Math & Bit Manipulation', 'Sieve of Eratosthenes, GCD/LCM, Fast Exponentiation'],
              ].map(([cat, examples]) => (
                <tr key={cat}>
                  <td><strong>{cat}</strong></td>
                  <td>{examples}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </section>

        <section id="api">
          <h2>API reference</h2>

          <h3>POST /api/v1/visualize</h3>
          <p>Submit code for sandboxed execution. Returns a job ID.</p>
          <div className={styles.codeBlock}>
{`// Request
{ "code": "def bubble_sort(arr): ...", "language": "python" }

// Response 202
{ "job_id": "3f4a2b1c-...", "cached": false }

// Response 200 (cache hit)
{ "job_id": "3f4a2b1c-...", "cached": true }`}
          </div>

          <h3>GET /api/v1/visualize/:job_id</h3>
          <p>Long-poll for a result (up to 25 s). Use WebSocket for push delivery.</p>
          <div className={styles.codeBlock}>
{`// Response — pending
{ "job_id": "...", "status": "pending" }

// Response — done
{ "job_id": "...", "status": "done", "result": { "steps": [...], "duration_ms": 42 } }`}
          </div>

          <h3>WebSocket /ws/:job_id</h3>
          <p>Push-based result delivery. The server sends periodic <code>{"{ \"status\": \"pending\" }"}</code> keepalives, then a single <code>{"{ \"status\": \"done\", \"result\": {...} }"}</code> message.</p>

          <h3>GET /api/v1/templates</h3>
          <p>List templates, optionally filtered by <code>category</code> and <code>difficulty</code>.</p>

          <h3>GET /api/v1/templates/:id/solution?language=</h3>
          <p>Fetch the reference solution for a template in a specific language.</p>
        </section>
      </main>
    </div>
  )
}
