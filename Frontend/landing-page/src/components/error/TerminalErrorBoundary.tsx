import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class TerminalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    // Redact stack traces and internal paths for security
    const sanitizedMsg = error?.message
      ? error.message.replace(/(\/[\w.-]+)+/g, '[REDACTED_PATH]')
      : 'Unexpected rendering exception';
    return { hasError: true, errorMessage: sanitizedMsg };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Redacted logging compliant with GEMINI.md security invariant #6
    if (typeof console !== 'undefined' && console.error) {
      console.error('TerminalErrorBoundary caught an isolated exception:', {
        name: error.name,
        message: error.message,
        componentStack: errorInfo.componentStack?.slice(0, 300),
      });
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (typeof window !== 'undefined') {
      window.location.hash = '#/services/crypto';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          data-testid="terminal-error-boundary-fallback"
          className="w-full min-h-[380px] p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-surface-container-low border border-outline rounded-sm my-6 select-none relative"
        >
          {/* Status Telemetry Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-surface-container border border-outline mb-4">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse shrink-0" />
            <span className="font-mono text-[11px] text-error font-semibold uppercase tracking-wider">
              SOVEREIGN EXCEPTION // ISOLATED
            </span>
          </div>

          <div
            aria-hidden="true"
            className="w-14 h-14 rounded-sm bg-error/10 border border-error/30 flex items-center justify-center text-error mb-4"
          >
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-on-surface mb-2">
            Terminal Rendering Interruption
          </h2>

          <p className="font-sans text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
            An isolated rendering event occurred
            {this.props.sectionName ? ` in ${this.props.sectionName}` : ''}.
            All sovereign custody positions and clearing reserves remain fully secured.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              data-testid="error-boundary-retry-btn"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-on-primary font-semibold text-xs uppercase tracking-wider hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </button>

            <button
              type="button"
              data-testid="error-boundary-reload-btn"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-surface-container border border-outline text-on-surface font-semibold text-xs uppercase tracking-wider hover:border-primary/50 hover:text-primary active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Terminal</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
