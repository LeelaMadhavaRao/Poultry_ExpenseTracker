"use client"

import { useState, useMemo } from "react"
import api from "./Api/api"
import axios from "axios"
import PieChart from "./PieChart"

const ExpenseList = ({ expenses, onUpdateExpense, onDeleteExpense }) => {
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7))
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

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

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseMonth = new Date(expense.date).toISOString().slice(0, 7)
      const matchesMonth = expenseMonth === monthFilter
      const matchesSearch =
        expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesMonth && matchesSearch
    })
  }, [expenses, monthFilter, searchTerm])

  const categoryData = useMemo(() => {
    const categoryTotals = {}
    filteredExpenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })

    const colors = [
      "#F44336",
      "#E91E63",
      "#9C27B0",
      "#673AB7",
      "#3F51B5",
      "#2196F3",
      "#03A9F4",
      "#00BCD4",
      "#009688",
      "#4CAF50",
      "#8BC34A",
      "#CDDC39",
      "#FFEB3B",
      "#FFC107",
      "#FF9800",
      "#FF5722",
      "#795548",
    ]
    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      name: category,
      value: amount,
      color: colors[index % colors.length],
    }))
  }, [filteredExpenses])

  const handleEdit = (expense) => {
    setEditingId(expense._id)
    setEditForm({ ...expense, date: new Date(expense.date).toISOString().split("T")[0] })
  }

  const handleSaveEdit = async () => {
    await onUpdateExpense(editingId, {
      ...editForm,
      amount: Number.parseFloat(editForm.amount),
    })
    setEditingId(null)
    setEditForm({})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      await onDeleteExpense(id)
    }
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Expense List</h2>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Month:</label>
          <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search expense..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <h3>Total Expense: ₹{filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0).toLocaleString()}</h3>
        </div>
      </div>

      <div className="list-content">
        <div className="list-left">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id}>
                    {editingId === expense._id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: (e.target.value==null?alert("Name cannot be empty"):e.target.value) })}
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: (e.target.value==null?alert("Date cannot be empty"):e.target.value) })}
                          />
                        </td>
                        <td>
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: (e.target.value==null?alert("Category cannot be empty"):e.target.value) })}
                          >
                            {expenseCategories.map((category) => (
                              <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: (e.target.value==null?alert("Amount cannot be empty"):e.target.value) })}
                          />
                        </td>
                        <td>
                          <button className="btn-save" onClick={handleSaveEdit}>
                            Save
                          </button>
                          <button className="btn-cancel" onClick={handleCancelEdit}>
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{expense.name}</td>
                        <td>{new Date(expense.date).toISOString().split("T")[0]}</td>
                        <td>{expense.category}</td>
                        <td className="amount negative">₹{expense.amount.toLocaleString()}</td>
                        <td>
                          <button className="btn-edit" onClick={() => handleEdit(expense)}>
                            Edit
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(expense._id)}>
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="list-right">
          <div className="chart-container">
            <h3>Expenses by Category</h3>
            {categoryData.length > 0 ? <PieChart data={categoryData} /> : <p>No data available for selected month</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseList