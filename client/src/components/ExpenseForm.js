"use client"

import { useState } from "react"
import { useTranslation } from "../i18n/i18n"

const ExpenseForm = ({ onAddExpense }) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
      category: "Birds Purchase",
  })

  const expenseCategories = [
    "Birds Purchase",
    "Maize",
    "Stone",
    "Soybean",
    "Broken Rice",
    "Feed Medicines",
    "Liquid Medicines",
    "Vaccination",
    "Machinery Purchase",
    "Maintenance",
    "Diesel",
    "Electricity",
    "Labour",
    "Tax",
    "Construction",
    "Personal Use",
    "Other",
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
    category: "Birds Purchase",
    })
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{t("form.addExpense")}</h2>
      </div>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>{t("form.name")}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t("form.name")}
            required
          />
        </div>

        <div className="form-group">
          <label>{t("form.amount")}</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder={t("form.amount")}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>{t("form.date")}</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>{t("form.category")}</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary">
          {t("form.addExpense")}
        </button>
      </form>
    </div>
  )
}

export default ExpenseForm