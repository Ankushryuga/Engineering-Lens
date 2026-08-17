type GoRuntime = {
  importObject: WebAssembly.Imports
  run(instance: WebAssembly.Instance): Promise<void>
}

type GoConstructor = new () => GoRuntime

declare global {
  interface Window {
    Go?: GoConstructor
    engineeringLensSystemDesignReady?: boolean
    engineeringLensRenderSystemDesign?: (containerId: string, topicJson: string) => boolean
    engineeringLensSystemDesignAction?: (action: string, payload: string) => void
  }
}

let wasmPromise: Promise<void> | null = null

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (existing) {
      if (window.Go) resolve()
      else existing.addEventListener('load', () => resolve(), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error(`Unable to load ${src}`)), { once: true })
    document.head.appendChild(script)
  })
}

async function waitForReady(): Promise<void> {
  const started = performance.now()
  while (!window.engineeringLensSystemDesignReady || !window.engineeringLensRenderSystemDesign) {
    if (performance.now() - started > 8000) throw new Error('Go System Design visualizer did not initialize')
    await new Promise(resolve => window.setTimeout(resolve, 20))
  }
}

async function instantiateWasm(go: GoRuntime): Promise<WebAssembly.Instance> {
  const response = await fetch('/system-design.wasm')
  if (!response.ok) throw new Error(`system-design.wasm returned ${response.status}`)

  try {
    const result = await WebAssembly.instantiateStreaming(response.clone(), go.importObject)
    return result.instance
  } catch {
    const bytes = await response.arrayBuffer()
    const result = await WebAssembly.instantiate(bytes, go.importObject)
    return result.instance
  }
}

export function ensureSystemDesignWasm(): Promise<void> {
  if (window.engineeringLensSystemDesignReady && window.engineeringLensRenderSystemDesign) return Promise.resolve()
  if (wasmPromise) return wasmPromise

  wasmPromise = (async () => {
    await loadScript('/wasm_exec.js')
    if (!window.Go) throw new Error('Go WebAssembly runtime is unavailable')
    const go = new window.Go()
    const instance = await instantiateWasm(go)
    void go.run(instance)
    await waitForReady()
  })().catch(error => {
    wasmPromise = null
    throw error
  })

  return wasmPromise
}

export async function renderSystemDesignTopic(containerId: string, topic: object): Promise<void> {
  await ensureSystemDesignWasm()
  const rendered = window.engineeringLensRenderSystemDesign?.(containerId, JSON.stringify(topic))
  if (!rendered) throw new Error('Go System Design visualizer rejected the topic payload')
}
