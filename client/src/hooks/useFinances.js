"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import api from "../components/Api/api"

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
})

const useFinances = () => {
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])

  const fetchIncomes = useCallback(async (seasonId) => {
    try {
      const response = await axios.get(`${api}/incomes?seasonId=${seasonId}`, {
        headers: getAuthHeaders(),
      })
      setIncomes(response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching incomes:", error.response?.data || error.message)
      setIncomes([])
      return []
    }
  }, [])

  const fetchExpenses = useCallback(async (seasonId) => {
    try {
      const response = await axios.get(`${api}/expenses?seasonId=${seasonId}`, {
        headers: getAuthHeaders(),
      })
      setExpenses(response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching expenses:", error.response?.data || error.message)
      setExpenses([])
      return []
    }
  }, [])

  const addIncome = useCallback(async (income) => {
    try {
      const response = await axios.post(
        `${api}/incomes`,
        income,
        { headers: getAuthHeaders() }
      )
      setIncomes((prev) => [...prev, response.data])
      toast.success("Income added successfully")
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || "Error adding income"
      toast.error(message)
      throw error
    }
  }, [])

  const addExpense = useCallback(async (expense) => {
    try {
      const response = await axios.post(
        `${api}/expenses`,
        expense,
        { headers: getAuthHeaders() }
      )
      setExpenses((prev) => [...prev, response.data])
      toast.success("Expense added successfully")
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || "Error adding expense"
      toast.error(message)
      throw error
    }
  }, [])

  const updateIncome = useCallback(async (id, data) => {
    try {
      const response = await axios.put(
        `${api}/incomes/${id}`,
        data,
        { headers: getAuthHeaders() }
      )
      setIncomes((prev) => prev.map((income) => (income._id === id ? response.data : income)))
      toast.success("Income updated successfully")
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || "Error updating income"
      toast.error(message)
      throw error
    }
  }, [])

  const updateExpense = useCallback(async (id, data) => {
    try {
      const response = await axios.put(
        `${api}/expenses/${id}`,
        data,
        { headers: getAuthHeaders() }
      )
      setExpenses((prev) => prev.map((expense) => (expense._id === id ? response.data : expense)))
      toast.success("Expense updated successfully")
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || "Error updating expense"
      toast.error(message)
      throw error
    }
  }, [])

  const deleteIncome = useCallback(async (id) => {
    try {
      await axios.delete(`${api}/incomes/${id}`, {
        headers: getAuthHeaders(),
      })
      setIncomes((prev) => prev.filter((income) => income._id !== id))
      toast.success("Income deleted successfully")
    } catch (error) {
      const message = error.response?.data?.error || "Error deleting income"
      toast.error(message)
      throw error
    }
  }, [])

  const deleteExpense = useCallback(async (id) => {
    try {
      await axios.delete(`${api}/expenses/${id}`, {
        headers: getAuthHeaders(),
      })
      setExpenses((prev) => prev.filter((expense) => expense._id !== id))
      toast.success("Expense deleted successfully")
    } catch (error) {
      const message = error.response?.data?.error || "Error deleting expense"
      toast.error(message)
      throw error
    }
  }, [])

  const clearFinances = useCallback(() => {
    setIncomes([])
    setExpenses([])
  }, [])

  return {
    incomes,
    expenses,
    setIncomes,
    setExpenses,
    fetchIncomes,
    fetchExpenses,
    addIncome,
    addExpense,
    updateIncome,
    updateExpense,
    deleteIncome,
    deleteExpense,
    clearFinances,
  }
}

export default useFinances
