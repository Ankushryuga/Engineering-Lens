import { VisualizationResult } from '@/types'

type WSMessage =
  | { status: 'pending' }
  | { status: 'timeout' }
  | { status: 'done'; result: VisualizationResult }

export function connectJobWS(
  jobId: string,
  onResult: (result: VisualizationResult) => void,
  onError: (err: string) => void
): () => void {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host = window.location.host
  const ws = new WebSocket(`${protocol}://${host}/ws/${jobId}`)

  ws.onmessage = (event) => {
    try {
      const msg: WSMessage = JSON.parse(event.data)
      if (msg.status === 'done') {
        onResult(msg.result)
        ws.close()
      } else if (msg.status === 'timeout') {
        onError('The job timed out — the sandbox took too long to respond.')
        ws.close()
      }
      // 'pending' is a keepalive — ignore
    } catch {
      // ignore parse errors
    }
  }

  ws.onerror = () => {
    onError('WebSocket connection error. Falling back to polling.')
  }

  // Return a cleanup function
  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close()
    }
  }
}
