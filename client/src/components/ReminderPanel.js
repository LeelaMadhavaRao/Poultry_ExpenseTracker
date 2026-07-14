"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import api from "./Api/api"
import Modal from "./common/Modal"
import Loading from "./common/Loading"

const TYPES = ["feed_order", "vaccination", "medicine", "maintenance", "other"]
const PRIORITIES = ["high", "medium", "low"]

const injectCSS = `
.reminderpanel-wrapper { padding: 20px; max-width: 1200px; margin: 0 auto; }
.reminderpanel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.reminderpanel-header h2 { font-family: 'Sora', sans-serif; font-size: 24px; color: var(--color-text); margin: 0; }
.reminderpanel-add-btn { width: auto !important; padding: 10px 24px !important; }
.reminderpanel-section { margin-bottom: 28px; }
.reminderpanel-section-title { font-family: 'Sora', sans-serif; font-size: 18px; color: var(--color-text); margin: 0 0 14px; }
.reminderpanel-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.reminderpanel-card { background: var(--color-surface); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); overflow: hidden; display: flex; flex-direction: column; transition: opacity var(--transition); }
.reminderpanel-card.completed { opacity: 0.55; }
.reminderpanel-card-header { padding: 14px 18px; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; border-left: 4px solid var(--color-border); }
.reminderpanel-card-title-wrap { flex: 1; min-width: 0; }
.reminderpanel-card-title { font-family: 'Sora', sans-serif; font-size: 15px; color: var(--color-text); margin: 0; font-weight: 700; }
.reminderpanel-card-title.done { text-decoration: line-through; color: var(--color-text-muted); }
.reminderpanel-card-body { padding: 6px 18px 12px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.reminderpanel-card-desc { font-size: 13px; color: var(--color-text-muted); line-height: 1.5; font-family: 'Manrope', sans-serif; }
.reminderpanel-card-due { font-size: 12px; color: var(--color-text-muted); font-family: 'Manrope', sans-serif; }
.reminderpanel-card-footer { padding: 8px 14px 12px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; border-top: 1px solid var(--color-border); }
.reminderpanel-badge { padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; font-family: 'Manrope', sans-serif; white-space: nowrap; text-transform: capitalize; }
.reminderpanel-badge.type { background: var(--color-bg); color: var(--color-text-muted); }
.reminderpanel-badge.priority-high { background: #fdecea; color: var(--color-danger); }
.reminderpanel-badge.priority-medium { background: #fff8e1; color: #e65100; }
.reminderpanel-badge.priority-low { background: #e8f5e9; color: var(--color-success); }
.reminderpanel-complete-btn { padding: 5px 14px; font-size: 12px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; background: var(--color-success); color: #fff; font-family: 'Manrope', sans-serif; transition: background var(--transition); }
.reminderpanel-complete-btn:hover { background: #219a52; }
.reminderpanel-empty { background: var(--color-surface); border-radius: var(--radius-md); padding: 40px; text-align: center; box-shadow: var(--shadow-sm); color: var(--color-text-muted); font-family: 'Manrope', sans-serif; }
.reminderpanel-count { background: var(--color-primary); color: #fff; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; vertical-align: middle; margin-left: 6px; }

@media (max-width: 1023px) { .reminderpanel-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 767px) {
  .reminderpanel-wrapper { padding: 15px; }
  .reminderpanel-grid { grid-template-columns: 1fr; }
  .reminderpanel-header { flex-direction: column; align-items: stretch; }
  .reminderpanel-header h2 { font-size: 20px; }
}
`

if (typeof document !== "undefined") {
  const styleId = "reminderpanel-styles"
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style")
    styleEl.id = styleId
    styleEl.textContent = injectCSS
    document.head.appendChild(styleEl)
  }
}

