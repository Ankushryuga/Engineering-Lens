import { useEffect, useRef, useState } from 'react'
import styles from './StepPlayer.module.css'

interface StepPlayerProps {
  totalSteps: number
  currentStep: number
  onStepChange: (step: number | ((prev: number) => number)) => void
  /** When this value changes (e.g. a new run ID), playback starts automatically. */
  autoPlayKey?: string | number
}

export default function StepPlayer({ totalSteps, currentStep, onStepChange, autoPlayKey }: StepPlayerProps) {
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(5)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-start playback whenever a new result arrives.
  useEffect(() => {
    setPlaying(true)
  }, [autoPlayKey])

  const speedMs = Math.round(1000 / (speed * 0.5))

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        onStepChange(prev => {
          const next = prev + 1
          if (next >= totalSteps - 1) {
            setPlaying(false)
            return totalSteps - 1
          }
          return next
        })
      }, speedMs)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [playing, speedMs, totalSteps, onStepChange])

  const handlePrev = () => {
    setPlaying(false)
    onStepChange(Math.max(0, currentStep - 1))
  }

  const handleNext = () => {
    setPlaying(false)
    onStepChange(Math.min(totalSteps - 1, currentStep + 1))
  }

  const handlePlayPause = () => setPlaying(p => !p)

  return (
    <div className={styles.statusbar}>
      {/* Prev */}
      <button
        className={styles.iconBtn}
        onClick={handlePrev}
        aria-label="previous step"
        disabled={currentStep === 0}
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M2 1v8M9 1L3 5l6 4V1Z" fill="currentColor"/>
        </svg>
      </button>

      {/* Play / Pause */}
      <button
        className={styles.iconBtn + ' ' + styles.playBtn}
        onClick={handlePlayPause}
        aria-label={playing ? 'pause' : 'play'}
      >
        {playing ? (
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="2" y="1" width="2" height="8" fill="currentColor"/>
            <rect x="6" y="1" width="2" height="8" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M2 1L9 5L2 9V1Z" fill="currentColor"/>
          </svg>
        )}
      </button>

      {/* Next */}
      <button
        className={styles.iconBtn}
        onClick={handleNext}
        aria-label="next step"
        disabled={currentStep >= totalSteps - 1}
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M8 1v8M1 1l6 4-6 4V1Z" fill="currentColor"/>
        </svg>
      </button>

      {/* Scrubber */}
      <div className={styles.scrubber}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={
              styles.tick +
              (i < currentStep ? ' ' + styles.done : '') +
              (i === currentStep ? ' ' + styles.now : '')
            }
            onClick={() => { setPlaying(false); onStepChange(i) }}
          />
        ))}
      </div>

      {/* Step counter */}
      <div className={styles.counter}>
        step {currentStep + 1}/{totalSteps}
      </div>

      {/* Speed */}
      <div className={styles.speed}>
        speed
        <input
          type="range"
          min={1}
          max={10}
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          style={{ width: 70, accentColor: 'var(--accent)' }}
        />
      </div>
    </div>
  )
}
