"use client"

import { useState } from "react"

const Sidebar = ({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) => {
  const [incomeExpanded, setIncomeExpanded] = useState(false)
  const [expenseExpanded, setExpenseExpanded] = useState(false)

  const menuItems = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    {
      id: "income",
      label: "Income",
      icon: "💰",
      submenu: [
        { id: "income", label: "Add Income" }, // Changed from "income-form" to "income"
        { id: "income-list", label: "Income List" },
      ],
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: "💸",
      submenu: [
        { id: "expense", label: "Add Expense" }, // Changed from "expense-form" to "expense"
        { id: "expense-list", label: "Expense List" },
      ],
    },
  ]

  const handleMenuClick = (itemId) => {
    if (itemId === "income") {
      setIncomeExpanded(!incomeExpanded)
    } else if (itemId === "expenses") {
      setExpenseExpanded(!expenseExpanded)
    } else {
      setCurrentPage(itemId)
      setSidebarOpen(false) // Close sidebar on mobile after selection
    }
  }

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h3>🐔 Farm Tracker</h3>
        <button className="close-btn desktop-hidden" onClick={() => setSidebarOpen(false)}>
          ✕
        </button>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="nav-item">
            <button
              className={`nav-link ${currentPage === item.id ? "active" : ""}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.submenu && (
                <span className="nav-arrow">
                  {(item.id === "income" && incomeExpanded) || (item.id === "expenses" && expenseExpanded) ? "▼" : "▶"}
                </span>
              )}
            </button>
            {item.submenu && (
              <div
                className={`submenu ${
                  (item.id === "income" && incomeExpanded) || (item.id === "expenses" && expenseExpanded)
                    ? "expanded"
                    : ""
                }`}
              >
                {item.submenu.map((subItem) => (
                  <button
                    key={subItem.id}
                    className={`submenu-link ${currentPage === subItem.id ? "active" : ""}`}
                    onClick={() => {
                      setCurrentPage(subItem.id)
                      setSidebarOpen(false)
                    }}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar