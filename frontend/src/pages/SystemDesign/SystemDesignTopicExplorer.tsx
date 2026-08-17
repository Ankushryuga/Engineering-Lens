import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import topicStyles from './SystemDesignTopicExplorer.module.css'
import SystemDesignGoViz from '@/components/SystemDesignGoViz/SystemDesignGoViz'

type TopicDomain = 'backend' | 'database' | 'cloud' | 'genai'
type TopicKind = 'core' | 'appendix' | 'challenge'
type TopicLevel = 'Foundation' | 'Advanced' | 'Senior' | 'Staff'

type SystemDesignTopic = {
  id: string
  domain: TopicDomain
  domainLabel: string
  order: number
  kind: TopicKind
  level: TopicLevel
  title: string
  summary: string
  subtopics: string[]
  keyPoints: string[]
  codeBlocks: string[]
  tags: string[]
  markdown: string
  sourceFile: string
  sourceLine: number
}

type TopicPayload = {
  schemaVersion: number
  source: string
  totals: { topics: number; core: number; appendix: number; challenge?: number; referenceOnly: number; sourceSections: number }
  domains: Record<TopicDomain, number>
  topics: SystemDesignTopic[]
}

const DOMAIN_LABELS: Record<TopicDomain, string> = {
  backend: 'Backend Systems',
  database: 'Database Systems',
  cloud: 'Cloud Architecture',
  genai: 'GenAI Systems',
}

const DOMAIN_ICONS: Record<TopicDomain, string> = {
  backend: '⬡',
  database: '◫',
  cloud: '◇',
  genai: '✦',
}

function inlineMarkdown(text: string): ReactNode[] {
  const normalized = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
  const parts = normalized.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    return <span key={`${part}-${index}`}>{part.replace(/^\*|\*$/g, '')}</span>
  })
}

function MarkdownReader({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n')
  const nodes: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const raw = lines[index]
    const line = raw.trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      const marker = trimmed.slice(0, 3)
      const language = trimmed.slice(3).trim()
      const block: string[] = []
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith(marker)) {
        block.push(lines[index])
        index += 1
      }
      index += 1
      nodes.push(
        <div className={topicStyles.readerCodeWrap} key={`code-${index}`}>
          {language ? <span>{language}</span> : null}
          <pre><code>{block.join('\n')}</code></pre>
        </div>,
      )
      continue
    }

    const heading = trimmed.match(/^(#{2,4})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      const content = inlineMarkdown(heading[2])
      nodes.push(level === 2
        ? <h2 key={`h-${index}`}>{content}</h2>
        : level === 3
          ? <h3 key={`h-${index}`}>{content}</h3>
          : <h4 key={`h-${index}`}>{content}</h4>)
      index += 1
      continue
    }

    if (trimmed === '---') {
      nodes.push(<hr key={`hr-${index}`} />)
      index += 1
      continue
    }

    if (trimmed.startsWith('>')) {
      const quote: string[] = []
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quote.push(lines[index].trim().replace(/^>\s?/, ''))
        index += 1
      }
      nodes.push(<blockquote key={`quote-${index}`}>{inlineMarkdown(quote.join(' '))}</blockquote>)
      continue
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length && /^[-*+]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*+]\s+/, ''))
        index += 1
      }
      nodes.push(<ul key={`ul-${index}`}>{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{inlineMarkdown(item)}</li>)}</ul>)
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''))
        index += 1
      }
      nodes.push(<ol key={`ol-${index}`}>{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{inlineMarkdown(item)}</li>)}</ol>)
      continue
    }

    if (trimmed.startsWith('|')) {
      const table: string[] = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        table.push(lines[index])
        index += 1
      }
      nodes.push(<pre className={topicStyles.readerTable} key={`table-${index}`}>{table.join('\n')}</pre>)
      continue
    }

    const paragraph: string[] = [trimmed]
    index += 1
    while (index < lines.length) {
      const next = lines[index].trim()
      if (!next || /^(#{2,4})\s+/.test(next) || next.startsWith('```') || next.startsWith('~~~') || next.startsWith('>') || /^[-*+]\s+/.test(next) || /^\d+\.\s+/.test(next) || next === '---' || next.startsWith('|')) break
      paragraph.push(next)
      index += 1
    }
    nodes.push(<p key={`p-${index}`}>{inlineMarkdown(paragraph.join(' '))}</p>)
  }

  return <div className={topicStyles.reader}>{nodes}</div>
}

