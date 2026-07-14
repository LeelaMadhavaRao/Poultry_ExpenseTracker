"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import api from "./Api/api"
import Modal from "./common/Modal"
import Loading from "./common/Loading"

const injectCSS = `
.farmmgmt-wrapper { padding: 20px; max-width: 1200px; margin: 0 auto; }
.farmmgmt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.farmmgmt-header h2 { font-family: 'Sora', sans-serif; font-size: 24px; color: var(--color-text); margin: 0; }
.farmmgmt-add-btn { width: auto !important; padding: 10px 24px !important; }
.farmmgmt-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.farmmgmt-card { background: var(--color-surface); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); overflow: hidden; display: flex; flex-direction: column; }
.farmmgmt-card-header { padding: 18px 20px; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.farmmgmt-card-title { font-family: 'Sora', sans-serif; font-size: 17px; color: var(--color-text); margin: 0; font-weight: 700; word-break: break-word; }
.farmmgmt-card-body { padding: 0 20px 12px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.farmmgmt-card-field { font-size: 13px; font-family: 'Manrope', sans-serif; }
.farmmgmt-card-field-label { color: var(--color-text-muted); font-weight: 500; }
.farmmgmt-card-field-value { color: var(--color-text); }
.farmmgmt-card-desc { color: var(--color-text-muted); font-size: 13px; line-height: 1.5; font-family: 'Manrope', sans-serif; }
.farmmgmt-card-footer { padding: 10px 20px 14px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; border-top: 1px solid var(--color-border); }
.farmmgmt-status { padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; font-family: 'Manrope', sans-serif; }
.farmmgmt-status.active { background: #d4edda; color: var(--color-primary-dark); }
.farmmgmt-status.inactive { background: #f8d7da; color: #721c24; }
.farmmgmt-activate-btn { padding: 5px 13px; font-size: 12px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; background: var(--color-primary); color: #fff; font-family: 'Manrope', sans-serif; transition: background var(--transition); }
.farmmgmt-activate-btn:hover { background: var(--color-primary-light); }
.farmmgmt-empty { background: var(--color-surface); border-radius: var(--radius-md); padding: 48px; text-align: center; box-shadow: var(--shadow-sm); color: var(--color-text-muted); font-family: 'Manrope', sans-serif; }

@media (max-width: 1023px) { .farmmgmt-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 767px) {
  .farmmgmt-wrapper { padding: 15px; }
  .farmmgmt-grid { grid-template-columns: 1fr; }
  .farmmgmt-header { flex-direction: column; align-items: stretch; }
  .farmmgmt-header h2 { font-size: 20px; }
}
`

if (typeof document !== "undefined") {
  const styleId = "farmmgmt-styles"
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

  if (loading) return <Loading message="Loading farms..." />

  return (
    <div className="farmmgmt-wrapper">
      <div className="farmmgmt-header">
        <h2>Farm Management</h2>
        <button className="btn-primary farmmgmt-add-btn" onClick={openAddModal}>
          + Add Farm
        </button>
      </div>

      {farms.length === 0 ? (
        <div className="farmmgmt-empty">No farms yet. Click &quot;+ Add Farm&quot; to create your first farm.</div>
      ) : (
        <div className="farmmgmt-grid">
          {farms.map((farm) => (
            <div key={farm._id} className="farmmgmt-card">
              <div className="farmmgmt-card-header">
                <h3 className="farmmgmt-card-title">{farm.name}</h3>
                <span className={`farmmgmt-status ${farm.status === "active" || farm.isActive ? "active" : "inactive"}`}>
                  {farm.status === "active" || farm.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="farmmgmt-card-body">
                {farm.location && (
                  <div className="farmmgmt-card-field">
                    <span className="farmmgmt-card-field-label">Location: </span>
                    <span className="farmmgmt-card-field-value">{farm.location}</span>
                  </div>
                )}
                {farm.description && (
                  <p className="farmmgmt-card-desc">{farm.description}</p>
                )}
              </div>
              <div className="farmmgmt-card-footer">
                {!(farm.status === "active" || farm.isActive) && (
                  <button
                    className="farmmgmt-activate-btn"
                    onClick={() => handleActivate(farm._id)}
                    disabled={activatingId === farm._id}
                  >
                    {activatingId === farm._id ? "..." : "Set Active"}
                  </button>
                )}
                <button className="btn-edit" onClick={() => openEditModal(farm)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(farm)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

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
