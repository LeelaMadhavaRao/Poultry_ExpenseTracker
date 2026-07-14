import { useState, useMemo, useEffect } from "react"
import PropTypes from "prop-types"
import PieChart from "./PieChart"
import Charts from "./Charts"
import AnimatedNumber from "./common/AnimatedNumber"
import DashboardCards from "./DashboardCards"
import { exportToCSV, generateSeasonPDF } from "../utils/exportData"
import { useTranslation } from "../i18n/i18n"

const Dashboard = ({ incomes, expenses, currentSeason, allSeasons, onEndSeason, onSelectSeason }) => {
  const { t } = useTranslation()
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" })
  const [chartType, setChartType] = useState("bar")

  useEffect(() => {
    if (currentSeason) {
      setDateFilter({
        startDate: new Date(currentSeason.startDate).toISOString().split("T")[0],
        endDate: currentSeason.endDate ? new Date(currentSeason.endDate).toISOString().split("T")[0] : "",
      })
    }
  }, [currentSeason])

  const filteredData = useMemo(() => {
    const filterByDate = (items) => {
      if (!dateFilter.startDate || !dateFilter.endDate) return items
      return items.filter((item) => {
        const itemDate = new Date(item.date)
        const start = new Date(dateFilter.startDate)
        const end = new Date(dateFilter.endDate)
        return itemDate >= start && itemDate <= end
      })
    }

    const filteredIncomes = filterByDate(incomes)
    const filteredExpenses = filterByDate(expenses)

    const totalIncome = filteredIncomes.reduce((sum, item) => sum + item.amount, 0)
    const totalExpense = filteredExpenses.reduce((sum, item) => sum + item.amount, 0)
    const balance = totalIncome - totalExpense
    const profitMargin = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0"

    const allTransactions = [
      ...filteredIncomes.map((item) => ({ ...item, type: "income" })),
      ...filteredExpenses.map((item) => ({ ...item, type: "expense" })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)

    const minIncome = filteredIncomes.length > 0 ? Math.min(...filteredIncomes.map((i) => i.amount)) : 0
    const maxIncome = filteredIncomes.length > 0 ? Math.max(...filteredIncomes.map((i) => i.amount)) : 0
    const minExpense = filteredExpenses.length > 0 ? Math.min(...filteredExpenses.map((e) => e.amount)) : 0
    const maxExpense = filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map((e) => e.amount)) : 0

    return {
      totalIncome,
      totalExpense,
      balance,
      profitMargin,
      allTransactions,
      minIncome,
      maxIncome,
      minExpense,
      maxExpense,
      filteredIncomes,
      filteredExpenses,
    }
  }, [incomes, expenses, dateFilter])

  const pieChartData = [
    { name: t("nav.income"), value: filteredData.totalIncome, color: "#4CAF50" },
    { name: t("nav.expenses"), value: filteredData.totalExpense, color: "#F44336" },
  ]

  const handleDateFilterChange = (e) => {
    setDateFilter({ ...dateFilter, [e.target.name]: e.target.value })
  }

  const handleSeasonChange = (e) => {
    onSelectSeason(e.target.value)
  }

  const handleExportCSV = () => {
    const allData = [
      ...filteredData.filteredIncomes.map((i) => ({ ...i, type: "income" })),
      ...filteredData.filteredExpenses.map((e) => ({ ...e, type: "expense" })),
    ]
    exportToCSV(allData, `poultry-report-${currentSeason?.name || "export"}.csv`)
  }

  const handleExportPDF = () => {
    generateSeasonPDF({
      season: currentSeason,
      incomes: filteredData.filteredIncomes,
      expenses: filteredData.filteredExpenses,
      totals: {
        totalIncome: filteredData.totalIncome,
        totalExpense: filteredData.totalExpense,
        balance: filteredData.balance,
        profitMargin: filteredData.profitMargin,
      },
    })
  }

  if (!currentSeason) {
    return <div className="loading-container"><div className="spinner" /><p>{t("general.loading")}</p></div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{t("dashboard.title")}</h1>
        <div className="season-info">
          <span className="season-name">{t("dashboard.season")}: {currentSeason.name}</span>
          <span className={`season-status ${currentSeason.isActive ? "active" : "inactive"}`}>
            {currentSeason.isActive ? t("dashboard.active") : t("dashboard.ended")}
          </span>
        </div>
      </div>

      <div className="date-filter">
        <div className="filter-group">
          <label>{t("dashboard.fromDate")}:</label>
          <input type="date" name="startDate" value={dateFilter.startDate} onChange={handleDateFilterChange} />
        </div>
        <div className="filter-group">
          <label>{t("dashboard.toDate")}:</label>
          <input type="date" name="endDate" value={dateFilter.endDate} onChange={handleDateFilterChange} />
        </div>
        <div className="filter-group">
          <label>{t("dashboard.selectSeason")}:</label>
          <select value={currentSeason._id} onChange={handleSeasonChange}>
            {allSeasons.map((season) => (
              <option key={season._id} value={season._id}>
                {season.name} ({season.isActive ? t("dashboard.active") : t("dashboard.ended")})
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group export-btns">
          <button className="btn-secondary" onClick={handleExportCSV}>{t("dashboard.exportCSV")}</button>
          <button className="btn-secondary" onClick={handleExportPDF}>{t("dashboard.printReport")}</button>
        </div>
        {currentSeason.isActive && (
          <button className="btn-danger" onClick={onEndSeason}>{t("dashboard.endSeason")}</button>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-left">
          <DashboardCards seasonId={currentSeason?._id} />
          <div className="pie-chart-container" style={{ marginTop: 20 }}>
            <h3>{t("dashboard.incomeVsExpenses")}</h3>
            <PieChart data={pieChartData} />
          </div>
          <div className="summary-cards">
            <div className="stat-card fade-in">
              <h4>{t("dashboard.totalIncome")}</h4>
              <span className="stat-value positive"><AnimatedNumber value={filteredData.totalIncome} /></span>
            </div>
            <div className="stat-card fade-in stagger-1">
              <h4>{t("dashboard.totalExpenses")}</h4>
              <span className="stat-value negative"><AnimatedNumber value={filteredData.totalExpense} /></span>
            </div>
            <div className="stat-card fade-in stagger-2">
              <h4>{t("dashboard.balance")}</h4>
              <span className={`stat-value ${filteredData.balance >= 0 ? "positive" : "negative"}`}>
                <AnimatedNumber value={filteredData.balance} />
              </span>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>{t("dashboard.minIncome")}</h4>
              <span className="stat-value positive">₹{filteredData.minIncome.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <h4>{t("dashboard.maxIncome")}</h4>
              <span className="stat-value positive">₹{filteredData.maxIncome.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <h4>{t("dashboard.minExpense")}</h4>
              <span className="stat-value negative">₹{filteredData.minExpense.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <h4>{t("dashboard.maxExpense")}</h4>
              <span className="stat-value negative">₹{filteredData.maxExpense.toLocaleString()}</span>
            </div>
            <div className="stat-card" style={{ gridColumn: "1 / -1" }}>
              <h4>{t("dashboard.profitMargin")}</h4>
              <span className={`stat-value ${filteredData.balance >= 0 ? "positive" : "negative"}`}>
                {filteredData.profitMargin}%
              </span>
            </div>
          </div>
        </div>
        <div className="dashboard-right">
          <div className="recent-transactions">
            <h3>{t("dashboard.recentTransactions")}</h3>
            <div className="transaction-list">
              {filteredData.allTransactions.map((transaction, index) => (
                <div key={index} className={`transaction-item ${transaction.type}`}>
                  <div className="transaction-info">
                    <span className="transaction-name">{transaction.name}</span>
                    <span className="transaction-category">{transaction.category}</span>
                  </div>
                  <div className="transaction-details">
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                    </span>
                    <span className="transaction-date">{new Date(transaction.date).toISOString().split("T")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(incomes.length > 0 || expenses.length > 0) && (
            <div className="chart-section">
              <div className="chart-header">
                <h3>Monthly Trends</h3>
                <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="chart-type-select">
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="area">Area</option>
                </select>
              </div>
              <Charts incomes={incomes} expenses={expenses} type={chartType} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

Dashboard.propTypes = {
  incomes: PropTypes.array.isRequired,
  expenses: PropTypes.array.isRequired,
  currentSeason: PropTypes.object,
  allSeasons: PropTypes.array.isRequired,
  onEndSeason: PropTypes.func.isRequired,
  onSelectSeason: PropTypes.func.isRequired,
}

export default Dashboard
