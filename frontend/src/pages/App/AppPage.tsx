import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Language, AppSource, AppState, TemplateSolution, Template, Step, VisualizationResult, LANGUAGES } from '@/types'
import { submitVisualize, fetchTemplateSolution, pollResult } from '@/lib/api'
import { connectJobWS } from '@/lib/websocket'
import Sidebar from '@/components/Sidebar/Sidebar'
import CodeEditor from '@/components/Editor/CodeEditor'
import AlgoPicker from '@/components/AlgoPicker/AlgoPicker'
import BarViz from '@/components/Visualization/BarViz'
import GraphViz from '@/components/Visualization/GraphViz'
import TreeViz from '@/components/Visualization/TreeViz'
import LinkedListViz from '@/components/Visualization/LinkedListViz'
import ScenarioViz from '@/components/Visualization/ScenarioViz'
import TraceViz from '@/components/Visualization/TraceViz'
import StepPlayer from '@/components/StepPlayer/StepPlayer'
import ExplanationPanel from '@/components/ExplanationPanel/ExplanationPanel'
import styles from './AppPage.module.css'

const STARTER_CODE: Record<Language, string> = {
  python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

result = bubble_sort([64, 34, 25, 12, 22, 11, 90])
`,
  go: `package main

func bubbleSort(arr []int) []int {
    n := len(arr)
    for i := 0; i < n; i++ {
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
            }
        }
    }
    return arr
}

