import { Component, ReactNode, ErrorInfo } from "react";

interface PreviewErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface PreviewErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PreviewErrorBoundary extends Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  constructor(props: PreviewErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(
    error: Error
  ): PreviewErrorBoundaryState | null {
    if (
      error.message.includes("DecimalError") ||
      error.message.includes("Invalid argument: Infinity")
    ) {
      console.warn("Suppressing Decimal error in preview mode:", error.message);
      return null;
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      error.message.includes("DecimalError") ||
      error.message.includes("Invalid argument: Infinity")
    ) {
      console.warn(
        "Suppressing Decimal error in preview mode:",
        error,
        errorInfo
      );
      return;
    }
    console.error("Preview error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-full w-full relative">
          {this.props.children}
          <div className="absolute top-4 right-4 bg-warning/20 border border-warning/50 rounded-lg p-3 max-w-xs z-50">
            <div className="flex items-start gap-2">
              <div className="i-mdi:alert-circle-outline text-warning h-5 w-5 flex-shrink-0 mt-0.5"></div>
              <div className="flex-1">
                <p className="text-xs font-medium text-warning mb-1">
                  Preview Warning
                </p>
                <p className="text-xs text-gray-400">
                  Some features may not work correctly in preview mode.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PreviewErrorBoundary;