const ReminderPanel = () => {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "feed_order",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
  })
  const [submitting, setSubmitting] = useState(false)
  const [completingId, setCompletingId] = useState(null)

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  const fetchReminders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${api}/reminders`, { headers })
      setReminders(Array.isArray(res.data) ? res.data : [])
    } catch {
      toast.error("Failed to load reminders")
      setReminders([])
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  const now = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(now.getDate() + 7)

  const upcoming = reminders.filter((r) => {
    if (r.completed) return false
    const due = r.dueDate ? new Date(r.dueDate) : null
    return due && due <= sevenDaysFromNow && due >= now
  })

  const upcomingCount = reminders.filter((r) => !r.completed).length

  const allReminders = [...reminders].sort((a, b) => {
    if (a.completed && !b.completed) return 1
    if (!a.completed && b.completed) return -1
    return new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "var(--color-danger)"
      case "medium": return "#e65100"
      case "low": return "var(--color-success)"
      default: return "var(--color-border)"
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  const isDueSoon = (dateStr) => {
    if (!dateStr) return false
    const due = new Date(dateStr)
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 3
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) { toast.error("Title is required"); return }
    if (!formData.dueDate) { toast.error("Due date is required"); return }
    setSubmitting(true)
    try {
      await axios.post(`${api}/reminders`, formData, { headers })
      toast.success("Reminder added")
      setShowModal(false)
      setFormData({
        title: "",
        description: "",
        type: "feed_order",
        dueDate: new Date().toISOString().split("T")[0],
        priority: "medium",
      })
      fetchReminders()
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add reminder")
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkComplete = async (reminder) => {
    setCompletingId(reminder._id)
    try {
      await axios.put(`${api}/reminders/${reminder._id}/complete`, {}, { headers })
      toast.success("Reminder marked complete")
      fetchReminders()
    } catch {
      toast.error("Failed to update reminder")
    } finally {
      setCompletingId(null)
    }
  }

  const renderReminderCard = (reminder) => (
    <div key={reminder._id} className={`reminderpanel-card ${reminder.completed ? "completed" : ""}`}>
      <div className="reminderpanel-card-header" style={{ borderLeftColor: reminder.completed ? "var(--color-border)" : getPriorityColor(reminder.priority) }}>
        <div className="reminderpanel-card-title-wrap">
          <h4 className={`reminderpanel-card-title ${reminder.completed ? "done" : ""}`}>{reminder.title}</h4>
        </div>
      </div>
      <div className="reminderpanel-card-body">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className="reminderpanel-badge type">{reminder.type?.replace("_", " ")}</span>
          <span className={`reminderpanel-badge priority-${reminder.priority}`}>{reminder.priority}</span>
        </div>
        {reminder.description && (
          <p className="reminderpanel-card-desc">{reminder.description}</p>
        )}
        <span className="reminderpanel-card-due" style={isDueSoon(reminder.dueDate) && !reminder.completed ? { color: "var(--color-danger)", fontWeight: 600 } : {}}>
          {reminder.completed ? "✓ Completed" : `Due: ${formatDate(reminder.dueDate)}`}
          {isDueSoon(reminder.dueDate) && !reminder.completed ? " (Soon!)" : ""}
        </span>
      </div>
      {!reminder.completed && (
        <div className="reminderpanel-card-footer">
          <button
            className="reminderpanel-complete-btn"
            onClick={() => handleMarkComplete(reminder)}
            disabled={completingId === reminder._id}
          >
            {completingId === reminder._id ? "..." : "Mark Complete"}
          </button>
        </div>
      )}
    </div>
  )

  if (loading) return <Loading message="Loading reminders..." />

  return (
    <div className="reminderpanel-wrapper">
      <div className="reminderpanel-header">
        <h2>
          Reminders
          {upcomingCount > 0 && <span className="reminderpanel-count">{upcomingCount}</span>}
        </h2>
        <button className="btn-primary reminderpanel-add-btn" onClick={() => setShowModal(true)}>
          + Add Reminder
        </button>
      </div>

      <div className="reminderpanel-section">
        <h3 className="reminderpanel-section-title">Upcoming (Next 7 Days)</h3>
        {upcoming.length === 0 ? (
          <div className="reminderpanel-empty">No upcoming reminders in the next 7 days.</div>
        ) : (
          <div className="reminderpanel-grid">
            {upcoming.map(renderReminderCard)}
          </div>
        )}
      </div>

      <div className="reminderpanel-section">
        <h3 className="reminderpanel-section-title">All Reminders</h3>
        {allReminders.length === 0 ? (
          <div className="reminderpanel-empty">No reminders yet. Click &quot;+ Add Reminder&quot; to create one.</div>
        ) : (
          <div className="reminderpanel-grid">
            {allReminders.map(renderReminderCard)}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Reminder" size="sm">
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Order feed stock" />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
            {TYPES.map((t) => (
              <option key={t} value={t} style={{ textTransform: "capitalize" }}>
                {t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Due Date</label>
          <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p} style={{ textTransform: "capitalize" }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ marginTop: 12 }}>
          {submitting ? "Adding..." : "Add Reminder"}
        </button>
      </Modal>
    </div>
  )
}

ReminderPanel.propTypes = {}

export default ReminderPanel
