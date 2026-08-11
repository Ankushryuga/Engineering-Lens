import { Step } from '@/types'
import styles from './TraceViz.module.css'

interface TraceVizProps {
  step: Step | null
  allSteps: Step[]
  currentIndex: number
}

function labelForStep(step: Step | null): string {
  if (!step) return 'Ready'
  switch (step.type) {
    case 'compare': return 'Compare'
    case 'swap': return 'Reorder'
    case 'set': return 'Update state'
    case 'visit': return 'Visit'
    case 'relax': return 'Improve route'
    case 'path': return 'Confirm path'
    case 'call': return 'Break down problem'
    case 'return': return 'Reuse answer'
    case 'done': return 'Complete'
    case 'highlight': return step.line ? 'Execute line' : 'Algorithm phase'
    default: return 'Algorithm step'
  }
}

export default function TraceViz({ step, allSteps, currentIndex }: TraceVizProps) {
  const total = Math.max(allSteps.length, 1)
  const progress = allSteps.length === 0 ? 0 : Math.round(((currentIndex + 1) / total) * 100)
  const start = Math.max(0, currentIndex - 3)
  const end = Math.min(allSteps.length, currentIndex + 4)
  const nearby = allSteps.slice(start, end)

  return (
    <div className={styles.root}>
      <div className={styles.summary}>
        <div>
          <span className={styles.kicker}>Execution trace</span>
          <h3>{labelForStep(step)}</h3>
          <p>{step?.info || (step?.line ? `Running source line ${step.line}` : 'Following the algorithm one decision at a time.')}</p>
        </div>
        <div className={styles.progressBadge}>{progress}%</div>
      </div>

      <div className={styles.track} aria-label={`Execution ${progress}% complete`}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.timeline}>
        {nearby.map((item, offset) => {
          const index = start + offset
          const active = index === currentIndex
          return (
            <div key={`${index}-${item.type}`} className={`${styles.row} ${active ? styles.active : ''}`}>
              <span className={styles.stepNo}>{index + 1}</span>
              <span className={styles.dot} />
              <div className={styles.rowBody}>
                <strong>{labelForStep(item)}</strong>
                <span>{item.info || (item.line ? `Source line ${item.line}` : item.type)}</span>
              </div>
              {item.line && <span className={styles.line}>L{item.line}</span>}
            </div>
          )
        })}
      </div>

      <div className={styles.note}>
        This algorithm does not expose a single array or graph at this step, so this timeline shows algorithm progress instead of inventing visual state.
      </div>
    </div>
  )
}
