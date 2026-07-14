"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import PropTypes from "prop-types"
import api from "./Api/api"
import Modal from "./common/Modal"
import Loading from "./common/Loading"

const BREEDS = ["Broiler", "Layer", "Country Chicken", "Other"]

const injectCSS = `
.birdtracker-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.birdtracker-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.birdtracker-empty { background: var(--color-surface); border-radius: var(--radius-md); padding: 48px; text-align: center; box-shadow: var(--shadow-sm); }
.birdtracker-card { background: var(--color-surface); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); overflow: hidden; display: flex; flex-direction: column; }
.birdtracker-card-header { padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; gap: 8px; border-left: 4px solid var(--color-border); }
.birdtracker-card-title { font-family: 'Sora', sans-serif; font-size: 15px; color: var(--color-text); margin: 0; font-weight: 700; }
.birdtracker-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: var(--color-bg); color: var(--color-text-muted); font-family: 'Manrope', sans-serif; white-space: nowrap; }
.birdtracker-card-body { padding: 10px 18px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
.birdtracker-card-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-family: 'Manrope', sans-serif; }
.birdtracker-card-label { color: var(--color-text-muted); }
.birdtracker-card-value { color: var(--color-text); font-weight: 500; }
.birdtracker-card-footer { padding: 8px 14px 12px; display: flex; gap: 6px; flex-wrap: wrap; border-top: 1px solid var(--color-border); }
.birdtracker-action-death { padding: 4px 12px; font-size: 12px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; background: #fdecea; color: var(--color-danger); font-family: 'Manrope', sans-serif; transition: background var(--transition); }
.birdtracker-action-death:hover { background: #f5d5d2; }
.birdtracker-action-sold { padding: 4px 12px; font-size: 12px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; background: #e8f5e9; color: var(--color-success); font-family: 'Manrope', sans-serif; transition: background var(--transition); }
.birdtracker-action-sold:hover { background: #d0ebd2; }
.birdtracker-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.birdtracker-header h2 { font-family: 'Sora', sans-serif; font-size: 24px; color: var(--color-text); margin: 0; }
.birdtracker-add-btn { width: auto !important; padding: 10px 24px !important; }
.birdtracker-summary-item { background: var(--color-surface); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-sm); }
.birdtracker-summary-icon { font-size: 26px; flex-shrink: 0; }
.birdtracker-summary-label { font-size: 12px; color: var(--color-text-muted); margin-bottom: 2px; font-family: 'Manrope', sans-serif; }
.birdtracker-summary-value { font-size: 20px; font-weight: 700; color: var(--color-text); font-family: 'Sora', sans-serif; }
.birdtracker-wrapper { padding: 20px; max-width: 1200px; margin: 0 auto; }

@media (max-width: 1023px) {
  .birdtracker-summary { grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .birdtracker-grid { grid-template-columns: repeat(2, 1fr); }
  .birdtracker-summary-item { padding: 12px; gap: 8px; }
  .birdtracker-summary-icon { font-size: 22px; }
  .birdtracker-summary-value { font-size: 17px; }
}
@media (max-width: 767px) {
  .birdtracker-wrapper { padding: 15px; }
  .birdtracker-summary { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .birdtracker-grid { grid-template-columns: 1fr; }
  .birdtracker-header { flex-direction: column; align-items: stretch; }
  .birdtracker-header h2 { font-size: 20px; }
  .birdtracker-summary-item { padding: 10px; gap: 8px; }
  .birdtracker-summary-icon { font-size: 20px; }
  .birdtracker-summary-value { font-size: 16px; }
}
@media (max-width: 480px) {
  .birdtracker-summary { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .birdtracker-summary-item { padding: 8px; gap: 6px; }
  .birdtracker-summary-icon { font-size: 18px; }
  .birdtracker-summary-value { font-size: 14px; }
  .birdtracker-summary-label { font-size: 10px; }
}
`

if (typeof document !== "undefined") {
  const styleId = "birdtracker-styles"
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style")
    styleEl.id = styleId
    styleEl.textContent = injectCSS
    document.head.appendChild(styleEl)
  }
}

