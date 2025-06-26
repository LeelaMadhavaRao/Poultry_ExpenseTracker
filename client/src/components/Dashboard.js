"use client"

import { useState, useMemo, useEffect } from "react"
import PieChart from "./PieChart"

const Dashboard = ({ incomes, expenses, currentSeason, allSeasons, onEndSeason, onSelectSeason }) => {
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    if (currentSeason) {
      setDateFilter({
        startDate: new Date(currentSeason.startDate).toISOString().split("T")[0],
        endDate: currentSeason.endDate ? new Date(currentSeason.endDate).toISOString().split("T")[0] : "",
      })
      console.log("Updated dateFilter:", {
        startDate: new Date(currentSeason.startDate).toISOString().split("T")[0],
        endDate: currentSeason.endDate ? new Date(currentSeason.endDate).toISOString().split("T")[0] : "null",
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

    console.log("Filtered data:", { totalIncome, totalExpense, balance, allTransactions })
    return {
      totalIncome,
      totalExpense,
      balance,
      allTransactions,
      minIncome,
      maxIncome,
      minExpense,
      maxExpense,
    }
  }, [incomes, expenses, dateFilter])

  const pieChartData = [
    { name: "Income", value: filteredData.totalIncome, color: "#4CAF50" },
    { name: "Expenses", value: filteredData.totalExpense, color: "#F44336" },
  ]

  const handleDateFilterChange = (e) => {
    setDateFilter({
      ...dateFilter,
      [e.target.name]: e.target.value,
    })
  }

  const handleSeasonChange = (e) => {
    onSelectSeason(e.target.value)
  }

  if (!currentSeason) {
    return <div>Loading...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="season-info">
          <span className="season-name">Season: {currentSeason.name}</span>
          <span className={`season-status ${currentSeason.isActive ? "active" : "inactive"}`}>
            {currentSeason.isActive ? "Active" : "Ended"}
          </span>
        </div>
      </div>

      <div className="date-filter">
        <div className="filter-group">
          <label>From Date:</label>
          <input type="date" name="startDate" value={dateFilter.startDate} onChange={handleDateFilterChange} />
        </div>
        <div className="filter-group">
          <label>To Date:</label>
          <input type="date" name="endDate" value={dateFilter.endDate} onChange={handleDateFilterChange} />
        </div>
        <div className="filter-group">
          <label>Select Season:</label>
          <select value={currentSeason._id} onChange={handleSeasonChange}>
            {allSeasons.map((season) => (
              <option key={season._id} value={season._id}>
                {season.name} ({season.isActive ? "Active" : "Ended"})
              </option>
            ))}
          </select>
        </div>
        {currentSeason.isActive && (
          <button className="btn-danger" onClick={onEndSeason}>
            End Season
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-left">
          <div className="pie-chart-container">
            <h3>Income vs Expenses</h3>
            <PieChart data={pieChartData} />
          </div>
          <div className="summary-cards">
            <div className="stat-card">
              <h4>Total Income</h4>
              <span className="stat-value positive">₹{filteredData.totalIncome.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <h4>Total Expenses</h4>
              <span className="stat-value negative">₹{filteredData.totalExpense.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <h4>Balance</h4>
              <span className="stat-value">₹{filteredData.balance.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="dashboard-right">
          <div className="recent-transactions">
            <h3>Recent Transactions</h3>
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

          <div className="stats-grid">
            <div className="stat-card">
              <h4>Min Income</h4>
              <span className="stat-value positive">₹{filteredData.minIncome.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <h4>Max Income</h4>
              <span className="stat-value positive">₹{filteredData.maxIncome.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <h4>Min Expense</h4>
              <span className="stat-value negative">₹{filteredData.minExpense.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <h4>Max Expense</h4>
              <span className="stat-value negative">₹{filteredData.maxExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard