import { useState, useMemo } from "react"
import PropTypes from "prop-types"
import toast from "react-hot-toast"
import PieChart from "./PieChart"
import Pagination from "./Pagination"
import { exportToCSV } from "../utils/exportData"
import { useTranslation } from "../i18n/i18n"

const ITEMS_PER_PAGE = 10

const ExpenseList = ({ expenses, onUpdateExpense, onDeleteExpense }) => {
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
      const matchesMonth = expenseMonth === monthFilter
      const matchesSearch =
        expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesMonth && matchesSearch
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
    if (!editForm.name?.trim()) { toast.error("Name cannot be empty"); return }
    if (!editForm.amount || isNaN(Number.parseFloat(editForm.amount)) || Number.parseFloat(editForm.amount) <= 0) { toast.error("Amount must be a valid positive number"); return }
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
    <div className="list-container">
      <div className="list-header">
        <h2>{t("nav.expenseList")}</h2>
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
          <h3>Total: ₹{totalAmount.toLocaleString()} ({filteredExpenses.length} items)</h3>
        </div>
        <button className="btn-secondary" onClick={() => exportToCSV(filteredExpenses, "expenses.csv")}>{t("dashboard.exportCSV")}</button>
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
                {paginatedExpenses.map((expense) => (
                  <tr key={expense._id}>
                    {editingId === expense._id ? (
                      <>
                        <td><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                        <td><input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} /></td>
                        <td>
                          <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                            {expenseCategories.map((category) => (
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
                        <td>{expense.name}</td>
                        <td>{new Date(expense.date).toISOString().split("T")[0]}</td>
                        <td>{expense.category}</td>
                        <td className="amount negative">₹{expense.amount.toLocaleString()}</td>
                        <td>
                          <button className="btn-edit" onClick={() => handleEdit(expense)}>{t("form.edit")}</button>
                          <button className="btn-delete" onClick={() => handleDelete(expense._id)}>{t("form.delete")}</button>
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
            <h3>{t("nav.expenses")} {t("form.category")}</h3>
            {categoryData.length > 0 ? <PieChart data={categoryData} /> : <p className="no-data">{t("general.noData")}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

ExpenseList.propTypes = {
  expenses: PropTypes.array.isRequired,
  onUpdateExpense: PropTypes.func.isRequired,
  onDeleteExpense: PropTypes.func.isRequired,
}

export default ExpenseList
