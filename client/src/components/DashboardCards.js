"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import PropTypes from "prop-types"
import api from "./Api/api"
import Loading from "./common/Loading"

const injectCSS = `
.dashcards-wrapper { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.dashcards-card { background: var(--color-surface); border-radius: var(--radius-md); padding: 16px 18px; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 14px; transition: transform var(--transition), box-shadow var(--transition); cursor: default; }
.dashcards-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.dashcards-icon { width: 44px; height: 44px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.dashcards-icon.birds { background: #e8f5e9; }
.dashcards-icon.reminders { background: #fff3e0; }
.dashcards-icon.feed { background: #e3f2fd; }
.dashcards-icon.farms { background: #f3e5f5; }
.dashcards-info { flex: 1; min-width: 0; }
.dashcards-value { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 700; color: var(--color-text); line-height: 1.1; }
.dashcards-label { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; font-family: 'Manrope', sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@media (max-width: 1023px) { .dashcards-wrapper { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 767px) { .dashcards-wrapper { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
@media (max-width: 480px) {
  .dashcards-wrapper { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .dashcards-card { padding: 12px 14px; gap: 10px; }
  .dashcards-icon { width: 38px; height: 38px; font-size: 18px; }
  .dashcards-value { font-size: 20px; }
}
`

if (typeof document !== "undefined") {
  const styleId = "dashcards-styles"
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style")
    styleEl.id = styleId
    styleEl.textContent = injectCSS
    document.head.appendChild(styleEl)
  }
}

const DashboardCards = ({ seasonId }) => {
  const [data, setData] = useState({ totalBirds: null, feedCostToday: null, upcomingReminders: null, activeFarms: null })
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!seasonId) return
    setLoading(true)
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` }
    try {
      const [birdsRes, feedRes, remindersRes, farmsRes] = await Promise.allSettled([
        axios.get(`${api}/birds?seasonId=${seasonId}`, { headers }),
        axios.get(`${api}/feed-summary?seasonId=${seasonId}`, { headers }),
        axios.get(`${api}/reminders`, { headers }),
        axios.get(`${api}/farms`, { headers }),
      ])

      const birdsArr = birdsRes.status === "fulfilled" ? birdsRes.value.data : []
      const totalBirds = Array.isArray(birdsArr)
        ? birdsArr.reduce((sum, b) => sum + (b.currentCount || 0), 0)
        : 0

      const feedSummary = feedRes.status === "fulfilled" ? feedRes.value.data : null
      const today = new Date().toISOString().split("T")[0]
      const feedCostToday = feedSummary?.dailyCosts
        ? feedSummary.dailyCosts[today] || 0
        : 0

      const remindersArr = remindersRes.status === "fulfilled" ? remindersRes.value.data : []
      const upcomingReminders = Array.isArray(remindersArr)
        ? remindersArr.filter((r) => !r.completed).length
        : 0

      const farmsArr = farmsRes.status === "fulfilled" ? farmsRes.value.data : []
      const activeFarms = Array.isArray(farmsArr)
        ? farmsArr.filter((f) => f.status === "active" || f.isActive).length
        : 0

      setData({ totalBirds, feedCostToday, upcomingReminders, activeFarms })
    } catch {
      toast.error("Failed to load dashboard cards data")
    } finally {
      setLoading(false)
    }
  }, [seasonId])
  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  if (loading) return <Loading type="skeleton" message="Loading summary..." />

  return (
    <div className="dashcards-wrapper">
      <div className="dashcards-card">
        <div className="dashcards-icon birds">🐔</div>
        <div className="dashcards-info">
          <div className="dashcards-value">{data.totalBirds !== null ? data.totalBirds : "—"}</div>
          <div className="dashcards-label">Total Birds</div>
        </div>
      </div>

      <div className="dashcards-card">
        <div className="dashcards-icon feed">🌾</div>
        <div className="dashcards-info">
          <div className="dashcards-value">{data.feedCostToday !== null ? `₹${data.feedCostToday.toLocaleString()}` : "—"}</div>
          <div className="dashcards-label">Feed Cost Today</div>
        </div>
      </div>

      <div className="dashcards-card">
        <div className="dashcards-icon reminders">🔔</div>
        <div className="dashcards-info">
          <div className="dashcards-value">{data.upcomingReminders !== null ? data.upcomingReminders : "—"}</div>
          <div className="dashcards-label">Upcoming Reminders</div>
        </div>
      </div>

      <div className="dashcards-card">
        <div className="dashcards-icon farms">🏭</div>
        <div className="dashcards-info">
          <div className="dashcards-value">{data.activeFarms !== null ? data.activeFarms : "—"}</div>
          <div className="dashcards-label">Active Farms</div>
        </div>
      </div>
    </div>
  )
}

DashboardCards.propTypes = {
  seasonId: PropTypes.string,
}

export default DashboardCards
