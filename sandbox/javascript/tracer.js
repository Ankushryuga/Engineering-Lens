'use strict'
/**
 * tracer.js — Instruments and executes untrusted JavaScript, emitting a
 * normalized steps[] trace compatible with the algo-visualizer frontend.
 *
 * Approach (documented trade-off — see requirement_doc.md §3.2 / §3.8):
 * A full V8-inspector line-by-line trace (attaching the Debugger domain and
 * single-stepping through call frames) is significantly more complex to
 * sandbox safely and was descoped for this build. Instead we use the same
 * pragmatic *source-level instrumentation* strategy documented in the
 * requirement doc for the compiled languages (Go/Java/C++): the source is
 * scanned for `name[expr]` indexing patterns used in comparisons and
 * assignments, and record-step calls are injected around them before
 * execution. This correctly visualizes idiomatic comparison/swap style
 * sorting and searching code without requiring any changes from the user.
 */

const vm = require('vm')

const MAX_STEPS = 2000

/** Detects the first array-of-numbers identifier declared or assigned in the source. */
function findSubjectName(code) {
  const patterns = [
    /(?:let|const|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\[[^\]]*\d[^\]]*\]/,
    /function\s+\w+\s*\(\s*([A-Za-z_$][\w$]*)/, // first function's first param
  ]
  for (const p of patterns) {
    const m = code.match(p)
    if (m) return m[1]
  }
  return null
}

function instrument(code, subject) {
  if (!subject) return code

  const lines = code.split('\n')
  const escaped = subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const idxRe = new RegExp(`${escaped}\\s*\\[\\s*([^\\]]+?)\\s*\\]`, 'g')
  const compareOpRe = /[<>]=?|===?/

  const out = []
  for (const line of lines) {
    if (compareOpRe.test(line)) {
      const indices = []
      let match
      idxRe.lastIndex = 0
      while ((match = idxRe.exec(line)) !== null) indices.push(match[1])
      if (indices.length >= 2) {
        out.push(`__record_compare__((${indices[0]}), (${indices[1]}), ${subject});`)
      }
    }

    out.push(line)

    idxRe.lastIndex = 0
    const touchesSubject = idxRe.test(line)
    const hasPlainAssign = /(?<![<>=!])=(?!=)/.test(line)
    if (touchesSubject && hasPlainAssign) {
      out.push(`__record_mutation__(${subject});`)
    }
  }
  return out.join('\n')
}

function run(code) {
  const steps = []
  const subject = findSubjectName(code)
  const instrumented = instrument(code, subject)

  let stepCount = 0
  let previousArray = null
  const sandbox = {
    console: { log: () => {}, error: () => {} },
    __record_compare__(i, j, arr) {
      if (stepCount++ >= MAX_STEPS) return
      const snapshot = Array.isArray(arr) ? arr.slice() : undefined
      if (snapshot && previousArray === null) previousArray = snapshot.slice()
      steps.push({
        type: 'compare',
        indices: [i, j],
        array: snapshot,
        info: `comparing arr[${i}] and arr[${j}]`,
      })
    },
    __record_mutation__(arr) {
      if (stepCount++ >= MAX_STEPS) return
      const snapshot = Array.isArray(arr) ? arr.slice() : undefined
      if (!snapshot) return
      if (previousArray === null) {
        previousArray = snapshot.slice()
        return
      }
      const changed = snapshot.reduce((indices, value, index) => {
        if (value !== previousArray[index]) indices.push(index)
        return indices
      }, [])
      if (changed.length === 2) {
        steps.push({ type: 'swap', indices: changed, array: snapshot, info: `swapping arr[${changed[0]}] and arr[${changed[1]}]` })
      } else if (changed.length === 1) {
        steps.push({ type: 'set', indices: changed, array: snapshot, info: `setting arr[${changed[0]}]` })
      }
      previousArray = snapshot.slice()
    },
  }

  const context = vm.createContext(sandbox)
  vm.runInContext(instrumented, context, { timeout: 10000, filename: 'user_code.js' })

  if (steps.length === 0) {
    steps.push({ type: 'done', info: 'execution completed — no array-based state changes detected' })
  } else {
    steps.push({ type: 'done', array: steps[steps.length - 1].array, info: 'done' })
  }

  return steps
}

// ── Entry point: read code from stdin, print {ok, steps} JSON to stdout ──────
let input = ''
process.stdin.on('data', (chunk) => { input += chunk })
process.stdin.on('end', () => {
  try {
    const steps = run(input)
    process.stdout.write(JSON.stringify({ ok: true, steps }))
  } catch (e) {
    process.stdout.write(JSON.stringify({ ok: false, error: `${e.name}: ${e.message}` }))
  }
})