function loadCompleted(): Set<string> {
  try {
    const parsed = JSON.parse(localStorage.getItem('engineering-lens-system-design-completed') ?? '[]')
    return new Set(Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [])
  } catch {
    return new Set()
  }
}

export default function SystemDesignTopicExplorer() {
  const [payload, setPayload] = useState<TopicPayload | null>(null)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState<TopicDomain | 'all'>('all')
  const [kind, setKind] = useState<TopicKind | 'all'>('all')
  const [level, setLevel] = useState<TopicLevel | 'all'>('all')
  const [readerMode, setReaderMode] = useState<'visual' | 'source'>('visual')
  const [completed, setCompleted] = useState<Set<string>>(loadCompleted)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    let cancelled = false
    fetch('/system-design-topics.json')
      .then(response => {
        if (!response.ok) throw new Error(`topic dataset returned ${response.status}`)
        return response.json() as Promise<TopicPayload>
      })
      .then(data => {
        if (!cancelled) setPayload(data)
      })
      .catch(error => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Unable to load System Design topics')
      })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (!payload) return []
    const needle = query.trim().toLowerCase()
    return payload.topics.filter(topic => {
      if (domain !== 'all' && topic.domain !== domain) return false
      if (kind !== 'all' && topic.kind !== kind) return false
      if (level !== 'all' && topic.level !== level) return false
      if (!needle) return true
      const haystack = `${topic.title} ${topic.summary} ${topic.subtopics.join(' ')} ${topic.keyPoints.join(' ')} ${topic.tags.join(' ')} ${topic.markdown}`.toLowerCase()
      return haystack.includes(needle)
    })
  }, [payload, query, domain, kind, level])

  const requestedTopicId = searchParams.get('topic')
  const selectedTopic = useMemo(() => {
    if (!payload) return null
    const requested = requestedTopicId ? payload.topics.find(topic => topic.id === requestedTopicId) : null
    const requestedMatchesFilters = requested ? filtered.some(topic => topic.id === requested.id) : false
    return (requestedMatchesFilters ? requested : null) ?? filtered[0] ?? requested ?? payload.topics[0] ?? null
  }, [payload, requestedTopicId, filtered])

  useEffect(() => {
    if (!selectedTopic || requestedTopicId === selectedTopic.id) return
    const next = new URLSearchParams(searchParams)
    next.set('view', 'topics')
    next.set('topic', selectedTopic.id)
    setSearchParams(next, { replace: true })
  }, [requestedTopicId, searchParams, selectedTopic, setSearchParams])

  const selectTopic = (topic: SystemDesignTopic) => {
    const next = new URLSearchParams(searchParams)
    next.set('view', 'topics')
    next.set('topic', topic.id)
    setSearchParams(next)
    setReaderMode('visual')
  }

  const toggleCompleted = () => {
    if (!selectedTopic) return
    setCompleted(current => {
      const next = new Set(current)
      if (next.has(selectedTopic.id)) next.delete(selectedTopic.id)
      else next.add(selectedTopic.id)
      localStorage.setItem('engineering-lens-system-design-completed', JSON.stringify([...next]))
      return next
    })
  }

  const domainTopics = payload && selectedTopic ? payload.topics.filter(topic => topic.domain === selectedTopic.domain) : []
  const domainIndex = selectedTopic ? domainTopics.findIndex(topic => topic.id === selectedTopic.id) : -1
  const previousTopic = domainIndex > 0 ? domainTopics[domainIndex - 1] : null
  const nextTopic = domainIndex >= 0 && domainIndex < domainTopics.length - 1 ? domainTopics[domainIndex + 1] : null
  const domainCompleted = selectedTopic ? domainTopics.filter(topic => completed.has(topic.id)).length : 0

  if (loadError) {
    return <div className={topicStyles.loadingState}><strong>Unable to load the handbook topic dataset.</strong><p>{loadError}</p></div>
  }

  if (!payload || !selectedTopic) {
    return <div className={topicStyles.loadingState}><span className={topicStyles.loader}>⌁</span><strong>Loading technical System Design topics…</strong></div>
  }

  return (
    <main className={topicStyles.workspace}>
      <aside className={topicStyles.catalog}>
        <div className={topicStyles.coverageCard}>
          <span>Technical handbook coverage</span>
          <strong>{payload.totals.topics.toLocaleString()} topics</strong>
          <p>Technical System Design sections from the four bundled references. Handbook instructions, career guidance, exercises, checklists, templates, and review-only material are intentionally excluded from visualization.</p>
          <div className={topicStyles.coverageCounts}>
            <span><b>{payload.totals.core}</b> Core</span>
            <span><b>{payload.totals.appendix}</b> Appendix</span>
            <span><b>{payload.totals.referenceOnly}</b> Reference-only excluded</span>
          </div>
        </div>

        <label className={topicStyles.search}>
          <span>⌕</span>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search technical topics and source notes…" />
        </label>

        <div className={topicStyles.domainFilters}>
          <button type="button" className={domain === 'all' ? topicStyles.filterActive : ''} onClick={() => setDomain('all')}>All <em>{payload.totals.topics}</em></button>
          {(Object.keys(DOMAIN_LABELS) as TopicDomain[]).map(item => (
            <button type="button" key={item} className={domain === item ? topicStyles.filterActive : ''} onClick={() => setDomain(item)}>
              <span>{DOMAIN_ICONS[item]} {DOMAIN_LABELS[item]}</span><em>{payload.domains[item]}</em>
            </button>
          ))}
        </div>

        <div className={topicStyles.selectFilters}>
          <label><span>Section type</span><select value={kind} onChange={event => setKind(event.target.value as TopicKind | 'all')}><option value="all">All sections</option><option value="core">Core handbook</option><option value="appendix">Technical appendices</option></select></label>
          <label><span>Depth</span><select value={level} onChange={event => setLevel(event.target.value as TopicLevel | 'all')}><option value="all">All depths</option><option value="Foundation">Foundation</option><option value="Advanced">Advanced</option><option value="Senior">Senior</option><option value="Staff">Staff</option></select></label>
        </div>

        <div className={topicStyles.resultHeader}><span>{filtered.length.toLocaleString()} matching topics</span><button type="button" onClick={() => { setQuery(''); setDomain('all'); setKind('all'); setLevel('all') }}>Reset</button></div>
        <div className={topicStyles.topicList}>
          {filtered.map(topic => (
            <button type="button" key={topic.id} className={`${topicStyles.topicItem} ${topic.id === selectedTopic.id ? topicStyles.topicItemActive : ''}`} onClick={() => selectTopic(topic)}>
              <span className={topicStyles.topicIcon}>{DOMAIN_ICONS[topic.domain]}</span>
              <span className={topicStyles.topicText}>
                <small>{topic.kind === 'appendix' ? 'Appendix' : 'Core'} · {topic.level}</small>
                <strong>{topic.title}</strong>
              </span>
              {completed.has(topic.id) ? <span className={topicStyles.completeTick}>✓</span> : null}
            </button>
          ))}
          {!filtered.length ? <div className={topicStyles.noResults}>No technical source topic matches these filters.</div> : null}
        </div>
      </aside>

      <section className={topicStyles.content}>
        <header className={topicStyles.topicHeader}>
          <div>
            <div className={topicStyles.breadcrumb}>{DOMAIN_LABELS[selectedTopic.domain]} <span>›</span> {selectedTopic.kind === 'appendix' ? 'Appendix' : 'Core section'}</div>
            <h1>{selectedTopic.title}</h1>
            {selectedTopic.summary ? <p>{selectedTopic.summary}</p> : <p>Explore the source-defined structure, examples, and engineering reasoning for this topic.</p>}
          </div>
          <button type="button" className={`${topicStyles.completeButton} ${completed.has(selectedTopic.id) ? topicStyles.completeButtonDone : ''}`} onClick={toggleCompleted}>
            {completed.has(selectedTopic.id) ? '✓ Completed' : 'Mark complete'}
          </button>
        </header>

        <div className={topicStyles.topicMeta}>
          <span>{selectedTopic.level}</span>
          <span>{selectedTopic.kind}</span>
          {selectedTopic.tags.map(tag => <span key={tag}>{tag}</span>)}
          <span className={topicStyles.sourceBadge}>{selectedTopic.sourceFile} · line {selectedTopic.sourceLine}</span>
        </div>

        <div className={topicStyles.readerTabs}>
          <button type="button" className={readerMode === 'visual' ? topicStyles.readerTabActive : ''} onClick={() => setReaderMode('visual')}>Visualize</button>
          <button type="button" className={readerMode === 'source' ? topicStyles.readerTabActive : ''} onClick={() => setReaderMode('source')}>Source notes</button>
        </div>

        {readerMode === 'visual' ? (
          <div className={topicStyles.visualContent}>
            <SystemDesignGoViz topic={selectedTopic} />
            {selectedTopic.codeBlocks.length ? (
              <section className={topicStyles.sourceExample}>
                <div><span>Source flow / example</span><strong>From the attached handbook section</strong></div>
                <pre><code>{selectedTopic.codeBlocks[0]}</code></pre>
              </section>
            ) : null}
            <section className={topicStyles.visualKeyPoints}>
              <div className={topicStyles.sectionTitle}><span>Key source points</span><strong>{selectedTopic.keyPoints.length ? `${selectedTopic.keyPoints.length} extracted points` : 'Structure-first visualization'}</strong></div>
              {selectedTopic.keyPoints.length ? (
                <div className={topicStyles.keyPointGrid}>{selectedTopic.keyPoints.map((point, index) => <article key={`${point}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{point}</p></article>)}</div>
              ) : (
                <p className={topicStyles.mutedCopy}>This source section is primarily prose. Use the structured engineering view for its subsection structure, then open Source notes for the complete supplied text.</p>
              )}
            </section>
          </div>
        ) : <MarkdownReader markdown={selectedTopic.markdown} />}

        <footer className={topicStyles.topicNav}>
          <button type="button" disabled={!previousTopic} onClick={() => previousTopic && selectTopic(previousTopic)}><span>← Previous</span><strong>{previousTopic?.title ?? 'Start of domain'}</strong></button>
          <button type="button" disabled={!nextTopic} onClick={() => nextTopic && selectTopic(nextTopic)}><span>Next →</span><strong>{nextTopic?.title ?? 'End of domain'}</strong></button>
        </footer>
      </section>

      <aside className={topicStyles.inspector}>
        <section className={topicStyles.progressPanel}>
          <span>Learning progress</span>
          <strong>{domainCompleted} / {domainTopics.length}</strong>
          <p>{DOMAIN_LABELS[selectedTopic.domain]} sections completed</p>
          <div><i style={{ width: `${domainTopics.length ? (domainCompleted / domainTopics.length) * 100 : 0}%` }} /></div>
        </section>

        <section className={topicStyles.inspectorSection}>
          <span>Topic structure</span>
          {selectedTopic.subtopics.length ? (
            <ol>{selectedTopic.subtopics.map(item => <li key={item}>{item}</li>)}</ol>
          ) : <p>This section has no nested heading. Its source content is still fully available in Source notes.</p>}
        </section>

        <section className={topicStyles.inspectorSection}>
          <span>Why both views exist</span>
          <p><strong>Topic Explorer</strong> covers the technical System Design curriculum while intentionally omitting handbook navigation, career guidance, exercises, checklists, templates, and review-only sections. <strong>Architecture Labs</strong> combine many topics into end-to-end systems with playback, scale simulation, and failure injection.</p>
        </section>

        <section className={topicStyles.sourcePanel}>
          <span>Reference integrity</span>
          <strong>Source-preserving</strong>
          <p>The reader content is generated from the bundled handbooks. Technical sections are source-preserving; reference-only handbook sections remain in the bundled source files but are not presented as visualization topics.</p>
        </section>
      </aside>
    </main>
  )
}