const BirdTracker = ({ seasonId }) => {
  const [birds, setBirds] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingBird, setEditingBird] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    breed: "Broiler",
    initialCount: "",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const headers = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }), [])

  const fetchBirds = useCallback(async () => {
    if (!seasonId) return
    setLoading(true)
    try {
      const res = await axios.get(`${api}/birds?seasonId=${seasonId}`, { headers })
      setBirds(Array.isArray(res.data) ? res.data : [])
    } catch {
      toast.error("Failed to load bird batches")
      setBirds([])
    } finally {
      setLoading(false)
    }
  }, [seasonId, headers])

  useEffect(() => {
    fetchBirds()
  }, [fetchBirds])

  const summary = {
    total: birds.reduce((sum, b) => sum + (b.currentCount || 0), 0),
    deaths: birds.reduce((sum, b) => sum + (b.deaths || 0), 0),
    sold: birds.reduce((sum, b) => sum + (b.sold || 0), 0),
    survivalRate:
      birds.length > 0
        ? (
            (birds.reduce((sum, b) => sum + (b.currentCount || 0), 0) /
              Math.max(birds.reduce((sum, b) => sum + (b.initialCount || 0), 0), 1)) *
            100
          ).toFixed(1)
        : 0,
  }

  const resetForm = () => {
    setFormData({
      name: "",
      breed: "Broiler",
      initialCount: "",
      startDate: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setEditingBird(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (bird) => {
    setEditingBird(bird)
    setFormData({
      name: bird.name || "",
      breed: bird.breed || "Broiler",
      initialCount: String(bird.initialCount ?? ""),
      startDate: bird.startDate ? new Date(bird.startDate).toISOString().split("T")[0] : "",
      notes: bird.notes || "",
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Batch name is required")
      return
    }
    if (!formData.initialCount || Number.parseInt(formData.initialCount) <= 0) {
      toast.error("Initial count must be a positive number")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        initialCount: Number.parseInt(formData.initialCount),
        seasonId,
      }
      if (editingBird) {
        await axios.put(`${api}/birds/${editingBird._id}`, payload, { headers })
        toast.success("Batch updated")
      } else {
        await axios.post(`${api}/birds`, payload, { headers })
        toast.success("Batch added")
      }
      setShowModal(false)
      fetchBirds()
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save batch")
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickAction = async (bird, action) => {
    try {
      await axios.put(`${api}/birds/${bird._id}/${action}`, {}, { headers })
      toast.success(action === "death" ? "Death recorded" : "Sale recorded")
      fetchBirds()
    } catch {
      toast.error("Action failed")
    }
  }

  const handleDelete = async (bird) => {
    if (!window.confirm(`Delete batch "${bird.name}"? This cannot be undone.`)) return
    try {
      await axios.delete(`${api}/birds/${bird._id}`, { headers })
      toast.success("Batch deleted")
      fetchBirds()
    } catch {
      toast.error("Failed to delete batch")
    }
  }

  const getSurvivalColor = (bird) => {
    if (!bird.initialCount) return "var(--color-border)"
    const rate = ((bird.currentCount || 0) / bird.initialCount) * 100
    if (rate > 95) return "var(--color-success)"
    if (rate > 85) return "var(--color-warning)"
    return "var(--color-danger)"
  }

  const getSurvivalRate = (bird) => {
    if (!bird.initialCount) return 0
    return (((bird.currentCount || 0) / bird.initialCount) * 100).toFixed(1)
  }

  if (loading) return <Loading message="Loading bird batches..." />

  return (
    <div className="birdtracker-wrapper">
      <div className="birdtracker-header">
        <h2>Bird Tracker</h2>
        <button className="btn-primary birdtracker-add-btn" onClick={openAddModal}>
          + Add Batch
        </button>
      </div>

      <div className="birdtracker-summary">
        <div className="birdtracker-summary-item">
          <span className="birdtracker-summary-icon">🐔</span>
          <div>
            <div className="birdtracker-summary-label">Total Birds</div>
            <div className="birdtracker-summary-value">{summary.total}</div>
          </div>
        </div>
        <div className="birdtracker-summary-item">
          <span className="birdtracker-summary-icon">💀</span>
          <div>
            <div className="birdtracker-summary-label">Total Deaths</div>
            <div className="birdtracker-summary-value" style={{ color: "var(--color-danger)" }}>{summary.deaths}</div>
          </div>
        </div>
        <div className="birdtracker-summary-item">
          <span className="birdtracker-summary-icon">💰</span>
          <div>
            <div className="birdtracker-summary-label">Total Sold</div>
            <div className="birdtracker-summary-value" style={{ color: "var(--color-success)" }}>{summary.sold}</div>
          </div>
        </div>
        <div className="birdtracker-summary-item">
          <span className="birdtracker-summary-icon">📊</span>
          <div>
            <div className="birdtracker-summary-label">Survival Rate</div>
            <div className="birdtracker-summary-value">{summary.survivalRate}%</div>
          </div>
        </div>
      </div>

      {birds.length === 0 ? (
        <div className="birdtracker-empty">
          <p className="no-data">No bird batches yet. Click &quot;Add Batch&quot; to get started.</p>
        </div>
      ) : (
        <div className="birdtracker-grid">
          {birds.map((bird) => (
            <div key={bird._id} className="birdtracker-card">
              <div className="birdtracker-card-header" style={{ borderLeftColor: getSurvivalColor(bird) }}>
                <h3 className="birdtracker-card-title">{bird.name}</h3>
                <span className="birdtracker-badge">{bird.breed || "Unknown"}</span>
              </div>
              <div className="birdtracker-card-body">
                <div className="birdtracker-card-row">
                  <span className="birdtracker-card-label">Initial</span>
                  <span className="birdtracker-card-value">{bird.initialCount}</span>
                </div>
                <div className="birdtracker-card-row">
                  <span className="birdtracker-card-label">Current</span>
                  <span className="birdtracker-card-value" style={{ fontWeight: 700 }}>{bird.currentCount}</span>
                </div>
                <div className="birdtracker-card-row">
                  <span className="birdtracker-card-label">Deaths</span>
                  <span className="birdtracker-card-value" style={{ color: "var(--color-danger)" }}>{bird.deaths || 0}</span>
                </div>
                <div className="birdtracker-card-row">
                  <span className="birdtracker-card-label">Sold</span>
                  <span className="birdtracker-card-value" style={{ color: "var(--color-success)" }}>{bird.sold || 0}</span>
                </div>
                <div className="birdtracker-card-row">
                  <span className="birdtracker-card-label">Survival</span>
                  <span className="birdtracker-card-value" style={{ color: getSurvivalColor(bird), fontWeight: 700 }}>
                    {getSurvivalRate(bird)}%
                  </span>
                </div>
              </div>
              <div className="birdtracker-card-footer">
                <button className="birdtracker-action-death" onClick={() => handleQuickAction(bird, "death")}>+ Death</button>
                <button className="birdtracker-action-sold" onClick={() => handleQuickAction(bird, "sold")}>+ Sold</button>
                <button className="btn-edit" onClick={() => openEditModal(bird)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(bird)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBird ? "Edit Batch" : "Add Batch"} size="sm">
        <div className="form-group">
          <label>Batch Name</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Batch A" />
        </div>
        <div className="form-group">
          <label>Breed</label>
          <select value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })}>
            {BREEDS.map((b) => (<option key={b} value={b}>{b}</option>))}
          </select>
        </div>
        <div className="form-group">
          <label>Initial Count</label>
          <input type="number" value={formData.initialCount} onChange={(e) => setFormData({ ...formData, initialCount: e.target.value })} placeholder="e.g., 500" min="1" />
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes" />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ marginTop: 12 }}>
          {submitting ? "Saving..." : editingBird ? "Update Batch" : "Add Batch"}
        </button>
      </Modal>
    </div>
  )
}

BirdTracker.propTypes = {
  seasonId: PropTypes.string,
}

export default BirdTracker
