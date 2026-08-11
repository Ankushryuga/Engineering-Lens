import { useEffect, useMemo, useState } from 'react'
import { Language, Template, LANGUAGES } from '@/types'
import { fetchTemplates } from '@/lib/api'
import styles from './AlgoPicker.module.css'

interface AlgoPickerProps {
  language: Language
  onSelect: (template: Template) => void
}

const DIFFICULTIES = ['Fundamental', 'Intermediate', 'Advanced'] as const

function difficultyIcon(difficulty: string) {
  if (difficulty === 'Fundamental') return '🌱'
  if (difficulty === 'Intermediate') return '🧩'
  return '🚀'
}

export default function AlgoPicker({ language, onSelect }: AlgoPickerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [difficulty, setDifficulty] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError('')
    fetchTemplates(undefined, difficulty || undefined)
      .then(items => {
        if (active) setTemplates(items)
      })
      .catch(() => {
        if (!active) return
        setTemplates([])
        setLoadError('Could not load lessons. Check the API and try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [difficulty])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return templates
    return templates.filter(template =>
      template.name.toLowerCase().includes(q) || template.category.toLowerCase().includes(q)
    )
  }, [templates, search])

  return (
    <section className={styles.picker} aria-label="Algorithm lesson library">
      <div className={styles.toolbar}>
        <div className={styles.libraryTitle}>
          <div className={styles.titleLine}>
            <h3>Algorithm library</h3>
            <span className={styles.count}>{loading ? '…' : visible.length}</span>
          </div>
          <p>Visualization is shared across Python and Go. Source shown in {LANGUAGES[language].label}.</p>
        </div>

        <label className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.search}
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search algorithms or categories"
            aria-label="Search lessons"
          />
        </label>
      </div>

      <div className={styles.filterRow}>
        <span className={styles.filterLabel}>Difficulty</span>
        <div className={styles.filters} aria-label="Difficulty filter">
          <button type="button" className={!difficulty ? styles.filterActive : styles.filter} onClick={() => setDifficulty('')}>All</button>
          {DIFFICULTIES.map(item => (
            <button
              type="button"
              key={item}
              className={difficulty === item ? styles.filterActive : styles.filter}
              onClick={() => setDifficulty(item)}
            >
              {difficultyIcon(item)} {item}
            </button>
          ))}
        </div>
      </div>

      {loadError ? (
        <div className={styles.error}>{loadError}</div>
      ) : loading ? (
        <div className={styles.loading}>Loading lessons…</div>
      ) : visible.length === 0 ? (
        <div className={styles.loading}>No lessons match your search.</div>
      ) : (
        <div className={styles.lessonGrid}>
          {visible.map(template => (
            <button type="button" key={template.id} className={styles.lessonCard} onClick={() => onSelect(template)}>
              <div className={styles.cardMain}>
                <div className={styles.cardTop}>
                  <span className={styles.category}>{template.category}</span>
                  <span className={styles.difficulty}>{difficultyIcon(template.difficulty)} {template.difficulty}</span>
                </div>
                <strong>{template.name}</strong>
                <div className={styles.cardMeta}>
                  <span>{template.time_complexity}</span>
                  <span>{template.space_complexity}</span>
                </div>
              </div>
              <span className={styles.openLesson} aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
