"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import api from "./Api/api"
import Modal from "./common/Modal"
import Loading from "./common/Loading"

const injectCSS = `
.fm-wrapper { padding: 20px; max-width: 1200px; margin: 0 auto; }
.fm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.fm-header-title { display: flex; align-items: center; gap: 12px; }
.fm-header h2 { font-family: var(--font-display); font-size: 24px; color: var(--color-text); margin: 0; }
.fm-season-pill { padding: 5px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; background: var(--color-primary-fixed); color: var(--color-primary-dark); font-family: var(--font-body); }

.fm-top-row { display: grid; grid-template-columns: 3fr 1fr; gap: 16px; margin-bottom: 24px; }
.fm-overview-card { background: var(--color-surface-container-lowest); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--color-border); display: flex; align-items: center; gap: 20px; }
.fm-overview-text { flex: 1; }
.fm-overview-text h3 { font-family: var(--font-display); font-size: 18px; color: var(--color-text); margin: 0 0 6px; }
.fm-overview-text p { font-size: 13px; color: var(--color-text-muted); font-family: var(--font-body); line-height: 1.5; margin: 0; }
.fm-overview-icon { width: 56px; height: 56px; border-radius: var(--radius-md); background: var(--color-primary-fixed); color: var(--color-primary-dark); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }

.fm-birds-card { background: var(--color-surface-container-lowest); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-sm); border: 1px solid var(--color-border); text-align: center; display: flex; flex-direction: column; justify-content: center; }
.fm-birds-count { font-size: 36px; font-weight: 800; font-family: var(--font-display); color: var(--color-primary); line-height: 1.1; }
.fm-birds-label { font-size: 12px; color: var(--color-text-muted); font-family: var(--font-body); margin-top: 4px; }
.fm-birds-trend { font-size: 12px; font-weight: 600; margin-top: 4px; color: var(--color-success); }

.fm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.fm-card { background: var(--color-surface-container-lowest); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; display: flex; flex-direction: column; border: 1px solid var(--color-border); transition: transform var(--transition), box-shadow var(--transition); }
.fm-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

.fm-card-img { height: 120px; background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%); position: relative; display: flex; align-items: center; justify-content: center; }
.fm-card-img-icon { font-size: 42px; color: rgba(255,255,255,0.6); }
.fm-card-badge { position: absolute; top: 10px; right: 10px; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 600; font-family: var(--font-body); }
.fm-card-badge.active { background: var(--color-primary-fixed); color: var(--color-primary-dark); }
.fm-card-badge.inactive { background: var(--color-error-container); color: var(--color-danger); }

.fm-card-body { padding: 16px 18px 12px; flex: 1; }
.fm-card-name { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--color-text); margin: 0 0 8px; word-break: break-word; }
.fm-card-location { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-text-muted); font-family: var(--font-body); margin-bottom: 6px; }
.fm-card-location .material-symbols-outlined { font-size: 16px; color: var(--color-secondary); }
.fm-card-desc { font-size: 13px; color: var(--color-text-muted); font-family: var(--font-body); line-height: 1.5; margin: 0; }

.fm-card-footer { padding: 10px 18px 14px; display: flex; gap: 6px; align-items: center; border-top: 1px solid var(--color-border); }
.fm-card-footer .fm-spacer { flex: 1; }
.fm-activate-btn { padding: 6px 16px; font-size: 12px; font-weight: 600; border: none; border-radius: var(--radius-sm); cursor: pointer; background: var(--color-primary); color: var(--color-on-primary); font-family: var(--font-body); transition: opacity var(--transition); }
.fm-activate-btn:hover { opacity: 0.85; }
.fm-active-label { padding: 6px 16px; font-size: 12px; font-weight: 600; border-radius: var(--radius-sm); background: var(--color-surface-container); color: var(--color-text-muted); font-family: var(--font-body); opacity: 0.7; cursor: default; border: none; }

.fm-add-card { background: none; border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; cursor: pointer; transition: all var(--transition); min-height: 260px; }
.fm-add-card:hover { border-color: var(--color-primary); background: var(--color-primary-fixed); }
.fm-add-card-icon { font-size: 40px; color: var(--color-outline); }
.fm-add-card-text { margin-top: 10px; font-size: 14px; font-weight: 600; color: var(--color-text-muted); font-family: var(--font-body); }

.fm-empty { background: var(--color-surface-container-lowest); border-radius: var(--radius-lg); padding: 48px; text-align: center; box-shadow: var(--shadow-sm); color: var(--color-text-muted); font-family: var(--font-body); grid-column: 1 / -1; border: 1px solid var(--color-border); }

.fm-fab { display: none; position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--color-primary); color: var(--color-on-primary); border: none; box-shadow: 0 8px 24px rgba(0,54,26,0.35); cursor: pointer; font-size: 28px; z-index: 90; align-items: center; justify-content: center; transition: transform var(--transition), box-shadow var(--transition); }
.fm-fab:hover { transform: scale(1.08); box-shadow: 0 12px 32px rgba(0,54,26,0.45); }

@media (max-width: 1023px) {
  .fm-grid { grid-template-columns: repeat(2, 1fr); }
  .fm-top-row { grid-template-columns: 1fr; }
}
@media (max-width: 767px) {
  .fm-wrapper { padding: 15px; padding-bottom: 90px; }
  .fm-header { flex-direction: column; align-items: stretch; }
  .fm-header h2 { font-size: 20px; }
  .fm-grid { grid-template-columns: 1fr; }
  .fm-fab { display: flex; }
}
`

