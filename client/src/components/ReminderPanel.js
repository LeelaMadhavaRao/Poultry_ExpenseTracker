"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import api from "./Api/api"
import Modal from "./common/Modal"
import Loading from "./common/Loading"

const TYPES = ["feed_order", "vaccination", "medicine", "maintenance", "other"]
const PRIORITIES = ["high", "medium", "low"]

const FILTERS = {
  all: { label: "All", types: TYPES },
  medical: { label: "Medical", types: ["vaccination", "medicine"] },
  logistics: { label: "Logistics", types: ["feed_order", "maintenance", "other"] },
}

const formatDate = (dateStr) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

const getPriorityColor = (priority) => {
  switch (priority) {
    case "high": return "var(--color-danger)"
    case "medium": return "#e65100"
    case "low": return "var(--color-success)"
    default: return "var(--color-border)"
  }
}

const ReminderPanel = () => {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "feed_order",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
  })
  const [submitting, setSubmitting] = useState(false)
  const [completingId, setCompletingId] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

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

  useEffect(() => { fetchReminders() }, [fetchReminders])

  const now = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(now.getDate() + 7)

  const upcoming = reminders.filter((r) => {
    if (r.completed) return false
    const due = r.dueDate ? new Date(r.dueDate) : null
    return due && due <= sevenDaysFromNow && due >= now
  })

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed && !b.completed) return 1
    if (!a.completed && b.completed) return -1
    return new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
  })

  const filteredReminders = sortedReminders.filter((r) =>
    FILTERS[activeFilter].types.includes(r.type)
  )
  const totalPages = Math.ceil(filteredReminders.length / ITEMS_PER_PAGE)
  const paginatedReminders = filteredReminders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const isDueSoon = (dateStr) => {
    if (!dateStr) return false
    const due = new Date(dateStr)
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 3
  }

  const openAdd = () => {
    setEditingReminder(null)
    setFormData({ title: "", description: "", type: "feed_order", dueDate: new Date().toISOString().split("T")[0], priority: "medium" })
    setShowModal(true)
  }

  const openEdit = (reminder) => {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      type: reminder.type,
      dueDate: reminder.dueDate ? new Date(reminder.dueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      priority: reminder.priority,
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) { toast.error("Title is required"); return }
    if (!formData.dueDate) { toast.error("Due date is required"); return }
    setSubmitting(true)
    try {
      if (editingReminder) {
        await axios.put(`${api}/reminders/${editingReminder._id}`, formData, { headers })
        toast.success("Reminder updated")
      } else {
        await axios.post(`${api}/reminders`, formData, { headers })
        toast.success("Reminder added")
      }
      setShowModal(false)
      fetchReminders()
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save reminder")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reminder?")) return
    try {
      await axios.delete(`${api}/reminders/${id}`, { headers })
      toast.success("Reminder deleted")
      fetchReminders()
    } catch {
      toast.error("Failed to delete reminder")
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

  const handleFilterChange = (key) => {
    setActiveFilter(key)
    setCurrentPage(1)
  }

  const upcomingCount = reminders.filter((r) => !r.completed).length

  if (loading) return <Loading message="Loading reminders..." />

  return (
    <div className="rp-wrapper">
      {/* Header */}
      <div className="rp-header">
        <div>
          <h2 className="rp-heading">Precision Alerts</h2>
          <p className="rp-subtitle">Track vaccinations, feed orders & farm tasks</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ whiteSpace: "nowrap" }}>
          + Add Reminder
        </button>
      </div>

      {/* Upcoming Section – Bento Grid 3 cols */}
      <div className="rp-upcoming-label">
        <h3>Upcoming (Next 7 Days)</h3>
        <span className="rp-count-chip">{upcomingCount} active</span>
      </div>

      {upcoming.length === 0 ? (
        <div className="rp-empty">No upcoming reminders in the next 7 days.</div>
      ) : (
        <div className="rp-bento">
          {upcoming.map((r) => {
            const isHigh = r.priority === "high"
            const isMedium = r.priority === "medium"
            const borderColor = isHigh ? "var(--color-danger)" : isMedium ? "#e65100" : "var(--color-success)"
            const badgeClass = isHigh ? "rp-badge rp-badge-danger" : isMedium ? "rp-badge rp-badge-warning-tertiary" : "rp-badge rp-badge-success"
            return (
              <div key={r._id} className="rp-bento-card glass-card" style={{ borderLeft: `4px solid ${borderColor}` }}>
                <div className="rp-bento-top">
                  <h4 className="rp-bento-title">{r.title}</h4>
                  <span className={badgeClass}>{r.priority}</span>
                </div>
                <div className="rp-bento-meta">
                  <span className="rp-badge rp-badge-category">{r.type?.replace("_", " ")}</span>
                  <span className="rp-bento-due" style={isDueSoon(r.dueDate) ? { color: "var(--color-danger)", fontWeight: 700 } : {}}>
                    {formatDate(r.dueDate)}
                    {isDueSoon(r.dueDate) ? " (Soon!)" : ""}
                  </span>
                </div>
                {r.description && <p className="rp-bento-desc">{r.description}</p>}
                <button
                  className="rp-complete-btn"
                  onClick={() => handleMarkComplete(r)}
                  disabled={completingId === r._id}
                >
                  {completingId === r._id ? "..." : "Mark Complete"}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Stay Proactive card if upcoming has items */}
      {upcoming.length > 0 && (
        <div className="rp-proactive-card" style={{ marginTop: 16 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-primary)" }}>lightbulb</span>
          <div>
            <h4>Stay Proactive</h4>
            <p>You have {upcomingCount} pending {upcomingCount === 1 ? "task" : "tasks"}. Complete them to keep your farm operations running smoothly.</p>
          </div>
        </div>
      )}

      {/* All Reminders Section */}
      <div className="rp-section-divider">
        <h3>All Reminders</h3>
      </div>

      {/* Filter Buttons */}
      <div className="rp-filter-row">
        {Object.entries(FILTERS).map(([key, { label }]) => (
          <button
            key={key}
            className={`rp-filter-btn ${activeFilter === key ? "rp-filter-btn-active" : ""}`}
            onClick={() => handleFilterChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredReminders.length === 0 ? (
        <div className="rp-empty">No reminders match the selected filter.</div>
      ) : (
        <>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReminders.map((r) => (
                  <tr key={r._id} className={r.completed ? "rp-row-completed" : ""}>
                    <td>
                      <span className="rp-priority-dot" style={{ background: getPriorityColor(r.priority) }} />
                      <span style={{ textTransform: "capitalize" }}>{r.priority}</span>
                    </td>
                    <td className={r.completed ? "rp-text-strike" : ""}>{r.title}</td>
                    <td>
                      <span className="rp-badge rp-badge-category">{r.type?.replace("_", " ")}</span>
                    </td>
                    <td style={{ color: isDueSoon(r.dueDate) && !r.completed ? "var(--color-danger)" : "var(--color-text-muted)", fontWeight: isDueSoon(r.dueDate) && !r.completed ? 700 : 400 }}>
                      {formatDate(r.dueDate)}
                    </td>
                    <td>
                      {r.completed ? (
                        <span className="rp-badge rp-badge-success">Complete</span>
                      ) : (
                        <span className="rp-badge rp-badge-pending">Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="rp-actions">
                        <button
                          className="rp-icon-btn"
                          title="Edit"
                          onClick={() => openEdit(r)}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          className="rp-icon-btn rp-icon-btn-danger"
                          title="Delete"
                          onClick={() => handleDelete(r._id)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="rp-pagination">
              <button
                className="rp-page-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </button>
              <span className="rp-page-info">{currentPage} / {totalPages}</span>
              <button
                className="rp-page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Bottom Cards */}
      <div className="rp-bottom-cards">
        <div className="rp-integration-card glass-card">
          <div className="rp-integration-left">
            <div className="rp-integration-img">
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--color-primary)" }}>sync</span>
            </div>
            <div>
              <h4>Reminder Integration</h4>
              <p>Sync with calendar & notifications</p>
            </div>
          </div>
          <div className="rp-integration-actions">
            <button className="btn-secondary" style={{ height: 36, padding: "0 16px", fontSize: 13 }}>Sync</button>
            <button className="btn-primary" style={{ height: 36, padding: "0 16px", fontSize: 13 }}>Help</button>
          </div>
        </div>
        <div className="rp-health-card glass-card">
          <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--color-success)" }}>monitoring</span>
          <div>
            <h4>Monthly Health</h4>
            <span className="rp-health-stat">94%</span>
          </div>
          <div className="rp-progress-bar">
            <div className="rp-progress-fill" style={{ width: "94%" }} />
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingReminder ? "Edit Reminder" : "Add Reminder"} size="sm">
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Order feed stock" />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
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
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ marginTop: 12, width: "100%" }}>
          {submitting ? "Saving..." : editingReminder ? "Update Reminder" : "Add Reminder"}
        </button>
      </Modal>

      <style>{rpCSS}</style>
    </div>
  )
}

const rpCSS = `
.rp-wrapper { padding: 24px; max-width: 1200px; margin: 0 auto; }
.rp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.rp-heading { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--color-text); margin: 0; }
.rp-subtitle { font-size: 14px; color: var(--color-text-muted); margin: 4px 0 0; font-family: var(--font-body); }
.rp-upcoming-label { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.rp-upcoming-label h3 { font-family: var(--font-display); font-size: 18px; color: var(--color-text); margin: 0; }
.rp-count-chip { background: var(--color-primary-container); color: var(--color-on-primary-container); padding: 2px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.rp-empty { padding: 40px; text-align: center; color: var(--color-text-muted); background: var(--color-surface-container-lowest); border-radius: var(--radius-lg); border: 1px solid var(--color-border); font-family: var(--font-body); }

/* Bento Grid */
.rp-bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.rp-bento-card { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
.rp-bento-top { display: flex; justify-content: space-between; align-items: center; }
.rp-bento-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--color-text); margin: 0; flex: 1; }
.rp-bento-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rp-bento-due { font-size: 12px; color: var(--color-text-muted); font-weight: 500; }
.rp-bento-desc { font-size: 13px; color: var(--color-text-muted); line-height: 1.5; margin: 0; }
.rp-complete-btn { padding: 6px 14px; font-size: 12px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; background: var(--color-success); color: #fff; font-family: var(--font-body); transition: opacity 0.2s; align-self: flex-start; }
.rp-complete-btn:hover { opacity: 0.85; }
.rp-complete-btn:disabled { opacity: 0.5; cursor: default; }

/* Proactive card */
.rp-proactive-card { background: var(--color-primary-container); border-radius: var(--radius-lg); padding: 20px 24px; display: flex; align-items: center; gap: 16px; border: 1px solid rgba(0,54,26,0.08); }
.rp-proactive-card h4 { font-family: var(--font-display); font-size: 15px; color: var(--color-text); margin: 0 0 4px; }
.rp-proactive-card p { font-size: 13px; color: var(--color-text-muted); margin: 0; }

/* Section */
.rp-section-divider { margin: 32px 0 16px; }
.rp-section-divider h3 { font-family: var(--font-display); font-size: 18px; color: var(--color-text); margin: 0; }

/* Filters */
.rp-filter-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.rp-filter-btn { padding: 6px 18px; border: 1.5px solid var(--color-border); border-radius: 999px; background: var(--color-surface-container-lowest); color: var(--color-text-muted); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: var(--font-body); }
.rp-filter-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.rp-filter-btn-active { background: var(--color-primary); color: var(--color-on-primary); border-color: var(--color-primary); }

/* Table */
.rp-table-wrap { overflow-x: auto; border-radius: var(--radius-lg); border: 1px solid var(--color-border); background: var(--color-surface-container-lowest); }
.rp-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.rp-table th { padding: 12px 16px; text-align: left; font-weight: 600; color: var(--color-text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; background: var(--color-bg); border-bottom: 2px solid var(--color-border); white-space: nowrap; }
.rp-table td { padding: 12px 16px; border-bottom: 1px solid var(--color-border); color: var(--color-text); font-size: 14px; white-space: nowrap; }
.rp-table tbody tr { transition: background 0.2s; }
.rp-table tbody tr:hover { background: var(--color-surface-container-low); }
.rp-row-completed td { color: var(--color-text-muted); opacity: 0.6; }
.rp-text-strike { text-decoration: line-through; }
.rp-priority-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }

/* Badges */
.rp-badge { padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; font-family: var(--font-body); white-space: nowrap; text-transform: capitalize; display: inline-block; }
.rp-badge-danger { background: var(--color-error-container); color: var(--color-danger); }
.rp-badge-warning { background: #fff8e1; color: #e65100; }
.rp-badge-warning-tertiary { background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-container); }
.rp-badge-success { background: var(--color-primary-fixed); color: var(--color-primary-dark); }
.rp-badge-category { background: var(--color-surface-container-high); color: var(--color-on-surface-variant); }
.rp-badge-pending { background: var(--color-secondary-container); color: var(--color-on-secondary-container); }

/* Actions */
.rp-actions { display: flex; gap: 4px; }
.rp-icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface-container-lowest); cursor: pointer; transition: all 0.2s; color: var(--color-text-muted); }
.rp-icon-btn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-fixed); }
.rp-icon-btn-danger:hover { border-color: var(--color-danger); color: var(--color-danger); background: var(--color-error-container); }
.rp-icon-btn .material-symbols-outlined { font-size: 16px; }

/* Pagination */
.rp-pagination { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 20px 0 0; }
.rp-page-btn { padding: 8px 16px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface-container-lowest); color: var(--color-text); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: var(--font-body); }
.rp-page-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.rp-page-btn:disabled { opacity: 0.4; cursor: default; }
.rp-page-info { font-size: 13px; color: var(--color-text-muted); font-weight: 500; }

/* Bottom Cards */
.rp-bottom-cards { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-top: 28px; }
.rp-integration-card { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.rp-integration-left { display: flex; align-items: center; gap: 14px; }
.rp-integration-img { width: 56px; height: 56px; border-radius: var(--radius-md); background: var(--color-primary-fixed); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rp-integration-card h4 { font-family: var(--font-display); font-size: 15px; color: var(--color-text); margin: 0 0 2px; }
.rp-integration-card p { font-size: 13px; color: var(--color-text-muted); margin: 0; }
.rp-integration-actions { display: flex; gap: 8px; }
.rp-health-card { padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; }
.rp-health-card h4 { font-family: var(--font-display); font-size: 14px; color: var(--color-text); margin: 0; }
.rp-health-stat { font-size: 28px; font-weight: 700; font-family: var(--font-display); color: var(--color-success); }
.rp-progress-bar { width: 100%; height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden; }
.rp-progress-fill { height: 100%; border-radius: 4px; background: var(--color-success); transition: width 0.5s ease; }

@media (max-width: 1023px) { .rp-bento { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 767px) {
  .rp-wrapper { padding: 16px; }
  .rp-bento { grid-template-columns: 1fr; }
  .rp-bottom-cards { grid-template-columns: 1fr; }
  .rp-header { flex-direction: column; }
  .rp-heading { font-size: 22px; }
}
`

export default ReminderPanel
