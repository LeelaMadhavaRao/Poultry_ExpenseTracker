"use client"

import { useState, useMemo } from "react"
import api from "./Api/api"
import axios from "axios"
import PieChart from "./PieChart"

const IncomeList = ({ incomes, onUpdateIncome, onDeleteIncome }) => {
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7))
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const incomeCategories = ["eggs load", "eggs local", "birds sale", "Feces sale", "other"]

  const filteredIncomes = useMemo(() => {
    return incomes.filter((income) => {
      const incomeMonth = new Date(income.date).toISOString().slice(0, 7)
      const matchesMonth = incomeMonth === monthFilter
      const matchesSearch =
        income.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        income.category.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesMonth && matchesSearch
    })
  }, [incomes, monthFilter, searchTerm])

  const categoryData = useMemo(() => {
    const categoryTotals = {}
    filteredIncomes.forEach((income) => {
      categoryTotals[income.category] = (categoryTotals[income.category] || 0) + income.amount
    })

    const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336"]
    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      name: category,
      value: amount,
      color: colors[index % colors.length],
    }))
  }, [filteredIncomes])

  const handleEdit = (income) => {
    setEditingId(income._id)
    setEditForm({ ...income, date: new Date(income.date).toISOString().split("T")[0] })
  }

  const handleSaveEdit = async () => {
    await onUpdateIncome(editingId, {
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
    if (window.confirm("Are you sure you want to delete this income?")) {
      await onDeleteIncome(id)
    }
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Income List</h2>
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
            placeholder="Search income..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <h3>Total Income: ₹{filteredIncomes.reduce((acc, income) => acc + income.amount, 0).toLocaleString()}</h3>
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
                {filteredIncomes.map((income) => (
                  <tr key={income._id}>
                    {editingId === income._id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          />
                        </td>
                        <td>
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          >
                            {incomeCategories.map((category) => (
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
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
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
                        <td>{income.name}</td>
                        <td>{new Date(income.date).toISOString().split("T")[0]}</td>
                        <td>{income.category}</td>
                        <td className="amount positive">₹{income.amount.toLocaleString()}</td>
                        <td>
                          <button className="btn-edit" onClick={() => handleEdit(income)}>
                            Edit
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(income._id)}>
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
            <h3>Income by Category</h3>
            {categoryData.length > 0 ? <PieChart data={categoryData} /> : <p>No data available for selected month</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncomeList