import React from "react";
import PropTypes from "prop-types";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Update state with error details
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to external service (e.g., Sentry, LogRocket)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    if (import.meta.env.DEV) {
      console.group("🚨 Error Boundary - Detailed Error Info");
      console.error("Error:", error.toString());
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }

    // You can also send to your backend API
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     error: error.toString(),
    //     errorInfo: errorInfo.componentStack,
    //     timestamp: new Date().toISOString(),
    //   }),
    // });
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI if provided
      if (fallback) {
        return fallback(error, this.handleReset);
      }

      // Default fallback UI
      return (
        <div className="error-boundary-container" style={styles.container}>
          <div className="error-boundary-content" style={styles.content}>
            <div style={styles.iconContainer}>
              <svg
                style={styles.icon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 style={styles.title}>Oops! Something went wrong</h1>

            <p style={styles.message}>
              We're sorry, but something unexpected happened. The error has been
              logged and we'll look into it.
            </p>

            {errorCount > 2 && (
              <div style={styles.warningBox}>
                <p style={styles.warningText}>
                  ⚠️ This error has occurred {errorCount} times. Please try
                  reloading the page or contact support if the issue persists.
                </p>
              </div>
            )}

            <div style={styles.buttonGroup}>
              <button
                onClick={this.handleReset}
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Reload Page
              </button>
            </div>

            {import.meta.env.DEV && error && (
              <details style={styles.details}>
                <summary style={styles.summary}>
                  Error Details (Development Only)
                </summary>
                <div style={styles.errorDetails}>
                  <p style={styles.errorMessage}>
                    <strong>Error:</strong> {error.toString()}
                  </p>
                  {errorInfo && errorInfo.componentStack && (
                    <pre style={styles.stack}>
                      <strong>Component Stack:</strong>
                      {errorInfo.componentStack}
                    </pre>
                  )}
                  {error.stack && (
                    <pre style={styles.stack}>
                      <strong>Error Stack:</strong>
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
};

// Inline styles for error boundary
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7fafc",
    padding: "1rem",
  },
  content: {
    maxWidth: "42rem",
    width: "100%",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    padding: "2rem",
    textAlign: "center",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  icon: {
    width: "4rem",
    height: "4rem",
    color: "#f56565",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: "1rem",
  },
  message: {
    fontSize: "1.125rem",
    color: "#4a5568",
    marginBottom: "2rem",
    lineHeight: "1.75",
  },
  warningBox: {
    backgroundColor: "#fef5e7",
    border: "1px solid #f39c12",
    borderRadius: "0.375rem",
    padding: "1rem",
    marginBottom: "1.5rem",
  },
  warningText: {
    color: "#8b6914",
    fontSize: "0.875rem",
    margin: 0,
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginBottom: "2rem",
  },
  button: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "0.375rem",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  primaryButton: {
    backgroundColor: "#3182ce",
    color: "white",
  },
  secondaryButton: {
    backgroundColor: "#e2e8f0",
    color: "#2d3748",
  },
  details: {
    marginTop: "2rem",
    textAlign: "left",
    backgroundColor: "#f7fafc",
    borderRadius: "0.375rem",
    padding: "1rem",
  },
  summary: {
    cursor: "pointer",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "1rem",
  },
  errorDetails: {
    marginTop: "1rem",
  },
  errorMessage: {
    color: "#e53e3e",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
  stack: {
    backgroundColor: "#2d3748",
    color: "#e2e8f0",
    padding: "1rem",
    borderRadius: "0.375rem",
    fontSize: "0.75rem",
    overflow: "auto",
    maxHeight: "15rem",
    marginTop: "0.5rem",
  },
};

export default ErrorBoundary;
