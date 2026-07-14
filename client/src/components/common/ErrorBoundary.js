"use client"

import { Component } from "react"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.reload()
    }
  }

  renderFallback() {
    if (this.props.fallback) {
      return this.props.fallback({
        error: this.state.error,
        reset: this.handleReload,
      })
    }

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.heading}>Something went wrong</h1>
          <p style={styles.message}>
            An unexpected error occurred. Please try reloading the page.
          </p>
          <button onClick={this.handleReload} style={styles.button}>
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback()
    }

    return this.props.children
  }
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(145deg, #f8f2e8 0%, #dceadd 45%, #c8e4da 100%)",
    padding: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "48px 40px",
    textAlign: "center",
    maxWidth: 480,
    width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1c271f",
    marginBottom: 12,
    fontFamily: "'Sora', sans-serif",
  },
  message: {
    fontSize: 15,
    color: "#5a6c5e",
    marginBottom: 28,
    lineHeight: 1.6,
  },
  button: {
    padding: "12px 32px",
    fontSize: 15,
    fontWeight: 600,
    backgroundColor: "#2d6a4f",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "'Manrope', sans-serif",
  },
}

export default ErrorBoundary
