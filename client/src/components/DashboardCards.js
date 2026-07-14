import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import api from "./Api/api"

const DashboardCards = ({ seasonId }) => {
  const [data, setData] = useState({ totalBirds: 0, feedCostToday: 0, upcomingReminders: 0, activeFarms: 0 })

  const fetchAll = useCallback(async () => {
    if (!seasonId) return
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` }
      const [birdsRes, remindersRes, farmsRes] = await Promise.allSettled([
        axios.get(`${api}/birds?seasonId=${seasonId}`, { headers }),
        axios.get(`${api}/reminders`, { headers }),
        axios.get(`${api}/farms`, { headers }),
      ])
      const birdsArr = birdsRes.status === "fulfilled" ? birdsRes.value.data : []
      const totalBirds = Array.isArray(birdsArr) ? birdsArr.reduce((s, b) => s + (b.currentCount || 0), 0) : 0
      const remindersArr = remindersRes.status === "fulfilled" ? remindersRes.value.data : []
      const upcoming = Array.isArray(remindersArr) ? remindersArr.filter(r => !r.isCompleted).length : 0
      const farmsArr = farmsRes.status === "fulfilled" ? farmsRes.value.data : []
      const activeFarms = Array.isArray(farmsArr) ? farmsArr.filter(f => f.isActive).length : 0
      setData({ totalBirds, feedCostToday: 0, upcomingReminders: upcoming, activeFarms })
    } catch {}
  }, [seasonId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const cards = [
    { label: "Total Birds", value: data.totalBirds.toLocaleString(), icon: "flutter_dash", iconBg: "rgba(0,54,26,0.1)", iconColor: "var(--color-primary)", trend: "Healthy flock" },
    { label: "Feed Cost Today", value: `₹${data.feedCostToday.toLocaleString()}`, icon: "grass", iconBg: "rgba(0,106,96,0.1)", iconColor: "var(--color-secondary)", trend: "On track" },
    { label: "Upcoming Reminders", value: data.upcomingReminders.toString(), icon: "notifications", iconBg: "rgba(255,220,190,0.3)", iconColor: "var(--color-tertiary)", trend: `${data.upcomingReminders > 0 ? data.upcomingReminders + " pending" : "All clear"}` },
    { label: "Active Farms", value: data.activeFarms.toString(), icon: "domain", iconBg: "rgba(193,201,191,0.2)", iconColor: "var(--color-on-surface)", trend: "All sectors healthy" },
  ]

  return (
    <section style={styles.grid}>
      {cards.map((c, i) => (
        <div key={i} style={styles.card}>
          <div>
            <p style={styles.label}>{c.label}</p>
            <h3 style={styles.value}>{c.value}</h3>
            <p style={styles.trend}>
              <span className="material-symbols-outlined" style={{fontSize:14,marginRight:4}}>trending_up</span>
              {c.trend}
            </p>
          </div>
          <div style={{...styles.iconCircle, background: c.iconBg, color: c.iconColor}}>
            <span className="material-symbols-outlined" style={{fontSize:24}}>{c.icon}</span>
          </div>
        </div>
      ))}
    </section>
  )
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 24 },
  card: { background: "var(--color-surface-container-lowest)", padding: 20, borderRadius: 12, border: "1px solid rgba(193,201,191,0.3)", boxShadow: "0px 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  label: { color: "var(--color-on-surface-variant)", fontSize: 14, fontWeight: 500, marginBottom: 4 },
  value: { fontSize: 24, fontWeight: 700, color: "var(--color-primary)", fontFamily: "var(--font-display)", lineHeight: 1.2 },
  trend: { fontSize: 11, color: "var(--color-primary-container)", marginTop: 4, display: "flex", alignItems: "center" },
  iconCircle: { width: 48, height: 48, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
}

export default DashboardCards
