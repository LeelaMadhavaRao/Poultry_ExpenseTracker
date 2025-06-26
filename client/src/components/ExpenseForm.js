"use client"

import { useState } from "react"
import api from "./Api/api"
import axios from "axios"

const ExpenseForm = ({ onAddExpense }) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Birds purchase",
  })

  const expenseCategories = [
    "Birds purchase",
    "Maize",
    "Stone",
    "soybean",
    "broken rice",
    "feed medicines",
    "liquid medicines",
    "vaccination",
    "Machinary purchase",
    "maintenance",
    "diesel",
    "electricity",
    "Labour",
    "Tax",
    "Construction",
    "PersonalUse",
    "other",
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onAddExpense({
      ...formData,
      amount: Number.parseFloat(formData.amount),
    })
    setFormData({
      name: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: "Birds purchase",
    })
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Add Expense</h2>
      </div>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>Expense Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter expense name"
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
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary">
          Add Expense
        </button>
      </form>
    </div>
  )
}

export default ExpenseForm