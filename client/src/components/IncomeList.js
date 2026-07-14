import { useState, useMemo } from "react"
import PropTypes from "prop-types"
import toast from "react-hot-toast"
import PieChart from "./PieChart"
import Pagination from "./Pagination"
import { exportToCSV } from "../utils/exportData"
import { useTranslation } from "../i18n/i18n"

const ITEMS_PER_PAGE = 10

const IncomeList = ({ incomes, onUpdateIncome, onDeleteIncome }) => {
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
      const matchesMonth = incomeMonth === monthFilter
      const matchesSearch =
        income.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        income.category.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesMonth && matchesSearch
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
    }))
  }, [filteredIncomes])

  const handleEdit = (income) => {
    setEditingId(income._id)
    setEditForm({ ...income, date: new Date(income.date).toISOString().split("T")[0] })
  }

  const handleSaveEdit = async () => {
    if (!editForm.name?.trim()) { toast.error("Name cannot be empty"); return }
    if (!editForm.amount || isNaN(Number.parseFloat(editForm.amount)) || Number.parseFloat(editForm.amount) <= 0) { toast.error("Amount must be a valid positive number"); return }
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
    <div className="list-container">
      <div className="list-header">
        <h2>{t("nav.incomeList")}</h2>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>{t("form.filterMonth")}:</label>
          <input type="month" value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1) }} />
        </div>
        <div className="filter-group">
          <label>{t("form.search")}:</label>
          <input type="text" placeholder={t("form.search") + "..."} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} />
        </div>
        <div className="filter-group">
          <h3>Total: ₹{totalAmount.toLocaleString()} ({filteredIncomes.length} items)</h3>
        </div>
        <button className="btn-secondary" onClick={() => exportToCSV(filteredIncomes, "incomes.csv")}>{t("dashboard.exportCSV")}</button>
      </div>

      <div className="list-content">
        <div className="list-left">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("form.name")}</th><th>{t("form.date")}</th><th>{t("form.category")}</th><th>{t("form.amount")}</th><th>Actions</th>
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
                            {incomeCategories.map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </td>
                        <td><input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></td>
                        <td>
                          <button className="btn-save" onClick={handleSaveEdit}>{t("form.save")}</button>
                          <button className="btn-cancel" onClick={handleCancelEdit}>{t("form.cancel")}</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{income.name}</td>
                        <td>{new Date(income.date).toISOString().split("T")[0]}</td>
                        <td>{income.category}</td>
                        <td className="amount positive">₹{income.amount.toLocaleString()}</td>
                        <td>
                          <button className="btn-edit" onClick={() => handleEdit(income)}>{t("form.edit")}</button>
                          <button className="btn-delete" onClick={() => handleDelete(income._id)}>{t("form.delete")}</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
        <div className="list-right">
          <div className="chart-container">
            <h3>{t("nav.income")} {t("form.category")}</h3>
            {categoryData.length > 0 ? <PieChart data={categoryData} /> : <p className="no-data">{t("general.noData")}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

IncomeList.propTypes = {
  incomes: PropTypes.array.isRequired,
  onUpdateIncome: PropTypes.func.isRequired,
  onDeleteIncome: PropTypes.func.isRequired,
}

export default IncomeList
