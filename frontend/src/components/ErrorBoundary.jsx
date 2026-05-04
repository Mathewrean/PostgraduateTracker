import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ maxWidth: '36rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', boxShadow: 'var(--shadow)', background: 'var(--bg-surface)' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Application Error</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              The page hit an unexpected error. Reload the page or sign in again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
              style={{ padding: '0.5rem 1.25rem' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
