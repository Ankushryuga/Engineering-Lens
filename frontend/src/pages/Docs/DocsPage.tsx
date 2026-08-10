import { Link } from 'react-router-dom'
import styles from './DocsPage.module.css'

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
          <h1>algo-visualizer</h1>
          <p>
            algo-visualizer is an interactive algorithm step-player. Paste any function
            in one of the five supported languages, click Run, and inspect every
            comparison, swap, and recursive call as a reproducible, seekable sequence of
            steps — without writing any instrumentation code yourself.
          </p>
          <p>
            Alternatively, pick a canonical algorithm from the built-in catalog and run
            it against the same engine. The catalog and the custom-code path share the
            same sandbox, the same step format, and the same player.
          </p>
        </section>

        <section id="first-run">
          <h2>Your first run</h2>
          <ol className={styles.steps}>
            <li>Open the <Link to="/app">app</Link>.</li>
            <li>Choose a language in the left sidebar.</li>
            <li>
              Either pick an algorithm from the <strong>Algorithm templates</strong>{' '}
              dropdown, or paste your own code into the editor.
            </li>
            <li>Click <strong>Run</strong>. Your code executes in an isolated sandbox.</li>
            <li>
              Use the step player at the bottom to play, pause, step forward/back, and
              scrub through the visualization.
            </li>
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
  "type":    "compare" | "swap" | "set" | "visit" | "done" | "call" | "return",
  "indices": [1, 2],          // element positions involved (optional)
  "array":   [5, 3, 8, 1],   // full array state at this step (optional)
  "line":    5,               // source line that produced this step (optional)
  "info":    "comparing arr[1] and arr[2]"  // human-readable message (optional)
}`}
          </div>
        </section>

        <section id="languages">
          <h2>Language support</h2>
          <p>
            All five runtimes normalise to the same <code>steps[]</code> output, so the
            player and every other surface stay identical regardless of what you paste.
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Language</th>
                <th>Runtime</th>
                <th>Execution model</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Python', '3.11', 'sys.settrace() line-level trace', 'stable'],
                ['JavaScript', 'Node 20', 'Source-level instrumentation', 'stable'],
                ['Go', '1.22', 'Build + source-level instrumentation', 'stable'],
                ['Java', 'OpenJDK 21', 'Compiled then run in-container', 'stable'],
                ['C / C++', 'GCC 13 (C++20)', 'Compiled then run in-container', 'beta'],
              ].map(([lang, rt, model, status]) => (
                <tr key={lang}>
                  <td>{lang}</td>
                  <td><code>{rt}</code></td>
                  <td>{model}</td>
                  <td>
                    <span className={styles.chip + ' ' + (status === 'beta' ? styles.beta : styles.stable)}>
                      {status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="sandbox">
          <h2>Sandbox &amp; safety</h2>
          <p>
            Each language runs in its own Docker image. Sandboxes are configured with:
          </p>
          <ul className={styles.list}>
            <li>No outbound network access (workers are attached only to an internal Kafka network)</li>
            <li>Hard wall-clock timeout (10 s interpreted, 20 s compiled)</li>
            <li>Memory cap (128 MB interpreted, 256 MB compiled)</li>
            <li>Read-only filesystem except a per-job scratch directory</li>
            <li>Non-root user inside the container</li>
          </ul>
          <p>
            Additionally, a static pre-check rejects obviously malicious patterns
            (e.g. <code>os.system</code> in Python, <code>child_process</code> in JS)
            before code reaches the sandbox. This is defense-in-depth, not a
            replacement for the container isolation.
          </p>
        </section>

        <section id="catalog">
          <h2>Algorithm catalog</h2>
          <p>
            The catalog contains ~50 canonical, team-authored algorithms across 11
            categories. Every entry stores: name, category, difficulty tier
            (Fundamental / Intermediate / Advanced), time and space complexity, and
            reference solutions, with Python coverage across the full catalog and other languages being backfilled.
          </p>
          <table className={styles.table}>
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
          </table>
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
