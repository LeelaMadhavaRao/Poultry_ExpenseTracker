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
      <text x="60" y="74" textAnchor="middle" fill="var(--color-success)" fontSize="12" fontWeight="700" fontFamily="var(--font-display)">₹{total.toLocaleString()}</text>
    </svg>
  )
}

DonutChart.propTypes = {
  data: PropTypes.array.isRequired,
}

const IncomeList = ({ incomes, onUpdateIncome, onDeleteIncome, onAddIncome }) => {
  const { t } = useTranslation()
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7))
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  const incomeCategories = ["Eggs Load", "Eggs Local", "Birds Sale", "Feces Sale", "Other"]

  const filteredIncomes = useMemo(() => {
    return incomes.filter((income) => {
      const incomeMonth = new Date(income.date).toISOString().slice(0, 7)
      return incomeMonth === monthFilter
        && (income.name.toLowerCase().includes(searchTerm.toLowerCase())
        || income.category.toLowerCase().includes(searchTerm.toLowerCase()))
    })
  }, [incomes, monthFilter, searchTerm])

  const totalPages = Math.ceil(filteredIncomes.length / ITEMS_PER_PAGE)
  const paginatedIncomes = filteredIncomes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const totalAmount = filteredIncomes.reduce((acc, income) => acc + income.amount, 0)

  const categoryData = useMemo(() => {
    const categoryTotals = {}
    filteredIncomes.forEach((income) => {
      categoryTotals[income.category] = (categoryTotals[income.category] || 0) + income.amount
    })
    const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336"]
    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      name: category, value: amount, color: colors[index % colors.length],
    })).sort((a, b) => b.value - a.value)
  }, [filteredIncomes])

  const handleEdit = (income) => {
    setEditingId(income._id)
    setEditForm({ ...income, date: new Date(income.date).toISOString().split("T")[0] })
  }

  const handleSaveEdit = async () => {
    if (!editForm.name?.trim()) { toast.error("Name cannot be empty"); return }
    if (!editForm.amount || isNaN(Number.parseFloat(editForm.amount)) || Number.parseFloat(editForm.amount) <= 0) { toast.error("Amount must be valid"); return }
    await onUpdateIncome(editingId, { ...editForm, amount: Number.parseFloat(editForm.amount) })
    setEditingId(null)
    setEditForm({})
  }

  const handleCancelEdit = () => { setEditingId(null); setEditForm({}) }

  const handleDelete = async (id) => {
    if (window.confirm(t("general.confirmDelete"))) {
      await onDeleteIncome(id)
    }
  }

  return (
    <div className="il-wrapper">
      {/* Header */}
      <div className="il-header">
        <div>
          <h2 className="il-heading">Financial Income</h2>
          <p className="il-subtitle">Track egg sales, bird sales & farm revenue</p>
        </div>
        {onAddIncome && (
          <button className="btn-primary" onClick={onAddIncome} style={{ whiteSpace: "nowrap" }}>
            + Add New Income
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="il-grid">
        {/* Left Column */}
        <div className="il-left">
          {/* Filter Row */}
          <div className="il-filter-row glass-card">
            <div className="il-filter-group">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                className="il-search-input"
              />
            </div>
            <div className="il-filter-group">
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1) }}
                className="il-month-input"
              />
            </div>
            <div className="il-filter-total">
              ₹{totalAmount.toLocaleString()} <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>({filteredIncomes.length} items)</span>
            </div>
            <button className="btn-secondary" onClick={() => exportToCSV(filteredIncomes, "incomes.csv")} style={{ height: 42, padding: "0 18px", fontSize: 13 }}>
              Export
            </button>
          </div>

          {/* Data Table */}
          <div className="il-table-wrap glass-card">
            <table className="il-table">
              <thead>
                <tr>
                  <th>{t("form.name")}</th>
                  <th>{t("form.date")}</th>
                  <th>{t("form.category")}</th>
                  <th className="il-amount-th">{t("form.amount")}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedIncomes.map((income) => (
                  <tr key={income._id}>
                    {editingId === income._id ? (
                      <>
                        <td><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                        <td><input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} /></td>
                        <td>
                          <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                            {incomeCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </td>
                        <td><input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></td>
                        <td>
                          <div className="il-actions">
                            <button className="btn-save" onClick={handleSaveEdit}>{t("form.save")}</button>
                            <button className="btn-cancel" onClick={handleCancelEdit}>{t("form.cancel")}</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="il-name">{income.name}</td>
                        <td className="il-date">{new Date(income.date).toISOString().split("T")[0]}</td>
                        <td><span className="il-cat-badge" style={{ background: getCatBg(income.category) }}>{income.category}</span></td>
                        <td className="il-amount il-amount-positive">₹{income.amount.toLocaleString()}</td>
                        <td>
                          <div className="il-actions">
                            <button className="il-icon-btn" title="Edit" onClick={() => handleEdit(income)}>
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button className="il-icon-btn il-icon-btn-danger" title="Delete" onClick={() => handleDelete(income._id)}>
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {paginatedIncomes.length === 0 && (
                  <tr><td colSpan={5} className="il-no-data">{t("general.noData")}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>

        {/* Right Column */}
        <div className="il-right">
          {/* Donut Chart Card */}
          <div className="il-chart-card glass-card">
            <h4>Income by Category</h4>
            <div className="il-donut-wrap">
              <DonutChart data={categoryData} />
            </div>
            <div className="il-legend">
              {categoryData.slice(0, 5).map((item, i) => {
                const pct = totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(0) : 0
                return (
                  <div key={i} className="il-legend-item">
                    <span className="il-legend-dot" style={{ background: item.color }} />
                    <span className="il-legend-label">{item.name}</span>
                    <span className="il-legend-pct">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Revenue Projection Card */}
          <div className="il-projection-card">
            <div className="il-projection-content">
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--color-accent)" }}>trending_up</span>
              <h4>Revenue Projection</h4>
              <p>Based on current trends, your estimated revenue for this season looks positive.</p>
            </div>
            <div className="il-projection-shape" />
          </div>
        </div>
      </div>

      <style>{ilCSS}</style>
    </div>
  )
}

const getCatBg = (cat) => {
  const map = { "Eggs Load": "#e8f5e9", "Eggs Local": "#e3f2fd", "Birds Sale": "#fff3e0", "Feces Sale": "#f3e5f5", "Other": "#fce4ec" }
  return map[cat] || "var(--color-bg)"
}

const ilCSS = `
.il-wrapper { padding: 24px; max-width: 1200px; margin: 0 auto; }
.il-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.il-heading { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--color-text); margin: 0; }
.il-subtitle { font-size: 14px; color: var(--color-text-muted); margin: 4px 0 0; }

.il-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: start; }
.il-left { display: flex; flex-direction: column; gap: 16px; }
.il-right { display: flex; flex-direction: column; gap: 16px; }

/* Filter Row */
.il-filter-row { display: flex; align-items: center; gap: 12px; padding: 14px 18px; flex-wrap: wrap; }
.il-filter-group { flex: 1; min-width: 140px; }
.il-search-input, .il-month-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 13px; font-family: var(--font-body); background: var(--color-surface-container-lowest); color: var(--color-text); height: 42px; }
.il-search-input:focus, .il-month-input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(0,54,26,0.1); }
.il-filter-total { font-size: 14px; font-weight: 700; font-family: var(--font-display); color: var(--color-success); white-space: nowrap; }

/* Table */
.il-table-wrap { padding: 4px; }
.il-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.il-table th { padding: 12px 14px; text-align: left; font-weight: 600; color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; background: var(--color-bg); border-bottom: 2px solid var(--color-border); white-space: nowrap; }
.il-table td { padding: 12px 14px; border-bottom: 1px solid var(--color-border); color: var(--color-text); font-size: 13px; }
.il-table tbody tr { transition: background 0.2s; }
.il-table tbody tr:hover { background: var(--color-surface-container-low); }
.il-table input, .il-table select { width: 100%; padding: 6px 8px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 12px; background: var(--color-surface-container-lowest); color: var(--color-text); }
.il-table input:focus, .il-table select:focus { outline: none; border-color: var(--color-primary); }
.il-amount-th { text-align: right; }
.il-amount { text-align: right; font-weight: 700; font-family: var(--font-display); }
.il-amount-positive { color: var(--color-success); }
.il-name { font-weight: 600; }
.il-date { color: var(--color-text-muted); }
.il-cat-badge { padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap; display: inline-block; }
.il-no-data { text-align: center; padding: 40px !important; color: var(--color-text-muted); }

/* Actions */
.il-actions { display: flex; gap: 4px; }
.il-icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface-container-lowest); cursor: pointer; transition: all 0.2s; color: var(--color-text-muted); }
.il-icon-btn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-fixed); }
.il-icon-btn-danger:hover { border-color: var(--color-danger); color: var(--color-danger); background: var(--color-error-container); }
.il-icon-btn .material-symbols-outlined { font-size: 16px; }

/* Chart Card */
.il-chart-card { padding: 20px; }
.il-chart-card h4 { font-family: var(--font-display); font-size: 15px; color: var(--color-text); margin: 0 0 16px; }
.il-donut-wrap { display: flex; justify-content: center; margin-bottom: 16px; }
.il-legend { display: flex; flex-direction: column; gap: 8px; }
.il-legend-item { display: flex; align-items: center; gap: 8px; }
.il-legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.il-legend-label { font-size: 12px; color: var(--color-text-muted); flex: 1; }
.il-legend-pct { font-size: 12px; font-weight: 700; color: var(--color-text); }

/* Projection Card */
.il-projection-card { background: var(--color-primary-container); border-radius: var(--radius-lg); padding: 22px; position: relative; overflow: hidden; border: 1px solid rgba(0,54,26,0.08); }
.il-projection-content { position: relative; z-index: 1; }
.il-projection-card h4 { font-family: var(--font-display); font-size: 15px; color: var(--color-text); margin: 8px 0 6px; }
.il-projection-card p { font-size: 12px; color: var(--color-text-muted); line-height: 1.5; margin: 0; }
.il-projection-shape { position: absolute; bottom: -20px; right: -20px; width: 80px; height: 80px; border-radius: 50%; background: var(--color-primary-fixed); opacity: 0.5; }

@media (max-width: 1023px) {
  .il-grid { grid-template-columns: 1fr; }
}
@media (max-width: 767px) {
  .il-wrapper { padding: 16px; }
  .il-header { flex-direction: column; }
  .il-heading { font-size: 22px; }
  .il-filter-row { flex-direction: column; align-items: stretch; }
  .il-filter-group { min-width: auto; }
}
`

IncomeList.propTypes = {
  incomes: PropTypes.array.isRequired,
  onUpdateIncome: PropTypes.func.isRequired,
  onDeleteIncome: PropTypes.func.isRequired,
  onAddIncome: PropTypes.func,
}

export default IncomeList
