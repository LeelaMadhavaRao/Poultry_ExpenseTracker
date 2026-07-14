"use client"

import { useState } from "react"
import { useTranslation } from "../i18n/i18n"

const Login = ({ onLogin, onSwitchToSignup }) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onLogin(formData)
  }

  return (
    <div className="auth-shell">
      <div className="auth-side-panel">
        <p className="auth-side-kicker">Welcome Back</p>
        <h2>Continue Managing Your Poultry Finances</h2>
        <p>
          Log in to track income, update expenses, and review season-level performance without losing data accuracy.
        </p>
        <ul className="auth-side-list">
          <li>Access your complete season history</li>
          <li>Update transactions from any device</li>
          <li>Get clear visibility on profit and spending</li>
        </ul>
      </div>

      <div className="auth-form">
        <div className="auth-card">
          <h2>{t("auth.login")}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t("auth.username")}</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>{t("auth.password")}</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary">
              {t("auth.login")}
            </button>
          </form>
          <p className="auth-switch-text">
            <a href="/forgot-password" className="link-btn">
              {t("auth.forgotPassword")}
            </a>
          </p>
          <p className="auth-switch-text">
            {t("auth.noAccount")}
            <button className="link-btn" onClick={onSwitchToSignup}>
              {t("auth.signupHere")}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login