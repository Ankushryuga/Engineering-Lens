import { useEffect, useId, useState } from 'react'
import { renderSystemDesignTopic } from '@/lib/systemDesignWasm'
import './SystemDesignGoViz.css'

type SystemDesignGoVizProps = {
  topic: object
}

export default function SystemDesignGoViz({ topic }: SystemDesignGoVizProps) {
  const reactId = useId().replace(/:/g, '')
  const containerId = `go-system-design-${reactId}`
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError('')
    renderSystemDesignTopic(containerId, topic)
      .then(() => {
        if (!cancelled) setStatus('ready')
      })
      .catch(reason => {
        if (cancelled) return
        setStatus('error')
        setError(reason instanceof Error ? reason.message : 'Unable to start Go visualization engine')
      })
    return () => { cancelled = true }
  }, [containerId, topic])

  return (
    <div className="go-viz-host-wrap">
      {status === 'loading' ? <div className="go-viz-host-state"><span>⌁</span><strong>Starting Go visualization engine…</strong></div> : null}
      {status === 'error' ? <div className="go-viz-host-state is-error"><strong>Visualization engine failed to start</strong><p>{error}</p></div> : null}
      <div id={containerId} className={status === 'ready' ? 'go-viz-host is-ready' : 'go-viz-host'} />
    </div>
  )
}
