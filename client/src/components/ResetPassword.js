"use client"

import { useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import api from "./Api/api"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}

    if (!newPassword || newPassword.length < 6) {
      errs.newPassword = "Password must be at least 6 characters"
    }

    if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    if (!token) {
      toast.error("Invalid or missing reset token")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${api}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      toast.success(data.message || "Password reset successfully")
      navigate("/login", { replace: true })
    } catch (err) {
      toast.error(err.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={{ textAlign: "center" }}>
            <h2 style={styles.title}>Invalid Link</h2>
            <p style={styles.invalidText}>
              This password reset link is invalid or has expired.
            </p>
            <Link to="/login" style={styles.link}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Reset Password</h2>
          <p style={styles.subtitle}>Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="newPassword" style={styles.label}>
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              style={{
                ...styles.input,
                borderColor: errors.newPassword ? "#e74c3c" : "var(--color-border, #e0e7de)",
              }}
            />
            {errors.newPassword && <span style={styles.error}>{errors.newPassword}</span>}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              style={{
                ...styles.input,
                borderColor: errors.confirmPassword ? "#e74c3c" : "var(--color-border, #e0e7de)",
              }}
            />
            {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p style={styles.footerText}>
          <Link to="/login" style={styles.link}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(145deg, #f8f2e8 0%, #dceadd 45%, #c8e4da 100%)",
    padding: 24,
  },
  card: {
    background: "var(--color-surface, #fff)",
    padding: 40,
    borderRadius: 18,
    border: "1px solid var(--color-border, #e0e7de)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
    width: "100%",
    maxWidth: 440,
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
  },
  title: {
    fontFamily: '"Sora", sans-serif',
    color: "var(--color-text, #1c271f)",
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    color: "var(--color-text-muted, #5a6c5e)",
    fontSize: 14,
    lineHeight: 1.6,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    display: "block",
    marginBottom: 5,
    fontWeight: 500,
    color: "var(--color-text-muted, #5a6c5e)",
    fontSize: 14,
  },
  input: {
    width: "100%",
    padding: 12,
    border: "2px solid var(--color-border, #e0e7de)",
    borderRadius: 8,
    fontSize: 16,
    transition: "border-color 0.3s",
    outline: "none",
  },
  error: {
    color: "#e74c3c",
    fontSize: 13,
    marginTop: 5,
    display: "block",
  },
  button: {
    width: "100%",
    padding: 12,
    background: "linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  footerText: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 14,
  },
  link: {
    color: "#2d6a4f",
    textDecoration: "none",
    fontWeight: 600,
  },
  invalidText: {
    color: "var(--color-text-muted, #5a6c5e)",
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 20,
  },
}

export default ResetPassword
