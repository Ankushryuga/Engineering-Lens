import { useCallback, useEffect, useRef, useState } from 'react'
import { Language, AppSource, AppState, TemplateSolution, Template, Step, LANGUAGES } from '@/types'
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
import StepPlayer from '@/components/StepPlayer/StepPlayer'
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
  javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

bubbleSort([64, 34, 25, 12, 22, 11, 90]);
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
    bubbleSort([]int{64, 34, 25, 12, 22, 11, 90})
}
`,
  java: `import java.util.Arrays;

public class Solution {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        bubbleSort(arr);
    }
}
`,
  cpp: `#include <vector>
#include <algorithm>

void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
            }
        }
    }
}

int main() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(arr);
    return 0;
}
`,
}

export default function AppPage() {
  const [source, setSource] = useState<AppSource>('custom')
  const [language, setLanguage] = useState<Language>('python')
  const [code, setCode] = useState(STARTER_CODE.python)
  const [appState, setAppState] = useState<AppState>('loaded')
  const [errorMsg, setErrorMsg] = useState('')
  const [activeMeta, setActiveMeta] = useState<TemplateSolution | null>(null)
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [runId, setRunId] = useState(0)
  const [visualizationMode, setVisualizationMode] = useState<'scenario' | 'abstract'>('scenario')
  const requestVersionRef = useRef(0)
  const wsCleanupRef = useRef<(() => void) | null>(null)

  const cancelPendingDelivery = useCallback(() => {
    requestVersionRef.current += 1
    wsCleanupRef.current?.()
    wsCleanupRef.current = null
  }, [])

  useEffect(() => () => {
    wsCleanupRef.current?.()
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
    setAppState('running')
    setErrorMsg('')
    setSteps([])
    setCurrentStep(0)

    const finishResult = (result: Awaited<ReturnType<typeof pollResult>>['result']) => {
      if (!result || requestVersion !== requestVersionRef.current) return false
      setSteps(result.steps)
      setCurrentStep(0)
      setAppState(result.error ? 'error' : 'active')
      setErrorMsg(result.error ?? '')
      setRunId(id => id + 1)
      return true
    }

    const pollUntilComplete = async (jobId: string) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        if (requestVersion !== requestVersionRef.current) return
        const response = await pollResult(jobId)
        if (requestVersion !== requestVersionRef.current) return
        if (response.status === 'done' && finishResult(response.result)) return
        if (response.status === 'error') throw new Error(response.result?.error || 'Sandbox execution failed')
      }
      throw new Error('The sandbox is still processing this job. Please run it again in a moment.')
    }

    try {
      const { job_id, cached } = await submitVisualize(code, language)
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
          finishResult(result)
          cleanup()
          if (wsCleanupRef.current === cleanup) wsCleanupRef.current = null
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

  const filename = language === 'java' ? 'Solution.java' :
    language === 'go' ? 'solution.go' :
    language === 'cpp' ? 'solution.cpp' :
    language === 'javascript' ? 'solution.js' : 'solution.py'

  const isEmptyState = appState === 'empty'
  const isLoaded = appState === 'loaded'
  const isActive = appState === 'active'
  const isRunning = appState === 'running'
  const showEditorGrid = isLoaded || isRunning || isActive || appState === 'error'
  const renderType = activeMeta?.render_type ?? 'array'

  const handleSourceChange = (s: AppSource) => {
    cancelPendingDelivery()
    setSource(s)
    setActiveMeta(null)
    setActiveTemplate(null)
    setSteps([])
    setErrorMsg('')
    setAppState(s === 'custom' ? 'loaded' : 'empty')
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
          <span className={styles.actionbarTitle}>{filename}</span>
          <div className={styles.actionbarRight}>
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
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M2 1L9 5L2 9V1Z" fill="currentColor"/>
                  </svg>
                  Run
                </>
              )}
            </button>
          </div>
        </div>
        )}

        {/* Empty state */}
        {isEmptyState && (
          <div className={styles.emptyBody}>
            <div className={styles.emptyLead}>
              <h2>Choose an algorithm to explore.</h2>
              <p>
                Every entry loads a canonical implementation and a real-world story for the
                visualization. You can still edit the code before running it.
              </p>
            </div>

            <AlgoPicker language={language} onSelect={handleTemplateSelect} />


            {errorMsg && (
              <div className={styles.errorMsg}>{errorMsg}</div>
            )}
          </div>
        )}

        {/* Editor + visualization state (loaded / running / active / error) */}
        {showEditorGrid && (
          <>
            {/* Tabs */}
            <div className={styles.tabs}>
              <div className={styles.tab + ' ' + styles.tabActive}>
                <span className={styles.tabDot} />
                {filename}
              </div>
            </div>

            {/* Metadata strip (template only) */}
            {activeMeta && (
              <div className={styles.metaStrip}>
                <span className={styles.tagChip}>{activeMeta.category}</span>
                <span>{activeMeta.name}</span>
                <span className={styles.dot}>·</span>
                <span>{activeMeta.time_complexity} time · {activeMeta.space_complexity} space</span>
              </div>
            )}

            {/* Editor + Viz grid */}
            <div className={styles.grid}>
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <span>editor</span>
                </div>
                <div className={styles.editorWrap}>
                  <CodeEditor code={code} language={language} onChange={handleCodeChange} />
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <span>visualization</span>
                  <div className={styles.vizModeToggle} aria-label="visualization lens">
                    <button
                      className={visualizationMode === 'scenario' ? styles.vizModeActive : styles.vizModeButton}
                      onClick={() => setVisualizationMode('scenario')}
                      aria-pressed={visualizationMode === 'scenario'}
                    >
                      🌍 Real-world
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

                <div className={styles.vizWrap}>
                  {isLoaded && (
                    <div className={styles.placeholderOverlay}>
                      <span>click Run to execute this code in the sandbox and see it visualized</span>
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
                        step={steps[currentStep] ?? null}
                        allSteps={steps}
                        currentIndex={currentStep}
                        renderType={renderType}
                        template={activeMeta}
                        code={code}
                      />
                    ) : renderType === 'graph' ? (
                      <GraphViz step={steps[currentStep] ?? null} allSteps={steps} currentIndex={currentStep} />
                    ) : renderType === 'tree' ? (
                      <TreeViz step={steps[currentStep] ?? null} allSteps={steps} currentIndex={currentStep} />
                    ) : renderType === 'linked_list' ? (
                      <LinkedListViz step={steps[currentStep] ?? null} allSteps={steps} currentIndex={currentStep} />
                    ) : (
                      <BarViz step={steps[currentStep] ?? null} allSteps={steps} />
                    )
                  )}
                  {appState === 'error' && (
                    <div className={styles.errorOverlay}>{errorMsg}</div>
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
