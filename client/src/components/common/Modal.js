"use client"

import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"

const sizeMap = {
  sm: { width: "400px" },
  md: { width: "560px" },
  lg: { width: "720px" },
}

const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true)
        })
      })
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setVisible(false), 220)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  if (!visible) return null

  const overlayStyle = {
    ...styles.overlay,
    opacity: animating ? 1 : 0,
    transition: "opacity 0.22s ease",
  }

  const contentStyle = {
    ...styles.content,
    ...sizeMap[size],
    transform: animating ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
    opacity: animating ? 1 : 0,
    transition: "transform 0.22s ease, opacity 0.22s ease",
  }

  return (
    <div style={overlayStyle} ref={overlayRef} onClick={handleOverlayClick}>
      <div style={contentStyle}>
        {title && (
          <div style={styles.header}>
            <h2 style={styles.title}>{title}</h2>
            <button
              onClick={onClose}
              style={styles.closeBtn}
              aria-label="Close"
              type="button"
            >
              &times;
            </button>
          </div>
        )}
        <div style={styles.body}>{children}</div>
        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    backdropFilter: "blur(2px)",
    padding: 24,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
    maxWidth: "90vw",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px 0",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1c271f",
    fontFamily: "'Sora', sans-serif",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 26,
    color: "#8a9c8e",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
    transition: "color 0.15s",
  },
  body: {
    padding: "20px 24px",
    overflowY: "auto",
    flex: 1,
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid #e8ede6",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
}

export default Modal
