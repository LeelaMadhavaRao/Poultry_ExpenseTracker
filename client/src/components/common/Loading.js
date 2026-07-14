"use client"

import PropTypes from "prop-types"

const Loading = ({ message = "Loading...", type = "spinner", fullPage = false }) => {
  const renderContent = () => {
    switch (type) {
      case "skeleton":
        return (
          <div style={styles.skeleton}>
            <div style={styles.skeletonBar} />
            <div style={{ ...styles.skeletonBar, width: "70%" }} />
            <div style={{ ...styles.skeletonBar, width: "50%" }} />
          </div>
        )

      case "inline":
        return (
          <span style={styles.inline}>
            <span style={styles.inlineDot} />
            <span>{message}</span>
          </span>
        )

      case "spinner":
      default:
        return (
          <div style={styles.spinnerContainer}>
            <div style={styles.spinner}>
              <div style={styles.spinnerRing} />
            </div>
            <p style={styles.message}>{message}</p>
          </div>
        )
    }
  }

  if (fullPage) {
    return (
      <div style={styles.fullPageOverlay}>
        <div style={styles.fullPageContent}>{renderContent()}</div>
      </div>
    )
  }

  return renderContent()
}

const spinKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`

if (typeof document !== "undefined") {
  const styleId = "loading-component-keyframes"
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style")
    styleEl.id = styleId
    styleEl.textContent = spinKeyframes
    document.head.appendChild(styleEl)
  }
}

const styles = {
  fullPageOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(246, 248, 245, 0.85)",
    backdropFilter: "blur(2px)",
  },
  fullPageContent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  spinner: {
    width: 44,
    height: 44,
    position: "relative",
  },
  spinnerRing: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "4px solid #e0e7de",
    borderTopColor: "#2d6a4f",
    animation: "spin 0.8s linear infinite",
    boxSizing: "border-box",
  },
  message: {
    fontSize: 15,
    color: "#5a6c5e",
    fontFamily: "'Manrope', sans-serif",
    margin: 0,
  },
  skeleton: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  skeletonBar: {
    height: 16,
    borderRadius: 8,
    background: "linear-gradient(90deg, #e8ede6 25%, #d4dcd2 50%, #e8ede6 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s ease-in-out infinite",
  },
  inline: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#5a6c5e",
    fontFamily: "'Manrope', sans-serif",
  },
  inlineDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    display: "inline-block",
    backgroundColor: "#2d6a4f",
    animation: "spin 0.6s linear infinite",
  },
}

Loading.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(["spinner", "skeleton", "inline"]),
  fullPage: PropTypes.bool,
}

export default Loading
