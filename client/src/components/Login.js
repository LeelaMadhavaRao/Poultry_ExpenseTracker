"use client"

import { useState } from "react"
import api from "./Api/api"
import axios from "axios"

const Login = ({ onLogin, onSwitchToSignup }) => {
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
    <div className="auth-form">
      <div className="auth-card">
        <h2>Login to Poultry Farm Tracker</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
        <p>
          Don't have an account?
          <button className="link-btn" onClick={onSwitchToSignup}>
            Sign up here
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login