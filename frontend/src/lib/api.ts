import { Language, Template, TemplateSolution, VisualizationResult } from '@/types'

const API_BASE = '/api/v1'

// ── Visualize ─────────────────────────────────────────────────────────────────

export async function submitVisualize(
  code: string,
  language: Language
): Promise<{ job_id: string; cached: boolean }> {
  const res = await fetch(`${API_BASE}/visualize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function pollResult(jobId: string): Promise<{
  job_id: string
  status: 'pending' | 'done' | 'error'
  result?: VisualizationResult
}> {
  const res = await fetch(`${API_BASE}/visualize/${jobId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Templates ─────────────────────────────────────────────────────────────────

export async function fetchTemplates(
  category?: string,
  difficulty?: string
): Promise<Template[]> {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (difficulty) params.set('difficulty', difficulty)
  const qs = params.toString()
  const res = await fetch(`${API_BASE}/templates${qs ? `?${qs}` : ''}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchTemplateSolution(
  id: number,
  language: Language
): Promise<TemplateSolution> {
  const res = await fetch(`${API_BASE}/templates/${id}/solution?language=${language}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
