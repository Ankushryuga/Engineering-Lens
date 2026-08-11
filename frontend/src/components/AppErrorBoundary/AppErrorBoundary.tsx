import { Component, ErrorInfo, ReactNode } from 'react'
import styles from './AppErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AlgoWeave UI error', error, info)
  }

  private reload = () => {
    window.location.reload()
  }

  private goHome = () => {
    window.location.assign('/')
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className={styles.root}>
        <div className={styles.card}>
          <span className={styles.icon}>!</span>
          <div>
            <span className={styles.eyebrow}>Interface recovery</span>
            <h1>AlgoWeave hit a display error.</h1>
            <p>
              Your browser is still responsive. Reload the lesson, or return to the landing page and choose it again.
            </p>
            <details>
              <summary>Technical details</summary>
              <code>{this.state.error.message}</code>
            </details>
            <div className={styles.actions}>
              <button type="button" onClick={this.reload}>Reload lesson</button>
              <button type="button" className={styles.secondary} onClick={this.goHome}>Go to home</button>
            </div>
          </div>
        </div>
      </main>
    )
  }
}
