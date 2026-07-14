import { useState } from "react"
import { useTranslation } from "../i18n/i18n"

const Sidebar = ({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) => {
  const { t } = useTranslation()
  const [incomeExpanded, setIncomeExpanded] = useState(false)
  const [expenseExpanded, setExpenseExpanded] = useState(false)
  const [darkMode, setDarkMode] = useState(() => document.documentElement.getAttribute("data-theme") === "dark")

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light")
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  const menuItems = [
    { id: "profile", label: t("nav.profile"), icon: "👤" },
    { id: "dashboard", label: t("nav.dashboard"), icon: "📊" },
    { id: "birds", label: t("nav.birdTracker"), icon: "🐔" },
    { id: "feed", label: t("nav.feedTracker"), icon: "🌾" },
    { id: "farms", label: t("nav.myFarms"), icon: "🏠" },
    { id: "reminders", label: t("nav.reminders"), icon: "🔔" },
    { id: "comparison", label: t("nav.compareSeasons"), icon: "⚖️" },
    { id: "budget", label: t("nav.budgetTracker"), icon: "🎯" },
    {
      id: "income",
      label: t("nav.income"),
      icon: "💰",
      submenu: [
        { id: "income", label: t("nav.addIncome") },
        { id: "income-list", label: t("nav.incomeList") },
      ],
    },
    {
      id: "expenses",
      label: t("nav.expenses"),
      icon: "💸",
      submenu: [
        { id: "expense", label: t("nav.addExpense") },
        { id: "expense-list", label: t("nav.expenseList") },
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
      setSidebarOpen(false)
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
      <div className="sidebar-footer">
        <button className="nav-link theme-toggle" onClick={toggleDarkMode}>
          <span className="nav-icon">{darkMode ? "☀️" : "🌙"}</span>
          <span className="nav-label">{darkMode ? t("nav.lightMode") : t("nav.themeToggle")}</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
