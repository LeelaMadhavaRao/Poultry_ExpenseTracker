import { useState, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import axios from "axios"
import api from "./components/Api/api"
import useAuth from "./hooks/useAuth"
import useSeason from "./hooks/useSeason"
import useFinances from "./hooks/useFinances"
import "./App.css"
import Login from "./components/Login"
import Signup from "./components/Signup"
import Home from "./components/Home"
import ForgotPassword from "./components/ForgotPassword"
import ResetPassword from "./components/ResetPassword"
import Dashboard from "./components/Dashboard"
import Sidebar from "./components/Sidebar"
import Profile from "./components/Profile"
import IncomeForm from "./components/IncomeForm"
import IncomeList from "./components/IncomeList"
import ExpenseForm from "./components/ExpenseForm"
import ExpenseList from "./components/ExpenseList"
import SeasonComparison from "./components/SeasonComparison"
import BudgetComparison from "./components/BudgetComparison"
import LanguageSwitcher from "./components/LanguageSwitcher"
import HelpGuide from "./components/HelpGuide"
import Loading from "./components/common/Loading"

function App() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading, login, signup, logout } = useAuth()
  const {
    currentSeason,
    allSeasons,
    showSeasonForm,
    seasonFormData,
    setSeasonFormData,
    fetchSeason,
    fetchAllSeasons,
    createSeason,
    endSeason,
    selectSeason,
  } = useSeason()
  const {
    incomes,
    expenses,
    fetchIncomes,
    fetchExpenses,
    addIncome,
    addExpense,
    updateIncome,
    updateExpense,
    deleteIncome,
    deleteExpense,
    clearFinances,
  } = useFinances()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchSeason().then((season) => {
        if (season?._id) {
          Promise.all([fetchIncomes(season._id), fetchExpenses(season._id)])
        }
      })
      fetchAllSeasons()
    }
  }, [isAuthenticated, fetchSeason, fetchAllSeasons, fetchIncomes, fetchExpenses])

  const handleLogin = async (credentials) => {
    await login(credentials)
    navigate("/dashboard", { replace: true })
  }

  const handleSignup = async (userData) => {
    await signup(userData)
    navigate("/dashboard", { replace: true })
  }

  const handleSelectSeason = async (seasonId) => {
    const season = await selectSeason(seasonId)
    if (season) {
      await Promise.all([fetchIncomes(season._id), fetchExpenses(season._id)])
      setCurrentPage("dashboard")
    }
  }

  const handleCreateSeason = async (e) => {
    e.preventDefault()
    await createSeason({ name: seasonFormData.name, startDate: seasonFormData.startDate })
    const season = await fetchSeason()
    if (season?._id) {
      await Promise.all([fetchIncomes(season._id), fetchExpenses(season._id)])
    }
    await fetchAllSeasons()
    setCurrentPage("dashboard")
  }

  const handleEndSeason = async () => {
    if (!currentSeason?._id) return
    await endSeason(currentSeason._id)
    clearFinances()
  }

  const handleAddIncome = async (income) => {
    await addIncome({ ...income, seasonId: currentSeason._id })
  }

  const handleAddExpense = async (expense) => {
    await addExpense({ ...expense, seasonId: currentSeason._id })
  }

  if (authLoading) {
    return <Loading fullPage message="Loading application..." />
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <div className="auth-container">
              <Login onLogin={handleLogin} onSwitchToSignup={() => navigate("/signup")} />
            </div>
          }
        />
        <Route
          path="/signup"
          element={
            <div className="auth-container">
              <Signup onSignup={handleSignup} onSwitchToLogin={() => navigate("/login")} />
            </div>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  if (showSeasonForm) {
    return (
      <div className="form-container">
        <div className="form-header">
          <h2>Create New Season</h2>
          <p>Set up a season to start tracking your farm finances</p>
        </div>
        <form onSubmit={handleCreateSeason} className="season-form">
          <div className="form-group">
            <label htmlFor="name">Season Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={seasonFormData.name}
              onChange={(e) => setSeasonFormData({ ...seasonFormData, name: e.target.value })}
              placeholder="e.g., Summer Batch 2026"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={seasonFormData.startDate}
              onChange={(e) => setSeasonFormData({ ...seasonFormData, startDate: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Create Season
          </button>
        </form>
      </div>
    )
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            incomes={incomes}
            expenses={expenses}
            currentSeason={currentSeason}
            allSeasons={allSeasons}
            onEndSeason={handleEndSeason}
            onSelectSeason={handleSelectSeason}
          />
        )
      case "profile":
        return <Profile onLogout={logout} />
      case "income":
        return <IncomeForm onAddIncome={handleAddIncome} />
      case "income-list":
        return <IncomeList incomes={incomes} onUpdateIncome={updateIncome} onDeleteIncome={deleteIncome} />
      case "expense":
        return <ExpenseForm onAddExpense={handleAddExpense} />
      case "expense-list":
        return <ExpenseList expenses={expenses} onUpdateExpense={updateExpense} onDeleteExpense={deleteExpense} />
      case "budget":
        return <BudgetComparison seasonId={currentSeason?._id} seasonName={currentSeason?.name} />
      case "comparison":
        return (
          <SeasonComparison
            seasons={allSeasons}
            getSeasonData={async (seasonId) => {
              try {
                const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` }
                const [incsRes, expsRes] = await Promise.all([
                  axios.get(`${api}/incomes?seasonId=${seasonId}`, { headers }),
                  axios.get(`${api}/expenses?seasonId=${seasonId}`, { headers }),
                ])
                return { incomes: incsRes.data, expenses: expsRes.data }
              } catch {
                return { incomes: [], expenses: [] }
              }
            }}
          />
        )
      default:
        return (
          <Dashboard
            incomes={incomes}
            expenses={expenses}
            currentSeason={currentSeason}
            allSeasons={allSeasons}
            onEndSeason={handleEndSeason}
            onSelectSeason={handleSelectSeason}
          />
        )
    }
  }

  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <div className="app">
            <LanguageSwitcher />
            <Sidebar
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
            <div className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}>
              <div className="mobile-header">
                <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                  ☰
                </button>
                <h1>Poultry Farm Tracker</h1>
              </div>
              <div className="desktop-header">
                <h1>Poultry Farm Tracker</h1>
                <span className="season-indicator">
                  {currentSeason ? `${currentSeason.name} - ${currentSeason.isActive ? "Active" : "Ended"}` : "No Season"}
                </span>
              </div>
              {renderCurrentPage()}
            </div>
            {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}
            <HelpGuide />
          </div>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
