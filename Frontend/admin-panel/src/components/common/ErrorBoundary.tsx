import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  correlationId: string
  errorMessage: string
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    correlationId: "",
    errorMessage: "",
  }

  public static getDerivedStateFromError(error: Error): State {
    const correlationId = `ERR-WA-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    return {
      hasError: true,
      correlationId,
      errorMessage: error.message || "An unexpected command deck exception occurred.",
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[WavyAssets Institutional Error Boundary]", error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-bg-canvas flex items-center justify-center p-6 text-on-surface">
          <div className="max-w-md w-full bg-bg-panel border border-status-danger/40 rounded-[4px] p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-[4px] bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-status-danger mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h1 className="text-lg font-semibold tracking-tight text-on-surface mb-1">
              Command Deck Enclave Exception
            </h1>
            
            <p className="text-xs font-mono text-secondary mb-4">
              Incident Correlation ID:{" "}
              <span className="text-gold-accent font-semibold">
                {this.state.correlationId}
              </span>
            </p>

            <div className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-3 mb-6 text-left">
              <p className="text-xs font-mono text-secondary/80 break-words">
                {this.state.errorMessage}
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full bg-bg-elevated hover:bg-state-hover border border-border-subtle text-on-surface font-medium text-xs py-2 rounded-[4px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-telemetry-cyan" />
              <span>Reload Command Deck</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
