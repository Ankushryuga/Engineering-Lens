import { useCallback, useState } from 'react'
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
  const [appState, setAppState] = useState<AppState>('empty')
  const [errorMsg, setErrorMsg] = useState('')
  const [activeMeta, setActiveMeta] = useState<TemplateSolution | null>(null)
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [runId, setRunId] = useState(0)

  const handleLanguageChange = async (lang: Language) => {
    if (source === 'custom') {
      setLanguage(lang)
      setCode(STARTER_CODE[lang])
      // Reset any stale run results — old steps belong to the previous code/language.
      setSteps([])
      setErrorMsg('')
      if (appState === 'active' || appState === 'error') {
        setAppState('loaded')
      }
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
        setLanguage(lang)
        setCode(sol.code)
        setActiveMeta(sol)
        setSteps([])
        setErrorMsg('')
        setAppState('loaded')
      } catch {
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
    setActiveTemplate(template)
    const effectiveLang = template.languages.includes(language) ? language : 'python'
    try {
      const sol = await fetchTemplateSolution(template.id, effectiveLang)
      setCode(sol.code)
      setActiveMeta(sol)
      setLanguage(effectiveLang as Language)
      setSource('template')
      setAppState('loaded')
      setSteps([])
      setErrorMsg('')
    } catch {
      setErrorMsg('Failed to load this algorithm — please try another one.')
    }
  }

  const handleStartCustomCode = () => {
    setActiveMeta(null)
    setActiveTemplate(null)
    setAppState('loaded')
  }

  const handleRun = async () => {
    if (!code.trim()) return
    setAppState('running')
    setErrorMsg('')
    setSteps([])
    setCurrentStep(0)

    try {
      const { job_id, cached } = await submitVisualize(code, language)

      if (cached) {
        // Immediately fetch cached result via polling
        const { result } = await pollResult(job_id)
        if (result) {
          setSteps(result.steps)
          setCurrentStep(0)
          setAppState('active')
          setRunId(id => id + 1)
        }
        return
      }

      // Open WebSocket for live result delivery
      const cleanup = connectJobWS(
        job_id,
        (result) => {
          setSteps(result.steps)
          setCurrentStep(0)
          setAppState(result.error ? 'error' : 'active')
          if (result.error) setErrorMsg(result.error)
          setRunId(id => id + 1)
          cleanup()
        },
        (err) => {
          setErrorMsg(err)
          setAppState('error')
          cleanup()
        }
      )
    } catch (e: unknown) {
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
    setSource(s)
    setActiveMeta(null)
    setActiveTemplate(null)
    setSteps([])
    setErrorMsg('')
    setAppState('empty')
    if (s === 'custom') {
      setCode(STARTER_CODE[language])
    }
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
            "empty" screen, which has no Run/Share row) */}
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
            <button className={styles.btnSecondary}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM3 7.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM9 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM4.4 6.2l3.2-1.9M4.4 6.8l3.2 1.9" stroke="currentColor" strokeWidth="1"/>
              </svg>
              Share
            </button>
          </div>
        </div>
        )}

        {/* Empty state */}
        {isEmptyState && (
          <div className={styles.emptyBody}>
            <div className={styles.emptyLead}>
              <h2>Select an algorithm, or paste your own.</h2>
              <p>
                Every entry below loads a canonical, tested implementation pre-selected in
                your chosen language. Edit it, or clear the editor to write your own from scratch.
              </p>
            </div>

            <AlgoPicker language={language} onSelect={handleTemplateSelect} />

            {source === 'custom' && (
              <>
                <div className={styles.dividerOr}>or</div>
                <button className={styles.customHintBtn} onClick={handleStartCustomCode}>
                  paste your own function — any array, graph, tree, or recursive
                  algorithm is supported →
                </button>
              </>
            )}

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
                  <CodeEditor code={code} language={language} onChange={setCode} />
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <span>visualization</span>
                  {isActive && renderType === 'array' && steps[currentStep]?.array && (
                    <span>array — length {steps[currentStep].array!.length}</span>
                  )}
                  {isActive && renderType !== 'array' && (
                    <span>{renderType} — {activeMeta?.name}</span>
                  )}
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
                    renderType === 'graph' ? (
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
