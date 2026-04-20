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
        <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-6">
          <div className="max-w-lg w-full border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <h1 className="text-3xl font-semibold mb-3">Application Error</h1>
            <p className="text-gray-600 mb-6">
              The page hit an unexpected error. Reload the page or sign in again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
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
