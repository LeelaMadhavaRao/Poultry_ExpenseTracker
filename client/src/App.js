"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import api from "./components/Api/api"
import "./App.css"
import Login from "./components/Login"
import Signup from "./components/Signup"
import Dashboard from "./components/Dashboard"
import Sidebar from "./components/Sidebar"
import Profile from "./components/Profile"
import IncomeForm from "./components/IncomeForm"
import IncomeList from "./components/IncomeList"
import ExpenseForm from "./components/ExpenseForm"
import ExpenseList from "./components/ExpenseList"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentSeason, setCurrentSeason] = useState(null)
  const [allSeasons, setAllSeasons] = useState([])
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [showSeasonForm, setShowSeasonForm] = useState(false)
  const [seasonFormData, setSeasonFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: null,
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
      fetchSeason()
      fetchAllSeasons()
    }
  }, [])

  const fetchSeason = async () => {
    try {
      const response = await axios.get(`${api}/seasons/current`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setCurrentSeason(response.data)
      setShowSeasonForm(false)
      setCurrentPage("dashboard")
      console.log("Fetched current season:", response.data)
      await Promise.all([fetchIncomes(response.data._id), fetchExpenses(response.data._id)])
    } catch (error) {
      if (error.response?.status === 404) {
        setShowSeasonForm(true)
        setCurrentSeason(null)
        setIncomes([])
        setExpenses([])
        console.log("No active season found, showing season form")
      } else {
        console.error("Error fetching season:", error)
        alert("Failed to load season data. Please try again or contact support.")
      }
    }
  }

  const fetchAllSeasons = async () => {
    try {
      const response = await axios.get(`${api}/seasons`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setAllSeasons(response.data)
      console.log("Fetched all seasons:", response.data)
    } catch (error) {
      console.error("Error fetching all seasons:", error)
      if (error.response?.status === 404) {
        console.log("No seasons found for user")
        setAllSeasons([])
      }
    }
  }

 const fetchIncomes = async (seasonId) => {
  try {
    console.log("Fetching incomes for seasonId:", seasonId);
    const response = await axios.get(`${api}/incomes?seasonId=${seasonId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setIncomes(response.data);
    console.log("Fetched incomes:", response.data);
  } catch (error) {
    console.error("Error fetching incomes:", error.response?.data || error.message);
    setIncomes([]);
  }
};

const fetchExpenses = async (seasonId) => {
  try {
    console.log("Fetching expenses for seasonId:", seasonId);
    const response = await axios.get(`${api}/expenses?seasonId=${seasonId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setExpenses(response.data);
    console.log("Fetched expenses:", response.data);
  } catch (error) {
    console.error("Error fetching expenses:", error.response?.data || error.message);
    setExpenses([]);
  }
};

  const handleSelectSeason = async (seasonId) => {
    try {
      const season = allSeasons.find((s) => s._id === seasonId)
      if (season) {
        setCurrentSeason(season)
        await Promise.all([fetchIncomes(season._id), fetchExpenses(season._id)])
        setCurrentPage("dashboard")
      }
    } catch (error) {
      console.error("Error selecting season:", error)
      alert("Error selecting season: " + (error.response?.data?.error || "Server error"))
    }
  }

  const handleCreateSeason = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        `${api}/seasons`,
        { name: seasonFormData.name, startDate: seasonFormData.startDate, endDate: null },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      setCurrentSeason(response.data)
      setAllSeasons([...allSeasons, response.data])
      setShowSeasonForm(false)
      setCurrentPage("dashboard")
      await Promise.all([fetchIncomes(response.data._id), fetchExpenses(response.data._id)])
      setSeasonFormData({
        name: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: null,
      })
      console.log("Created new season:", response.data)
    } catch (error) {
      alert("Error creating season: " + (error.response?.data?.error || "Server error"))
    }
  }

  const handleLogin = async (credentials) => {
  try {
    console.log('Login attempt with credentials:', credentials);
    const response = await axios.post(`${api}/auth/login`, credentials, {
      headers: { 'Content-Type': 'application/json' }
    });
    localStorage.setItem('token', response.data.token);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    await fetchSeason();
    await fetchAllSeasons();
    console.log('Login successful, token:', response.data.token);
  } catch (error) {
    console.error('Login failed:', error.response?.data?.error || error.message);
    alert('Login failed: ' + (error.response?.data?.error || 'Server error'));
  }
};


  const handleSignup = async (userData) => {
    try {
      const response = await axios.post(`${api}/auth/signup`, userData)
      localStorage.setItem("token", response.data.token)
      setIsAuthenticated(true)
      setCurrentPage("dashboard")
      await fetchSeason()
      await fetchAllSeasons()
      console.log("Signup successful, token:", response.data.token)
    } catch (error) {
      alert("Signup failed: " + (error.response?.data?.error || "Server error"))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    setCurrentPage("dashboard")
    setCurrentSeason(null)
    setAllSeasons([])
    setIncomes([])
    setExpenses([])
    setShowSeasonForm(false)
    console.log("Logged out")
  }

  const addIncome = async (income) => {
    try {
      const response = await axios.post(
        `${api}/incomes`,
        { ...income, seasonId: currentSeason._id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      setIncomes([...incomes, response.data])
      alert("Income added successfully!")
    } catch (error) {
      alert("Error adding income: " + (error.response?.data?.error || "Server error"))
    }
  }

  const addExpense = async (expense) => {
    try {
      const response = await axios.post(
        `${api}/expenses`,
        { ...expense, seasonId: currentSeason._id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      setExpenses([...expenses, response.data])
      alert("Expense added successfully!")
    } catch (error) {
      alert("Error adding expense: " + (error.response?.data?.error || "Server error"))
    }
  }

  const updateIncome = async (id, updatedIncome) => {
    try {
      const response = await axios.put(
        `${api}/incomes/${id}`,
        updatedIncome,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      setIncomes(incomes.map((income) => (income._id === id ? response.data : income)))
      alert("Income updated successfully!")
    } catch (error) {
      alert("Error updating income: " + (error.response?.data?.error || "Server error"))
    }
  }

  const updateExpense = async (id, updatedExpense) => {
    try {
      const response = await axios.put(
        `${api}/expenses/${id}`,
        updatedExpense,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      setExpenses(expenses.map((expense) => (expense._id === id ? response.data : expense)))
      alert("Expense updated successfully!")
    } catch (error) {
      alert("Error updating expense: " + (error.response?.data?.error || "Server error"))
    }
  }

  const deleteIncome = async (id) => {
    try {
      await axios.delete(`${api}/incomes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setIncomes(incomes.filter((income) => income._id !== id))
      alert("Income deleted successfully!")
    } catch (error) {
      alert("Error deleting income: " + (error.response?.data?.error || "Server error"))
    }
  }

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${api}/expenses/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setExpenses(expenses.filter((expense) => expense._id !== id))
      alert("Expense deleted successfully!")
    } catch (error) {
      alert("Error deleting expense: " + (error.response?.data?.error || "Server error"))
    }
  }

  const endSeason = async () => {
    try {
      const response = await axios.put(
        `${api}/seasons/${currentSeason._id}/end`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      setCurrentSeason(response.data)
      setAllSeasons(allSeasons.map(s => s._id === response.data._id ? response.data : s))
      setIncomes([])
      setExpenses([])
      setShowSeasonForm(true)
      alert("Season ended successfully!")
    } catch (error) {
      alert("Error ending season: " + (error.response?.data?.error || "Server error"))
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        {showSignup ? (
          <Signup onSignup={handleSignup} onSwitchToLogin={() => setShowSignup(false)} />
        ) : (
          <Login onLogin={handleLogin} onSwitchToSignup={() => setShowSignup(true)} />
        )}
      </div>
    )
  }

  if (showSeasonForm) {
    return (
      <div className="form-container">
        <div className="form-header">
          <h2>Create New Season</h2>
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
              placeholder="Enter season name"
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
            onEndSeason={endSeason}
            onSelectSeason={handleSelectSeason}
          />
        )
      case "profile":
        return <Profile onLogout={handleLogout} />
      case "income":
        return <IncomeForm onAddIncome={addIncome} />
      case "income-list":
        return <IncomeList incomes={incomes} onUpdateIncome={updateIncome} onDeleteIncome={deleteIncome} />
      case "expense":
        return <ExpenseForm onAddExpense={addExpense} />
      case "expense-list":
        return <ExpenseList expenses={expenses} onUpdateExpense={updateExpense} onDeleteExpense={deleteExpense} />
      default:
        return (
          <Dashboard
            incomes={incomes}
            expenses={expenses}
            currentSeason={currentSeason}
            allSeasons={allSeasons}
            onEndSeason={endSeason}
            onSelectSeason={handleSelectSeason}
          />
        )
    }
  }

  return (
    <div className="app">
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
        {renderCurrentPage()}
      </div>
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  )
}

export default App;