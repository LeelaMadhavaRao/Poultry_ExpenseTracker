"use client"

import { useState } from "react"
import api from "./Api/api"
import axios from "axios"

const IncomeForm = ({ onAddIncome }) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "eggs local",
  })

  const incomeCategories = ["eggs load", "eggs local", "birds sale", "Feces sale", "other"]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onAddIncome({
      ...formData,
      amount: Number.parseFloat(formData.amount),
    })
    setFormData({
      name: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: "eggs local",
    })
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Add Income</h2>
      </div>
      <form onSubmit={handleSubmit} className="income-form">
        <div className="form-group">
          <label>Income Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter income name"
            required
          />
        </div>

        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            {incomeCategories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary">
          Add Income
        </button>
      </form>
    </div>
  )
}

export default IncomeForm