import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React Error Boundary caught an error', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-base-black flex items-center justify-center px-6">
          <div className="max-w-2xl w-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Oops! Une erreur s'est produite
              </h2>
              <p className="text-gray-300">
                L'application a rencontré une erreur inattendue. Nos équipes ont été notifiées.
              </p>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-black/30 rounded-lg">
                <p className="text-sm font-mono text-red-300 mb-2">{this.state.error.toString()}</p>
                {import.meta.env.DEV && this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-60">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-tertiary text-white font-semibold rounded-xl shadow-gold hover:shadow-glow transition-all duration-300"
              >
                Réessayer
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-base-medium text-white font-semibold rounded-xl hover:bg-base-light transition-all duration-300"
              >
                Recharger l'application
              </button>
            </div>

            {import.meta.env.DEV && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    const logs = logger.exportLogs();
                    const blob = new Blob([logs], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `galpha-logs-${Date.now()}.json`;
                    a.click();
                  }}
                  className="text-sm text-gray-400 hover:text-gray-300 underline"
                >
                  Télécharger les logs
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
