import { useState, useMemo } from "react"
import PropTypes from "prop-types"
import toast from "react-hot-toast"
import Pagination from "./Pagination"
import { exportToCSV } from "../utils/exportData"
import { useTranslation } from "../i18n/i18n"

const ITEMS_PER_PAGE = 10

const DonutChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return <p className="no-data">No data available</p>
  const circumference = 2 * Math.PI * 45
  let cumulativeOffset = 0

  return (
    <svg viewBox="0 0 120 120" style={{ width: 180, height: 180 }}>
      {data.map((item, i) => {
        const pct = item.value / total
        const dashLength = pct * circumference
        const rotation = (cumulativeOffset / circumference) * 360 - 90
        cumulativeOffset += dashLength
        return (
          <circle key={i} cx="60" cy="60" r="45" fill="none"
            stroke={item.color} strokeWidth="20"
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            transform={`rotate(${rotation} 60 60)`}
            strokeLinecap="butt"
          />
        )
      })}
      <circle cx="60" cy="60" r="35" fill="var(--color-surface-container-lowest)" />
      <text x="60" y="56" textAnchor="middle" fill="var(--color-text)" fontSize="14" fontWeight="700" fontFamily="var(--font-display)">Total</text>
      <text x="60" y="74" textAnchor="middle" fill="var(--color-danger)" fontSize="12" fontWeight="700" fontFamily="var(--font-display)">₹{total.toLocaleString()}</text>
    </svg>
  )
}

DonutChart.propTypes = {
  data: PropTypes.array.isRequired,
}