func main() {
    arr := []int{64, 34, 25, 12, 22, 11, 90}
    bubbleSort(arr)
}
`,
}

export default function AppPage() {
  const [searchParams] = useSearchParams()
  const startsInGuidedMode = searchParams.get('mode') === 'guided'
  const [source, setSource] = useState<AppSource>(startsInGuidedMode ? 'template' : 'custom')
  const [language, setLanguage] = useState<Language>('python')
  const [code, setCode] = useState(STARTER_CODE.python)
  const [appState, setAppState] = useState<AppState>(startsInGuidedMode ? 'empty' : 'loaded')
  const [errorMsg, setErrorMsg] = useState('')
  const [activeMeta, setActiveMeta] = useState<TemplateSolution | null>(null)
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [runId, setRunId] = useState(0)
  const [visualizationMode, setVisualizationMode] = useState<'scenario' | 'abstract'>('scenario')
  const [showSourceCode, setShowSourceCode] = useState(false)
  const [explainEnabled, setExplainEnabled] = useState(false)
  const requestVersionRef = useRef(0)
  const wsCleanupRef = useRef<(() => void) | null>(null)
  const canonicalTraceCacheRef = useRef<Map<number, Step[]>>(new Map())

  const cancelPendingDelivery = useCallback(() => {
    requestVersionRef.current += 1
    wsCleanupRef.current?.()
    wsCleanupRef.current = null
  }, [])

  useEffect(() => () => {
    wsCleanupRef.current?.()
  }, [])


  const pollJobUntilDone = useCallback(async (jobId: string, requestVersion: number): Promise<VisualizationResult> => {
    for (let attempt = 0; attempt < 4; attempt++) {
      if (requestVersion !== requestVersionRef.current) throw new Error('Request cancelled')
      const response = await pollResult(jobId)
      if (requestVersion !== requestVersionRef.current) throw new Error('Request cancelled')
      if (response.status === 'done' && response.result) return response.result
      if (response.status === 'error') throw new Error(response.result?.error || 'Sandbox execution failed')
    }
    throw new Error('The sandbox is still processing this job. Please run it again in a moment.')
  }, [])

  const loadCanonicalTeachingTrace = useCallback(async (templateId: number, requestVersion: number): Promise<Step[]> => {
    const cached = canonicalTraceCacheRef.current.get(templateId)
    if (cached?.length) return cached

    const pythonSolution = await fetchTemplateSolution(templateId, 'python')
    if (requestVersion !== requestVersionRef.current) throw new Error('Request cancelled')

    const submission = await submitVisualize(pythonSolution.code, 'python')
    if (requestVersion !== requestVersionRef.current) throw new Error('Request cancelled')
    const result = await pollJobUntilDone(submission.job_id, requestVersion)
    if (result.error) throw new Error(result.error)

    const canonicalSteps = Array.isArray(result.steps) ? result.steps : []
    if (!canonicalSteps.length) throw new Error('The shared lesson trace was empty.')
    canonicalTraceCacheRef.current.set(templateId, canonicalSteps)
    return canonicalSteps
  }, [pollJobUntilDone])

  const teachingTraceForLanguage = useCallback((canonicalSteps: Step[], selectedLanguage: Language): Step[] => {
    if (selectedLanguage === 'python') return canonicalSteps
    // Guided lessons share one language-neutral teaching trace. Python source
    // line numbers are intentionally removed when Go is selected so the
    // visualization never points at a line in the wrong source file.
    return canonicalSteps.map(step => ({ ...step, line: undefined }))
  }, [])

  const handleLanguageChange = async (lang: Language) => {
    cancelPendingDelivery()
    const requestVersion = requestVersionRef.current
    if (source === 'custom') {
      setLanguage(lang)
      setCode(STARTER_CODE[lang])
      // Reset any stale run results — old steps belong to the previous code/language.
      setSteps([])
      setErrorMsg('')
      setAppState('loaded')
      return
    }

    // Template source: the currently loaded algorithm needs to be re-fetched
    // in the newly selected language, since each language has its own
    // reference solution text. The Sidebar already disables languages the
    // template doesn't have, but guard here too in case of a race.
    if (activeTemplate && !activeTemplate.languages.includes(lang)) {
      setErrorMsg(
        `"${activeTemplate.name}" doesn't have a ${LANGUAGES[lang].label} solution yet.`
      )
      return
    }

    if (activeMeta) {
      try {
        const sol = await fetchTemplateSolution(activeMeta.template_id, lang)
        if (requestVersion !== requestVersionRef.current) return
        setLanguage(lang)
        setCode(sol.code)
        setActiveMeta(sol)
        setSteps([])
        setErrorMsg('')
        setAppState('loaded')
      } catch {
        if (requestVersion !== requestVersionRef.current) return
        setErrorMsg(
          `"${activeMeta.name}" doesn't have a ${LANGUAGES[lang].label} solution yet — staying on ${LANGUAGES[language].label}.`
        )
      }
      return
    }

    // No template loaded yet (still on the picker) — just switch the
    // language filter used by the picker/dropdown.
    setLanguage(lang)
  }

  const handleTemplateSelect = async (template: Template) => {
    cancelPendingDelivery()
    const requestVersion = requestVersionRef.current
    const fallbackLang = template.languages.find(candidate => candidate in LANGUAGES) as Language | undefined
    const effectiveLang = template.languages.includes(language) ? language : fallbackLang
    if (!effectiveLang) {
      setErrorMsg('This algorithm does not have a supported reference solution yet.')
      return
    }
    try {
      const sol = await fetchTemplateSolution(template.id, effectiveLang)
      if (requestVersion !== requestVersionRef.current) return
      setCode(sol.code)
      setActiveMeta(sol)
      setActiveTemplate(template)
      setLanguage(effectiveLang)
      setSource('template')
      setVisualizationMode('scenario')
      setShowSourceCode(false)
      setAppState('loaded')
      setSteps([])
      setErrorMsg('')
    } catch {
      if (requestVersion !== requestVersionRef.current) return
      setErrorMsg('Failed to load this algorithm — please try another one.')
    }
  }

  const handleRun = async () => {
    if (!code.trim()) return
    cancelPendingDelivery()
    const requestVersion = requestVersionRef.current
    const selectedLanguage = language
    const selectedTemplate = activeMeta
    const isGuidedLesson = source === 'template' && selectedTemplate !== null

    setAppState('running')
    setErrorMsg('')
    setSteps([])
    setCurrentStep(0)

    const finishResult = async (result: VisualizationResult | undefined) => {
      if (!result || requestVersion !== requestVersionRef.current) return false
      if (result.error) {
        setSteps([])
        setCurrentStep(0)
        setAppState('error')
        setErrorMsg(result.error)
        setRunId(id => id + 1)
        return true
      }

      let nextSteps = Array.isArray(result.steps) ? result.steps : []

      if (isGuidedLesson && selectedTemplate) {
        if (selectedLanguage === 'python') {
          if (nextSteps.length) canonicalTraceCacheRef.current.set(selectedTemplate.template_id, nextSteps)
        } else {
          try {
            const canonical = await loadCanonicalTeachingTrace(selectedTemplate.template_id, requestVersion)
            if (requestVersion !== requestVersionRef.current) return false
            nextSteps = teachingTraceForLanguage(canonical, selectedLanguage)
          } catch (error: unknown) {
            if (requestVersion !== requestVersionRef.current) return false
            setSteps([])
            setCurrentStep(0)
            setAppState('error')
            setErrorMsg(
              `The Go program ran, but the shared lesson visualization could not be prepared: ${error instanceof Error ? error.message : 'unknown error'}`
            )
            setRunId(id => id + 1)
            return true
          }
        }
      }

      setSteps(nextSteps)
      setCurrentStep(0)
      setAppState('active')
      setErrorMsg('')
      setRunId(id => id + 1)
      return true
    }

    const pollUntilComplete = async (jobId: string) => {
      const result = await pollJobUntilDone(jobId, requestVersion)
      await finishResult(result)
    }

    try {
      const { job_id, cached } = await submitVisualize(code, selectedLanguage)
      if (requestVersion !== requestVersionRef.current) return

      if (cached) {
        await pollUntilComplete(job_id)
        return
      }

      let settled = false
      const cleanup = connectJobWS(
        job_id,
        (result) => {
          if (settled || requestVersion !== requestVersionRef.current) return
          settled = true
          cleanup()
          if (wsCleanupRef.current === cleanup) wsCleanupRef.current = null
          void finishResult(result).catch((error: Error) => {
            if (requestVersion !== requestVersionRef.current) return
            setErrorMsg(error.message)
            setAppState('error')
          })
        },
        () => {
          if (settled || requestVersion !== requestVersionRef.current) return
          cleanup()
          if (wsCleanupRef.current === cleanup) wsCleanupRef.current = null
          void pollUntilComplete(job_id).then(() => {
            settled = true
          }).catch((error: Error) => {
            if (settled || requestVersion !== requestVersionRef.current) return
            settled = true
            setErrorMsg(error.message)
            setAppState('error')
          })
        }
      )
      wsCleanupRef.current = cleanup
    } catch (e: unknown) {
      if (requestVersion !== requestVersionRef.current) return
      setErrorMsg(e instanceof Error ? e.message : 'Submission failed')
      setAppState('error')
    }
  }

  const handleStepChange = useCallback((stepOrUpdater: number | ((prev: number) => number)) => {
    if (typeof stepOrUpdater === 'function') {
      setCurrentStep(prev => stepOrUpdater(prev))
    } else {
      setCurrentStep(stepOrUpdater)
    }
  }, [])

  const filename = LANGUAGES[language].filename

  const isEmptyState = appState === 'empty'
  const isLoaded = appState === 'loaded'
  const isActive = appState === 'active'
  const isRunning = appState === 'running'
  const showEditorGrid = isLoaded || isRunning || isActive || appState === 'error'
  const renderType = activeMeta?.render_type ?? 'array'
  const hasArrayData = steps.some(step => Array.isArray(step.array) && step.array.length > 0)
  const hasNetworkData = steps.some(step => (step.nodes?.length ?? 0) > 0 || (step.edges?.length ?? 0) > 0)
  const hasListData = steps.some(step => step.type === 'list_init' || Object.keys(step.lists ?? {}).length > 0)
  const activeStep = steps[currentStep] ?? null
  const previousStep = currentStep > 0 ? (steps[currentStep - 1] ?? null) : null

  const handleSourceChange = (s: AppSource) => {
    cancelPendingDelivery()
    setSource(s)
    setActiveMeta(null)
    setActiveTemplate(null)
    setSteps([])
    setErrorMsg('')
    setAppState(s === 'custom' ? 'loaded' : 'empty')
    setShowSourceCode(false)
    if (s === 'custom') {
      setCode(STARTER_CODE[language])
    }
  }

  const handleCodeChange = (nextCode: string) => {
    if (nextCode === code) return
    cancelPendingDelivery()
    setCode(nextCode)
    setSteps([])
    setCurrentStep(0)
    setErrorMsg('')
    setAppState('loaded')
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        source={source}
        language={language}
        availableLanguages={source === 'template' ? (activeTemplate?.languages ?? null) : null}
        onSourceChange={handleSourceChange}
        onLanguageChange={handleLanguageChange}
      />

      <div className={styles.main}>
        {/* Action bar (hidden until code is loaded — matches the mockup's
            "empty" screen, which has no Run row) */}
        {showEditorGrid && (
        <div className={styles.actionbar}>
          <div className={styles.workspaceTitle}>
            <span className={styles.workspaceEyebrow}>Student algorithm lab</span>
            <strong>{activeMeta?.name ?? 'Try your own algorithm'}</strong>
            <span className={styles.actionbarTitle}>{activeMeta ? `${activeMeta.category} · ${filename}` : filename}</span>
          </div>
          <div className={styles.actionbarRight}>
            <button
              type="button"
              className={`${styles.controlButton} ${explainEnabled ? styles.controlButtonActive : ''}`}
              onClick={() => setExplainEnabled(enabled => !enabled)}
              aria-pressed={explainEnabled}
            >
              <span className={styles.controlIcon}>💡</span>
              <span>{explainEnabled ? 'Hide explanation' : 'Explain how it works'}</span>
            </button>
            <button
              type="button"
              className={`${styles.controlButton} ${showSourceCode ? styles.controlButtonActive : ''}`}
              onClick={() => setShowSourceCode(visible => !visible)}
              aria-pressed={showSourceCode}
            >
              <span className={styles.controlIcon}>⌨</span>
              <span>{showSourceCode ? 'Hide source code' : 'Show source code'}</span>
            </button>
            <button
              className={styles.btnRun}
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <span className={styles.spinner} />
                  Running...
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 10 10">
                    <path d="M2 1L9 5L2 9V1Z" fill="currentColor"/>
                  </svg>
                  Run & visualize
                </>
              )}
            </button>
          </div>
        </div>
        )}

        {/* Empty state */}
        {isEmptyState && (
          <div className={styles.emptyBody}>
            <div className={styles.emptyContent}>
              <div className={styles.emptyLead}>
                <span className={styles.emptyEyebrow}>Guided lessons</span>
                <h2>Choose an algorithm and learn it visually.</h2>
                <p>Story first, step-by-step execution next, source code whenever you need it.</p>
              </div>

              <AlgoPicker language={language} onSelect={handleTemplateSelect} />

              {errorMsg && (
                <div className={styles.errorMsg}>{errorMsg}</div>
              )}
            </div>
          </div>
        )}

        {/* Editor + visualization state (loaded / running / active / error) */}
        {showEditorGrid && (
          <>
            {/* Lesson context */}
            <div className={styles.tabs}>
              <div className={styles.tab + ' ' + styles.tabActive}>
                <span className={styles.tabDot} />
                Visual lesson
              </div>
              <div className={styles.lessonHint}>Python and Go share the same teaching visualization. Source code stays language-specific and hidden until you reveal it.</div>
            </div>

            {/* Metadata strip (template only) */}
            {activeMeta && (
              <div className={styles.metaStrip}>
                <span className={styles.tagChip}>{activeMeta.category}</span>
                <span className={styles.metaName}>{activeMeta.name}</span>
                <span className={styles.complexityChip}>⏱ {activeMeta.time_complexity}</span>
                <span className={styles.complexityChip}>🧠 {activeMeta.space_complexity}</span>
                <span className={styles.difficultyChip}>{activeMeta.difficulty}</span>
              </div>
            )}

            {/* Editor + Viz grid */}
            <div className={`${styles.grid} ${showSourceCode ? styles.gridWithSource : styles.gridVisualOnly}`}>
              {showSourceCode && (
                <div className={`${styles.panel} ${styles.sourcePanel}`}>
                  <div className={styles.panelHead}>
                    <div className={styles.panelTitle}><span className={styles.panelIcon}>⌨</span><span>Source code</span></div>
                    <span className={styles.panelMeta}>{source === 'template' ? `${filename} · reference` : filename}</span>
                  </div>
                  <div className={styles.editorWrap}>
                    <CodeEditor code={code} language={language} onChange={handleCodeChange} readOnly={source === 'template'} />
                  </div>
                </div>
              )}

              <div className={`${styles.panel} ${styles.visualPanel}`}>
                <div className={styles.panelHead}>
                  <div className={styles.panelTitle}><span className={styles.panelIcon}>✦</span><span>Learn visually</span></div>
                  <div className={styles.vizModeToggle} aria-label="visualization lens">
                    <button
                      className={visualizationMode === 'scenario' ? styles.vizModeActive : styles.vizModeButton}
                      onClick={() => setVisualizationMode('scenario')}
                      aria-pressed={visualizationMode === 'scenario'}
                    >
                      🌍 Story mode
                    </button>
                    <button
                      className={visualizationMode === 'abstract' ? styles.vizModeActive : styles.vizModeButton}
                      onClick={() => setVisualizationMode('abstract')}
                      aria-pressed={visualizationMode === 'abstract'}
                    >
                      Abstract
                    </button>
                  </div>
                  {isRunning && <span className={styles.runningLabel}>executing...</span>}
                </div>

                {/* Step player — docked directly beside the visualization,
                    always visible without scrolling, auto-plays on run. */}
                {isActive && steps.length > 0 && (
                  <StepPlayer
                    totalSteps={steps.length}
                    currentStep={currentStep}
                    onStepChange={handleStepChange}
                    autoPlayKey={runId}
                  />
                )}

                <div className={`${styles.lessonBody} ${explainEnabled ? styles.lessonBodyExplained : ''}`}>
                  <div className={styles.vizWrap}>
                  {isLoaded && (
                    <div className={styles.placeholderOverlay}>
                      <div className={styles.placeholderCard}>
                        <span className={styles.placeholderIcon}>▶</span>
                        <strong>Ready for the lesson</strong>
                        <span>Run the code to connect each execution step to its real-life story.</span>
                      </div>
                    </div>
                  )}
                  {isRunning && (
                    <div className={styles.runningOverlay}>
                      <div className={styles.spinner} />
                      <span>sandboxed execution in progress</span>
                    </div>
                  )}
                  {isActive && (
                    visualizationMode === 'scenario' ? (
                      <ScenarioViz
                        step={activeStep}
                        allSteps={steps}
                        currentIndex={currentStep}
                        renderType={renderType}
                        template={activeMeta}
                        code={code}
                      />
                    ) : renderType === 'graph' ? (
                      hasNetworkData ? (
                        <GraphViz step={activeStep} allSteps={steps} currentIndex={currentStep} />
                      ) : (
                        <TraceViz step={activeStep} allSteps={steps} currentIndex={currentStep} />
                      )
                    ) : renderType === 'tree' ? (
                      hasNetworkData ? (
                        <TreeViz step={activeStep} allSteps={steps} currentIndex={currentStep} />
                      ) : (
                        <TraceViz step={activeStep} allSteps={steps} currentIndex={currentStep} />
                      )
                    ) : renderType === 'linked_list' ? (
                      hasListData ? (
                        <LinkedListViz step={activeStep} allSteps={steps} currentIndex={currentStep} />
                      ) : (
                        <TraceViz step={activeStep} allSteps={steps} currentIndex={currentStep} />
                      )
                    ) : hasArrayData ? (
                      <BarViz step={activeStep} allSteps={steps} />
                    ) : (
                      <TraceViz step={activeStep} allSteps={steps} currentIndex={currentStep} />
                    )
                  )}
                  {appState === 'error' && (
                    <div className={styles.errorOverlay}>{errorMsg}</div>
                  )}
                  </div>
                  {explainEnabled && (
                    <ExplanationPanel
                      step={activeStep}
                      previousStep={previousStep}
                      allSteps={steps}
                      currentIndex={currentStep}
                      template={activeMeta}
                      code={code}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
