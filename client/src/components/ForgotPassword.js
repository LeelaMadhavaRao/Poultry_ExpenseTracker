"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import api from "./Api/api"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${api}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      setSubmitted(true)
      toast.success(data.message || "Reset link sent to your email")
    } catch (err) {
      toast.error(err.message || "Failed to send reset link")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Forgot Password</h2>
          <p style={styles.subtitle}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div style={styles.successBox}>
            <p style={styles.successText}>
              If an account with that email exists, a password reset link has been sent. Please check your inbox.
            </p>
            <Link to="/login" style={styles.link}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {!submitted && (
          <p style={styles.footerText}>
            Remember your password?{" "}
            <Link to="/login" style={styles.link}>
              Log in
            </Link>
          </p>
        )}
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
    opacity: undefined,
  },
  successBox: {
    textAlign: "center",
    padding: "20px 0",
  },
  successText: {
    color: "var(--color-text-muted, #5a6c5e)",
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 20,
  },
  footerText: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 14,
    color: "var(--color-text-muted, #5a6c5e)",
  },
  link: {
    color: "#2d6a4f",
    textDecoration: "none",
    fontWeight: 600,
  },
}

export default ForgotPassword
