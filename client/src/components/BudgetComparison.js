import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import PropTypes from "prop-types"
import api from "./Api/api"
import Loading from "./common/Loading"
import Modal from "./common/Modal"

const EXPENSE_CATEGORIES = [
  "Birds Purchase", "Maize", "Stone", "Soybean", "Broken Rice",
  "Feed Medicines", "Liquid Medicines", "Vaccination", "Machinery Purchase",
  "Maintenance", "Diesel", "Electricity", "Labour", "Tax", "Construction",
  "Personal Use", "Other",
]

const BudgetComparison = ({ seasonId, seasonName }) => {
  const [budgets, setBudgets] = useState([])
  const [comparison, setComparison] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBudget, setNewBudget] = useState({ category: "Feed Medicines", budgetAmount: "" })
  const [submitting, setSubmitting] = useState(false)

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  const fetchBudgets = useCallback(async () => {
    if (!seasonId) return
    setLoading(true)
    const hdrs = { Authorization: `Bearer ${localStorage.getItem("token")}` }
    try {
      const [budgetsRes, compRes] = await Promise.all([
        axios.get(`${api}/budgets?seasonId=${seasonId}`, { headers: hdrs }),
        axios.get(`${api}/budgets/comparison?seasonId=${seasonId}`, { headers: hdrs }),
      ])
      setBudgets(budgetsRes.data)
      setComparison(compRes.data)
    } catch (error) {
      toast.error("Failed to load budget data")
    } finally {
      setLoading(false)
    }
  }, [seasonId])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const handleAddBudget = async () => {
    if (!newBudget.budgetAmount || Number.parseFloat(newBudget.budgetAmount) <= 0) {
      toast.error("Please enter a valid budget amount")
      return
    }
    setSubmitting(true)
    try {
      await axios.post(
        `${api}/budgets`,
        { seasonId, category: newBudget.category, budgetAmount: Number.parseFloat(newBudget.budgetAmount) },
        { headers }
      )
      toast.success("Budget set successfully")
      setShowAddModal(false)
      setNewBudget({ category: "Feed Medicines", budgetAmount: "" })
      fetchBudgets()
    } catch (error) {
      toast.error(error.response?.data?.error || "Error setting budget")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBudget = async (id) => {
    if (!window.confirm("Delete this budget?")) return
    try {
      await axios.delete(`${api}/budgets/${id}`, { headers })
      toast.success("Budget deleted")
      fetchBudgets()
    } catch (error) {
      toast.error("Error deleting budget")
    }
  }

  const getProgressColor = (percentage) => {
    if (percentage <= 75) return "safe"
    if (percentage <= 100) return "warning"
    return "over"
  }

  if (!seasonId) return <p>Select a season to view budgets</p>

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3>Budget vs Actual - {seasonName}</h3>
        <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ width: "auto", padding: "8px 16px" }}>
          + Set Budget
        </button>
      </div>

      {loading ? (
        <Loading message="Loading budgets..." />
      ) : comparison.length === 0 ? (
        <p className="no-data">No budgets set for this season. Set a budget to track your spending.</p>
      ) : (
        comparison.map((item) => {
          const percentage = item.budget > 0 ? Math.round((item.actual / item.budget) * 100) : 0
          const status = getProgressColor(percentage)
          return (
            <div key={item.category} className="budget-card">
              <div className="budget-header">
                <span style={{ fontWeight: 600 }}>{item.category}</span>
                <span style={{ fontSize: 14, color: "#5a6c5e" }}>
                  Spent ₹{item.actual.toLocaleString()} of ₹{item.budget.toLocaleString()}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: item.variance >= 0 ? "#27ae60" : "#e74c3c" }}>
                  {item.variance >= 0 ? "Under by" : "Over by"} ₹{Math.abs(item.variance).toLocaleString()} ({percentage}%)
                </span>
              </div>
              <div className="budget-progress-bar">
                <div
                  className={`budget-progress-fill ${status}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )
        })
      )}

      <div style={{ marginTop: 24 }}>
        <h3>Active Budget Limits</h3>
        {budgets.length === 0 ? (
          <p className="no-data">No active budgets</p>
        ) : (
          budgets.map((b) => (
            <div key={b._id} className="budget-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><strong>{b.category}</strong> - Limit: ₹{b.budgetAmount.toLocaleString()}</span>
                <button className="btn-delete" onClick={() => handleDeleteBudget(b._id)}>Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Set Budget Limit" size="sm">
        <div className="form-group">
          <label>Category</label>
          <select value={newBudget.category} onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Budget Amount (₹)</label>
          <input
            type="number"
            value={newBudget.budgetAmount}
            onChange={(e) => setNewBudget({ ...newBudget, budgetAmount: e.target.value })}
            placeholder="Enter budget limit"
            min="0"
          />
        </div>
        <button className="btn-primary" onClick={handleAddBudget} disabled={submitting}>
          {submitting ? "Saving..." : "Save Budget"}
        </button>
      </Modal>
    </div>
  )
}

BudgetComparison.propTypes = {
  seasonId: PropTypes.string,
  seasonName: PropTypes.string,
}

export default BudgetComparison
