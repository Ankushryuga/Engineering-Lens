import { Step } from '@/types'
import styles from './BarViz.module.css'

interface BarVizProps {
  step: Step | null
  allSteps: Step[]
}

function getBarClass(index: number, step: Step | null): string {
  if (!step) return ''
  if (step.type === 'swap' && step.indices?.includes(index)) return styles.swap
  if (step.type === 'compare' && step.indices?.includes(index)) return styles.compare
  if (step.type === 'done' || step.type === 'set') {
    if (step.indices?.includes(index)) return styles.done
  }
  if (step.type === 'highlight' && step.indices?.includes(index)) return styles.highlight
  return ''
}

function stepInfo(step: Step | null): string {
  if (!step) return ''
  if (step.info) return step.info
  switch (step.type) {
    case 'compare':
      return 'comparing arr[' + (step.indices ?? []).join('] and arr[') + ']'
    case 'swap':
      return 'swapping arr[' + (step.indices ?? []).join('] and arr[') + ']'
    case 'set':
      return 'setting arr[' + (step.indices?.[0] ?? '') + ']'
    case 'done':
      return 'complete'
    default:
      return step.type
  }
}

export default function BarViz({ step, allSteps }: BarVizProps) {
  const arr = step?.array ?? [...allSteps].reverse().find(s => s.array)?.array ?? []
  const numericItems = arr
    .map((value, index) => ({ value: Number(value), index }))
    .filter(item => !Number.isNaN(item.value))
  const max = Math.max(...numericItems.map(item => item.value), 1)

  if (numericItems.length === 0) {
    return (
      <div className={styles.empty}>
        <span>no array data in this step</span>
      </div>
    )
  }

  const swatchClass =
    step?.type === 'swap' ? styles.swapSwatch :
    step?.type === 'compare' ? styles.compareSwatch :
    step?.type === 'done' ? styles.doneSwatch : styles.defaultSwatch

  return (
    <div className={styles.root}>
      <div className={styles.vizBody}>
        {numericItems.map(({ value: val, index }) => {
          const heightPct = Math.max((val / max) * 100, 2) + '%'
          const barClass = getBarClass(index, step)
          return (
            <div
              key={index}
              className={styles.bar + (barClass ? ' ' + barClass : '')}
              style={{ height: heightPct }}
              title={'arr[' + index + '] = ' + val}
            />
          )
        })}
      </div>
      {step && (
        <div className={styles.status}>
          <span className={styles.swatch + ' ' + swatchClass} />
          {stepInfo(step)}
        </div>
      )}
    </div>
  )
}
