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
  'editor.background': '#0A1020',
  'editor.foreground': '#F4F7FB',
  'editor.lineHighlightBackground': '#141E33',
  'editorLineNumber.foreground': '#64748B',
  'editorLineNumber.activeForeground': '#AAB5C9',
  'editor.selectionBackground': '#29245A',
  'editorGutter.background': '#0A1020',
}

const LIGHT_COLORS = {
  'editor.background': '#FFFFFF',
  'editor.foreground': '#17171A',
  'editorLineHighlightBackground': '#F1F1F3',
  'editorLineNumber.foreground': '#8A8A91',
  'editorLineNumber.activeForeground': '#55555C',
  'editor.selectionBackground': '#EAE7FF',
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
        theme={theme === 'dark' ? 'algoweave-dark' : 'algoweave-light'}
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
          monaco.editor.defineTheme('algoweave-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: DARK_COLORS,
          })
          monaco.editor.defineTheme('algoweave-light', {
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
