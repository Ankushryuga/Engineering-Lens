import { useEffect, useState } from 'react'
import { Language, Template } from '@/types'
import { fetchTemplates } from '@/lib/api'
import styles from './AlgoPicker.module.css'

interface AlgoPickerProps {
  language: Language
  onSelect: (template: Template) => void
}

const DIFFICULTIES = ['Fundamental', 'Intermediate', 'Advanced'] as const

export default function AlgoPicker({ language, onSelect }: AlgoPickerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState('')
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
        setLoadError('Could not load the algorithm catalog. Check the API and try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [difficulty])

  // Group by category
  const grouped = templates.reduce<Record<string, Template[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {})

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    const template = templates.find(t => t.id === id)
    if (template) {
      setSelectedId(id)
      onSelect(template)
    }
  }

  const availableForLang = templates.filter(t => t.languages.includes(language)).length

  return (
    <div className={styles.picker}>
      <label className={styles.label}>Algorithm</label>
      <select
        className={styles.select}
        value={selectedId ?? ''}
        onChange={handleSelect}
        disabled={loading}
      >
        <option value="">Select an algorithm...</option>
        {Object.entries(grouped).map(([category, items]) => (
          <optgroup key={category} label={category}>
            {items.map(t => (
              <option key={t.id} value={t.id} disabled={!t.languages.includes(language)}>
                {t.name}
                {!t.languages.includes(language) ? ' (not available in selected language)' : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <div className={styles.row}>
        <select
          className={styles.select}
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
        >
          <option value="">Difficulty: any</option>
          {DIFFICULTIES.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className={loadError ? styles.error : styles.count}>
        {loadError || (loading ? 'loading...' : `${availableForLang} algorithms available in ${language}`)}
      </div>
    </div>
  )
}