if (typeof document !== "undefined") {
  const styleId = "farmmgmt-poultrypro-styles"
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style")
    styleEl.id = styleId
    styleEl.textContent = injectCSS
    document.head.appendChild(styleEl)
  }
}

const FarmManagement = () => {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingFarm, setEditingFarm] = useState(null)
  const [formData, setFormData] = useState({ name: "", location: "", description: "" })
  const [submitting, setSubmitting] = useState(false)
  const [activatingId, setActivatingId] = useState(null)

  const headers = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }), [])

  const fetchFarms = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${api}/farms`, { headers })
      setFarms(Array.isArray(res.data) ? res.data : [])
    } catch {
      toast.error("Failed to load farms")
      setFarms([])
    } finally {
      setLoading(false)
    }
  }, [headers])

  useEffect(() => {
    fetchFarms()
  }, [fetchFarms])

  const resetForm = () => {
    setFormData({ name: "", location: "", description: "" })
    setEditingFarm(null)
  }

  const openAddModal = () => { resetForm(); setShowModal(true) }

  const openEditModal = (farm) => {
    setEditingFarm(farm)
    setFormData({
      name: farm.name || "",
      location: farm.location || "",
      description: farm.description || "",
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) { toast.error("Farm name is required"); return }
    setSubmitting(true)
    try {
      if (editingFarm) {
        await axios.put(`${api}/farms/${editingFarm._id}`, formData, { headers })
        toast.success("Farm updated")
      } else {
        await axios.post(`${api}/farms`, formData, { headers })
        toast.success("Farm created")
      }
      setShowModal(false)
      fetchFarms()
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save farm")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (farm) => {
    if (!window.confirm(`Delete farm "${farm.name}"? This cannot be undone.`)) return
    try {
      await axios.delete(`${api}/farms/${farm._id}`, { headers })
      toast.success("Farm deleted")
      fetchFarms()
    } catch {
      toast.error("Failed to delete farm")
    }
  }

  const handleActivate = async (farmId) => {
    setActivatingId(farmId)
    try {
      await axios.put(`${api}/farms/${farmId}/activate`, {}, { headers })
      toast.success("Active farm switched")
      fetchFarms()
    } catch {
      toast.error("Failed to switch farm")
    } finally {
      setActivatingId(null)
    }
  }

  const activeFarms = farms.filter((f) => f.status === "active" || f.isActive)
  const totalActiveBirds = activeFarms.length

  if (loading) return <Loading message="Loading farms..." />

  return (
    <div className="fm-wrapper">
      <div className="fm-header">
        <div className="fm-header-title">
          <h2>My Farms</h2>
          <span className="fm-season-pill">
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle" }}>eco</span>
            {" "}Active Farms: {totalActiveBirds}
          </span>
        </div>
        <button className="btn-primary" onClick={openAddModal} style={{ padding: "10px 24px", height: "auto" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>add</span>
          Add Farm
        </button>
      </div>

      <div className="fm-top-row">
        <div className="fm-overview-card glass-card">
          <div className="fm-overview-text">
            <h3>Regional Operations Overview</h3>
            <p>Manage and monitor all your poultry farms across locations. Track active operations, switch between farms, and keep locations up to date.</p>
          </div>
          <div className="fm-overview-icon">
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>agriculture</span>
          </div>
        </div>
        <div className="fm-birds-card glass-card">
          <div className="fm-birds-count">{totalActiveBirds}<span style={{ fontSize: 18, fontWeight: 500 }}>/{farms.length}</span></div>
          <div className="fm-birds-label">Total Active Birds</div>
          <div className="fm-birds-trend">
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle" }}>trending_up</span>
            {" "}{totalActiveBirds > 0 ? "Active" : "No active farms"}
          </div>
        </div>
      </div>

      {farms.length === 0 ? (
        <div className="fm-empty">No farms yet. Click &quot;+ Add Farm&quot; to create your first farm.</div>
      ) : (
        <div className="fm-grid">
          {farms.map((farm) => {
            const isActive = farm.status === "active" || farm.isActive
            return (
              <div key={farm._id} className="fm-card">
                <div className="fm-card-img">
                  <span className="material-symbols-outlined fm-card-img-icon">agriculture</span>
                  <span className={`fm-card-badge ${isActive ? "active" : "inactive"}`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="fm-card-body">
                  <h3 className="fm-card-name">{farm.name}</h3>
                  {farm.location && (
                    <div className="fm-card-location">
                      <span className="material-symbols-outlined">location_on</span>
                      {farm.location}
                    </div>
                  )}
                  {farm.description && (
                    <p className="fm-card-desc">{farm.description}</p>
                  )}
                </div>
                <div className="fm-card-footer">
                  {isActive ? (
                    <button className="fm-active-label" disabled>Currently Active</button>
                  ) : (
                    <button
                      className="fm-activate-btn"
                      onClick={() => handleActivate(farm._id)}
                      disabled={activatingId === farm._id}
                    >
                      {activatingId === farm._id ? "..." : "Set Active"}
                    </button>
                  )}
                  <span className="fm-spacer" />
                  <button
                    className="ft-icon-btn edit"
                    onClick={() => openEditModal(farm)}
                    title="Edit"
                    style={{ color: "var(--color-secondary)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "var(--radius-sm)" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                  </button>
                  <button
                    className="ft-icon-btn delete"
                    onClick={() => handleDelete(farm)}
                    title="Delete"
                    style={{ color: "var(--color-danger)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "var(--radius-sm)" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              </div>
            )
          })}
          <div className="fm-add-card" onClick={openAddModal} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openAddModal() }}>
            <span className="material-symbols-outlined fm-add-card-icon">add_circle</span>
            <span className="fm-add-card-text">Add New Farm</span>
          </div>
        </div>
      )}

      <button className="fm-fab" onClick={openAddModal} aria-label="Add Farm">
        <span className="material-symbols-outlined">add</span>
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingFarm ? "Edit Farm" : "Add Farm"} size="sm">
        <div className="form-group">
          <label>Farm Name</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., North Wing Farm" />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Village Road, District" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ marginTop: 12 }}>
          {submitting ? "Saving..." : editingFarm ? "Update Farm" : "Create Farm"}
        </button>
      </Modal>
    </div>
  )
}

FarmManagement.propTypes = {}

export default FarmManagement
