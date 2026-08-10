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
  let terminal = false

  const fail = (message: string) => {
    if (terminal) return
    terminal = true
    onError(message)
  }

  ws.onmessage = (event) => {
    try {
      const msg: WSMessage = JSON.parse(event.data)
      if (msg.status === 'done') {
        if (terminal) return
        terminal = true
        onResult(msg.result)
        ws.close()
      } else if (msg.status === 'timeout') {
        fail('The WebSocket wait timed out. Falling back to polling.')
        ws.close()
      }
      // 'pending' is a keepalive — ignore it.
    } catch {
      // Ignore malformed keepalive/proxy frames; a close/error still triggers fallback.
    }
  }

  ws.onerror = () => {
    fail('WebSocket connection error. Falling back to polling.')
  }

  ws.onclose = () => {
    fail('WebSocket connection closed before the result arrived. Falling back to polling.')
  }

  // Return a cleanup function. Marking the socket terminal prevents a deliberate
  // close (after a result, rerun, or unmount) from triggering the fallback path.
  return () => {
    terminal = true
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close()
    }
  }
}