const ExpenseList = ({ expenses, onUpdateExpense, onDeleteExpense, onAddExpense }) => {
  const { t } = useTranslation()
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7))
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  const expenseCategories = [
    "Birds Purchase", "Maize", "Stone", "Soybean", "Broken Rice",
    "Feed Medicines", "Liquid Medicines", "Vaccination", "Machinery Purchase",
    "Maintenance", "Diesel", "Electricity", "Labour", "Tax", "Construction",
    "Personal Use", "Other",
  ]

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseMonth = new Date(expense.date).toISOString().slice(0, 7)
      return expenseMonth === monthFilter
        && (expense.name.toLowerCase().includes(searchTerm.toLowerCase())
        || expense.category.toLowerCase().includes(searchTerm.toLowerCase()))
    })
  }, [expenses, monthFilter, searchTerm])

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE)
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const totalAmount = filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0)

  const categoryData = useMemo(() => {
    const categoryTotals = {}
    filteredExpenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })
    const colors = ["#F44336","#E91E63","#9C27B0","#673AB7","#3F51B5","#2196F3","#03A9F4","#00BCD4","#009688","#4CAF50","#8BC34A","#CDDC39","#FFEB3B","#FFC107","#FF9800","#FF5722","#795548"]
    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      name: category, value: amount, color: colors[index % colors.length],
    })).sort((a, b) => b.value - a.value)
  }, [filteredExpenses])

  const handleEdit = (expense) => {
    setEditingId(expense._id)
    setEditForm({ ...expense, date: new Date(expense.date).toISOString().split("T")[0] })
  }

  const handleSaveEdit = async () => {
    if (!editForm.name?.trim()) { toast.error("Name cannot be empty"); return }
    if (!editForm.amount || isNaN(Number.parseFloat(editForm.amount)) || Number.parseFloat(editForm.amount) <= 0) { toast.error("Amount must be valid"); return }
    await onUpdateExpense(editingId, { ...editForm, amount: Number.parseFloat(editForm.amount) })
    setEditingId(null)
    setEditForm({})
  }

  const handleCancelEdit = () => { setEditingId(null); setEditForm({}) }

  const handleDelete = async (id) => {
    if (window.confirm(t("general.confirmDelete"))) {
      await onDeleteExpense(id)
    }
  }

  return (
    <div className="el-wrapper">
      {/* Header */}
      <div className="el-header">
        <div>
          <h2 className="el-heading">Farm Expenses</h2>
          <p className="el-subtitle">Track all farm expenditures & operational costs</p>
        </div>
        {onAddExpense && (
          <button className="btn-primary" onClick={onAddExpense} style={{ whiteSpace: "nowrap" }}>
            + Add New Expense
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="el-grid">
        {/* Left Column */}
        <div className="el-left">
          {/* Filter Row */}
          <div className="el-filter-row glass-card">
            <div className="el-filter-group">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                className="el-search-input"
              />
            </div>
            <div className="el-filter-group">
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1) }}
                className="el-month-input"
              />
            </div>
            <div className="el-filter-total">
              ₹{totalAmount.toLocaleString()} <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>({filteredExpenses.length} items)</span>
            </div>
            <button className="btn-secondary" onClick={() => exportToCSV(filteredExpenses, "expenses.csv")} style={{ height: 42, padding: "0 18px", fontSize: 13 }}>
              Export
            </button>
          </div>

          {/* Data Table */}
          <div className="el-table-wrap glass-card">
            <table className="el-table">
              <thead>
                <tr>
                  <th>{t("form.name")}</th>
                  <th>{t("form.date")}</th>
                  <th>{t("form.category")}</th>
                  <th className="el-amount-th">{t("form.amount")}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.map((expense) => (
                  <tr key={expense._id}>
                    {editingId === expense._id ? (
                      <>
                        <td><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                        <td><input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} /></td>
                        <td>
                          <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                            {expenseCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </td>
                        <td><input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></td>
                        <td>
                          <div className="el-actions">
                            <button className="btn-save" onClick={handleSaveEdit}>{t("form.save")}</button>
                            <button className="btn-cancel" onClick={handleCancelEdit}>{t("form.cancel")}</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="el-name">{expense.name}</td>
                        <td className="el-date">{new Date(expense.date).toISOString().split("T")[0]}</td>
                        <td><span className="el-cat-badge">{expense.category}</span></td>
                        <td className="el-amount el-amount-negative">₹{expense.amount.toLocaleString()}</td>
                        <td>
                          <div className="el-actions">
                            <button className="el-icon-btn" title="Edit" onClick={() => handleEdit(expense)}>
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button className="el-icon-btn el-icon-btn-danger" title="Delete" onClick={() => handleDelete(expense._id)}>
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {paginatedExpenses.length === 0 && (
                  <tr><td colSpan={5} className="el-no-data">{t("general.noData")}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>

        {/* Right Column */}
        <div className="el-right">
          {/* Donut Chart Card */}
          <div className="el-chart-card glass-card">
            <h4>Expense by Category</h4>
            <div className="el-donut-wrap">
              <DonutChart data={categoryData} />
            </div>
            <div className="el-legend">
              {categoryData.slice(0, 5).map((item, i) => {
                const pct = totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(0) : 0
                return (
                  <div key={i} className="el-legend-item">
                    <span className="el-legend-dot" style={{ background: item.color }} />
                    <span className="el-legend-label">{item.name}</span>
                    <span className="el-legend-pct">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cost Analysis Card */}
          <div className="el-cost-card">
            <div className="el-cost-content">
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--color-warning)" }}>analytics</span>
              <h4>Cost Analysis</h4>
              <p>Review expense trends to optimize feed, medicine & operational spending.</p>
            </div>
            <div className="el-cost-shape" />
          </div>
        </div>
      </div>

      <style>{elCSS}</style>
    </div>
  )
}

const elCSS = `
.el-wrapper { padding: 24px; max-width: 1200px; margin: 0 auto; }
.el-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.el-heading { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--color-text); margin: 0; }
.el-subtitle { font-size: 14px; color: var(--color-text-muted); margin: 4px 0 0; }

.el-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: start; }
.el-left { display: flex; flex-direction: column; gap: 16px; }
.el-right { display: flex; flex-direction: column; gap: 16px; }

/* Filter Row */
.el-filter-row { display: flex; align-items: center; gap: 12px; padding: 14px 18px; flex-wrap: wrap; }
.el-filter-group { flex: 1; min-width: 140px; }
.el-search-input, .el-month-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 13px; font-family: var(--font-body); background: var(--color-surface-container-lowest); color: var(--color-text); height: 42px; }
.el-search-input:focus, .el-month-input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(0,54,26,0.1); }
.el-filter-total { font-size: 14px; font-weight: 700; font-family: var(--font-display); color: var(--color-danger); white-space: nowrap; }

/* Table */
.el-table-wrap { padding: 4px; }
.el-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.el-table th { padding: 12px 14px; text-align: left; font-weight: 600; color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; background: var(--color-bg); border-bottom: 2px solid var(--color-border); white-space: nowrap; }
.el-table td { padding: 12px 14px; border-bottom: 1px solid var(--color-border); color: var(--color-text); font-size: 13px; }
.el-table tbody tr { transition: background 0.2s; }
.el-table tbody tr:hover { background: var(--color-surface-container-low); }
.el-table input, .el-table select { width: 100%; padding: 6px 8px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 12px; background: var(--color-surface-container-lowest); color: var(--color-text); }
.el-table input:focus, .el-table select:focus { outline: none; border-color: var(--color-primary); }
.el-amount-th { text-align: right; }
.el-amount { text-align: right; font-weight: 700; font-family: var(--font-display); }
.el-amount-negative { color: var(--color-danger); }
.el-name { font-weight: 600; }
.el-date { color: var(--color-text-muted); }
.el-cat-badge { padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap; display: inline-block; background: var(--color-surface-container-high); color: var(--color-on-surface-variant); }
.el-no-data { text-align: center; padding: 40px !important; color: var(--color-text-muted); }

/* Actions */
.el-actions { display: flex; gap: 4px; }
.el-icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface-container-lowest); cursor: pointer; transition: all 0.2s; color: var(--color-text-muted); }
.el-icon-btn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-fixed); }
.el-icon-btn-danger:hover { border-color: var(--color-danger); color: var(--color-danger); background: var(--color-error-container); }
.el-icon-btn .material-symbols-outlined { font-size: 16px; }

/* Chart Card */
.el-chart-card { padding: 20px; }
.el-chart-card h4 { font-family: var(--font-display); font-size: 15px; color: var(--color-text); margin: 0 0 16px; }
.el-donut-wrap { display: flex; justify-content: center; margin-bottom: 16px; }
.el-legend { display: flex; flex-direction: column; gap: 8px; }
.el-legend-item { display: flex; align-items: center; gap: 8px; }
.el-legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.el-legend-label { font-size: 12px; color: var(--color-text-muted); flex: 1; }
.el-legend-pct { font-size: 12px; font-weight: 700; color: var(--color-text); }

/* Cost Analysis Card */
.el-cost-card { background: var(--color-tertiary-container); border-radius: var(--radius-lg); padding: 22px; position: relative; overflow: hidden; border: 1px solid rgba(0,0,0,0.08); }
.el-cost-content { position: relative; z-index: 1; }
.el-cost-card h4 { font-family: var(--font-display); font-size: 15px; color: var(--color-on-tertiary); margin: 8px 0 6px; }
.el-cost-card p { font-size: 12px; color: rgba(255,255,255,0.75); line-height: 1.5; margin: 0; }
.el-cost-shape { position: absolute; bottom: -20px; right: -20px; width: 80px; height: 80px; border-radius: 50%; background: var(--color-tertiary-fixed); opacity: 0.3; }

@media (max-width: 1023px) {
  .el-grid { grid-template-columns: 1fr; }
}
@media (max-width: 767px) {
  .el-wrapper { padding: 16px; }
  .el-header { flex-direction: column; }
  .el-heading { font-size: 22px; }
  .el-filter-row { flex-direction: column; align-items: stretch; }
  .el-filter-group { min-width: auto; }
}
`

ExpenseList.propTypes = {
  expenses: PropTypes.array.isRequired,
  onUpdateExpense: PropTypes.func.isRequired,
  onDeleteExpense: PropTypes.func.isRequired,
  onAddExpense: PropTypes.func,
}

export default ExpenseList
