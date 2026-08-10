// ── API types ──────────────────────────────────────────────────────────────────

export type Language = 'python' | 'javascript' | 'go' | 'java' | 'cpp'

export interface Step {
  type: 'compare' | 'swap' | 'set' | 'visit' | 'done' | 'call' | 'return' | 'highlight'
    | 'graph_init' | 'relax' | 'path' | 'tree_init' | 'list_init'
  indices?: number[]
  array?: (number | string)[]
  line?: number
  info?: string
  // Graph-specific fields (present when the template's renderType is "graph")
  nodes?: string[]
  edges?: [string, string, number?][]
  source?: string
  node?: string
  edge?: [string, string | null]
  distances?: Record<string, number | string>
  path?: string[]
  // Tree-specific fields (renderType "tree") — edges are [parent, child] pairs
  // Linked-list-specific fields (renderType "linked_list")
  next?: Record<string, string | null>
  lists?: Record<string, string[]>
  pointers?: Record<string, string | null>
  merged?: string[]
}

export type RenderType = 'array' | 'graph' | 'tree' | 'linked_list'

export interface VisualizationResult {
  job_id: string
  steps: Step[]
  error?: string
  language: string
  duration_ms: number
}

export interface Template {
  id: number
  name: string
  category: string
  difficulty: 'Fundamental' | 'Intermediate' | 'Advanced'
  time_complexity: string
  space_complexity: string
  render_type: RenderType
  languages: string[]
}

export interface TemplateSolution {
  template_id: number
  name: string
  category: string
  difficulty: string
  time_complexity: string
  space_complexity: string
  render_type: RenderType
  language: string
  code: string
}

// ── App state types ───────────────────────────────────────────────────────────

export type AppSource = 'custom' | 'template'

export type AppState = 'empty' | 'loaded' | 'running' | 'active' | 'error'

export interface ActiveVisualization {
  result: VisualizationResult
  template?: TemplateSolution
}

// ── Language metadata ─────────────────────────────────────────────────────────

export interface LangMeta {
  label: string
  monacoLang: string
  filename: string
  status: 'stable' | 'beta'
  runtime: string
}

export const LANGUAGES: Record<Language, LangMeta> = {
  python: {
    label: 'Python 3',
    monacoLang: 'python',
    filename: 'solution.py',
    status: 'stable',
    runtime: '3.11 · sys.settrace()',
  },
  javascript: {
    label: 'JavaScript',
    monacoLang: 'javascript',
    filename: 'solution.js',
    status: 'stable',
    runtime: 'Node 20 · source instrumentation',
  },
  go: {
    label: 'Go',
    monacoLang: 'go',
    filename: 'solution.go',
    status: 'stable',
    runtime: '1.22 · source instrumentation',
  },
  java: {
    label: 'Java',
    monacoLang: 'java',
    filename: 'Solution.java',
    status: 'stable',
    runtime: 'OpenJDK 21 · compiled in-container',
  },
  cpp: {
    label: 'C / C++',
    monacoLang: 'cpp',
    filename: 'solution.cpp',
    status: 'beta',
    runtime: 'GCC 13 (C++20)',
  },
}

export const LANGUAGE_LIST = Object.entries(LANGUAGES) as [Language, LangMeta][]
