"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import api from "../components/Api/api"

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    try {
      const response = await axios.post(`${api}/auth/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      })
      localStorage.setItem("token", response.data.token)
      setIsAuthenticated(true)
      toast.success("Logged in successfully")
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || "Login failed"
      toast.error(message)
      throw error
    }
  }, [])

  const signup = useCallback(async (userData) => {
    try {
      const response = await axios.post(`${api}/auth/signup`, userData, {
        withCredentials: true,
      })
      localStorage.setItem("token", response.data.token)
      setIsAuthenticated(true)
      toast.success("Account created successfully")
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || "Signup failed"
      toast.error(message)
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    toast.success("Logged out")
  }, [])

  return {
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
  }
}

export default useAuth
