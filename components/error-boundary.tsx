'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // You can send error to your error reporting service here
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }

    this.setState({
      error,
      errorInfo,
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleReportBug = () => {
    // You can implement bug reporting logic here
    const subject = encodeURIComponent('AI Studio Bug Report')
    const body = encodeURIComponent(`
Bug Report:

Error: ${error.message}
Stack: ${error.stack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Time: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
    `)
    
    window.open(`mailto:support@aistudio.com?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="mx-auto w-24 h-24 rounded-full bg-destructive/20 border-4 border-destructive/30 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>

          {/* Error Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Oops! Something went wrong
            </h1>
            <p className="text-lg text-muted-foreground">
              We encountered an unexpected error while processing your request.
            </p>
          </div>

          {/* Error Details */}
          <Alert variant="destructive" className="text-left">
            <Bug className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="font-mono text-sm break-all">
              {error.message}
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={resetError}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex-1 sm:flex-none px-6 py-3"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex-1 sm:flex-none px-6 py-3"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {/* Additional Help */}
          <div className="pt-4">
            <Button
              onClick={handleReportBug}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Report this bug
            </Button>
          </div>

          {/* Technical Information (Development Only) */}
          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="text-left bg-muted/50 rounded-lg p-4 border border-border/50">
              <summary className="cursor-pointer font-medium text-muted-foreground mb-2">
                Technical Details (Development)
              </summary>
              <pre className="text-xs text-muted-foreground overflow-auto whitespace-pre-wrap">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook for functional components to trigger error boundary
export function useErrorHandler() {
  return React.useCallback((error: Error) => {
    throw error
  }, [])
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export { ErrorBoundary }
export default ErrorBoundary
