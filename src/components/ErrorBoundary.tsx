import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button, Result } from 'antd'

interface ErrorBoundaryProps {
  children: ReactNode
  /** When this value changes the boundary resets (for example the route). */
  resetKey?: string
  /** Smaller inline fallback, used around individual charts. */
  compact?: boolean
}

interface ErrorBoundaryState {
  error: Error | null
}

/** Catches render errors in the subtree and offers a way to recover. */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  componentDidUpdate(previous: ErrorBoundaryProps): void {
    if (this.state.error && previous.resetKey !== this.props.resetKey) this.reset()
  }

  private reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.compact) {
      return (
        <div className="error-compact" role="alert">
          <span>This chart could not be displayed.</span>
          <Button size="small" onClick={this.reset}>
            Retry
          </Button>
        </div>
      )
    }

    return (
      <Result
        status="error"
        title="Something went wrong"
        subTitle={error.message || 'An unexpected error occurred while rendering this page.'}
        extra={[
          <Button key="retry" type="primary" onClick={this.reset}>
            Try again
          </Button>,
          <Button key="reload" onClick={() => window.location.reload()}>
            Reload the app
          </Button>,
        ]}
      />
    )
  }
}
