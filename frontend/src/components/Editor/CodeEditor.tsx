import Editor from '@monaco-editor/react'
import { Language, LANGUAGES } from '@/types'
import { useTheme } from '@/hooks/useTheme'
import styles from './CodeEditor.module.css'

interface CodeEditorProps {
  code: string
  language: Language
  onChange: (code: string) => void
  readOnly?: boolean
}

const DARK_COLORS = {
  'editor.background': '#0A0A0B',
  'editor.foreground': '#E4E4E7',
  'editor.lineHighlightBackground': '#18181B',
  'editorLineNumber.foreground': '#57575E',
  'editorLineNumber.activeForeground': '#8C8C94',
  'editor.selectionBackground': '#171B2E',
  'editorGutter.background': '#0A0A0B',
}

const LIGHT_COLORS = {
  'editor.background': '#FFFFFF',
  'editor.foreground': '#17171A',
  'editorLineHighlightBackground': '#F1F1F3',
  'editorLineNumber.foreground': '#8A8A91',
  'editorLineNumber.activeForeground': '#55555C',
  'editor.selectionBackground': '#E4E9FC',
  'editorGutter.background': '#FFFFFF',
}

export default function CodeEditor({ code, language, onChange, readOnly }: CodeEditorProps) {
  const meta = LANGUAGES[language]
  const { theme } = useTheme()

  return (
    <div className={styles.wrapper}>
      <Editor
        height="100%"
        language={meta.monacoLang}
        value={code}
        onChange={val => onChange(val ?? '')}
        theme={theme === 'dark' ? 'algo-dark' : 'algo-light'}
        options={{
          fontSize: 13,
          fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
          fontLigatures: true,
          lineHeight: 1.85,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: 'line',
          padding: { top: 14, bottom: 14 },
          readOnly: readOnly ?? false,
          wordWrap: 'off',
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          bracketPairColorization: { enabled: true },
          guides: { indentation: true },
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
        beforeMount={monaco => {
          monaco.editor.defineTheme('algo-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: DARK_COLORS,
          })
          monaco.editor.defineTheme('algo-light', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: LIGHT_COLORS,
          })
        }}
      />
    </div>
  )
}
