"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import PropTypes from "prop-types"
import api from "./Api/api"
import Modal from "./common/Modal"
import Loading from "./common/Loading"

const UNITS = ["kg", "quintal", "bag"]
const CATEGORIES = ["feed", "medicine", "supplement", "other"]

const injectCSS = `
.feedtracker-wrapper { padding: 20px; max-width: 1200px; margin: 0 auto; }
.feedtracker-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.feedtracker-header h2 { font-family: 'Sora', sans-serif; font-size: 24px; color: var(--color-text); margin: 0; }
.feedtracker-add-btn { width: auto !important; padding: 10px 24px !important; }
.feedtracker-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.feedtracker-summary-card { background: var(--color-surface); border-radius: var(--radius-md); padding: 18px; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 12px; }
.feedtracker-summary-icon { font-size: 28px; flex-shrink: 0; }
.feedtracker-summary-label { font-size: 12px; color: var(--color-text-muted); font-family: 'Manrope', sans-serif; margin-bottom: 2px; }
.feedtracker-summary-value { font-size: 20px; font-weight: 700; font-family: 'Sora', sans-serif; color: var(--color-text); }
.feedtracker-summary-value.accent { color: var(--color-primary); }
.feedtracker-tabs { display: flex; gap: 0; margin-bottom: 20px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--color-border); }
.feedtracker-tab { flex: 1; padding: 12px 20px; border: none; background: var(--color-surface); color: var(--color-text-muted); cursor: pointer; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 600; transition: all var(--transition); }
.feedtracker-tab:hover { background: var(--color-bg); }
.feedtracker-tab.active { background: var(--color-primary); color: #fff; }
.feedtracker-panel { background: var(--color-surface); border-radius: var(--radius-md); padding: 24px; box-shadow: var(--shadow-sm); }
.feedtracker-form-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; align-items: end; }
.feedtracker-empty { text-align: center; padding: 40px; color: var(--color-text-muted); font-family: 'Manrope', sans-serif; }
.feedtracker-daily-summary { background: var(--color-bg); border-radius: var(--radius-sm); padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-family: 'Manrope', sans-serif; }
.feedtracker-daily-summary strong { font-size: 16px; color: var(--color-text); }
.feedtracker-icon-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 2px 6px; }

@media (max-width: 1023px) {
  .feedtracker-form-row { grid-template-columns: repeat(2, 1fr); }
  .feedtracker-summary { grid-template-columns: repeat(3, 1fr); gap: 10px; }
}
@media (max-width: 767px) {
  .feedtracker-wrapper { padding: 15px; }
  .feedtracker-header { flex-direction: column; align-items: stretch; }
  .feedtracker-header h2 { font-size: 20px; }
  .feedtracker-tabs { flex-direction: column; border-radius: var(--radius-sm); }
  .feedtracker-tab { text-align: center; }
  .feedtracker-form-row { grid-template-columns: 1fr; }
  .feedtracker-summary { grid-template-columns: 1fr; }
  .feedtracker-summary-card { padding: 14px; }
  .feedtracker-panel { padding: 16px; }
}
@media (max-width: 480px) {
  .feedtracker-summary-value { font-size: 16px; }
  .feedtracker-summary-icon { font-size: 22px; }
}
`

if (typeof document !== "undefined") {
  const styleId = "feedtracker-styles"
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style")
    styleEl.id = styleId
    styleEl.textContent = injectCSS
    document.head.appendChild(styleEl)
  }
}

const FeedTracker = ({ seasonId }) => {
  const [activeTab, setActiveTab] = useState("catalog")
  const [loading, setLoading] = useState(false)
  const [feedItems, setFeedItems] = useState([])
  const [usageEntries, setUsageEntries] = useState([])
  const [feedSummary, setFeedSummary] = useState({ totalFeed: 0, totalMedicine: 0, grandTotal: 0 })

  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemForm, setItemForm] = useState({ name: "", unit: "kg", currentPricePerUnit: "", category: "feed" })
  const [itemSubmitting, setItemSubmitting] = useState(false)

  const [usageForm, setUsageForm] = useState({ feedItemId: "", date: new Date().toISOString().split("T")[0], quantity: "", pricePerUnit: "", notes: "" })
  const [usageSubmitting, setUsageSubmitting] = useState(false)
  const [editingUsage, setEditingUsage] = useState(null)

  const headers = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }), [])

  const fetchFeedData = useCallback(async () => {
    if (!seasonId) return
    setLoading(true)
    try {
      const [itemsRes, usageRes, summaryRes] = await Promise.all([
        axios.get(`${api}/feed-items?seasonId=${seasonId}`, { headers }),
        axios.get(`${api}/feed-usage?seasonId=${seasonId}`, { headers }),
        axios.get(`${api}/feed-summary?seasonId=${seasonId}`, { headers }),
      ])
      setFeedItems(Array.isArray(itemsRes.data) ? itemsRes.data : [])
      setUsageEntries(Array.isArray(usageRes.data) ? usageRes.data : [])
      if (summaryRes.data) {
        setFeedSummary({
          totalFeed: summaryRes.data.totalFeedCost || 0,
          totalMedicine: summaryRes.data.totalMedicineCost || 0,
          grandTotal: summaryRes.data.grandTotal || 0,
        })
      }
    } catch {
      toast.error("Failed to load feed data")
    } finally {
      setLoading(false)
    }
  }, [seasonId, headers])

  useEffect(() => {
    fetchFeedData()
  }, [fetchFeedData])

  const selectedFeedItem = feedItems.find((fi) => fi._id === usageForm.feedItemId)

  const handleFeedItemSelect = (itemId) => {
    const item = feedItems.find((fi) => fi._id === itemId)
    setUsageForm((prev) => ({
      ...prev,
      feedItemId: itemId,
      pricePerUnit: item ? String(item.currentPricePerUnit ?? "") : prev.pricePerUnit,
    }))
  }

  const resetItemForm = () => {
    setItemForm({ name: "", unit: "kg", currentPricePerUnit: "", category: "feed" })
    setEditingItem(null)
  }

  const openAddItemModal = () => { resetItemForm(); setShowItemModal(true) }
  const openEditItemModal = (item) => {
    setEditingItem(item)
    setItemForm({
      name: item.name || "",
      unit: item.unit || "kg",
      currentPricePerUnit: String(item.currentPricePerUnit ?? ""),
      category: item.category || "feed",
    })
    setShowItemModal(true)
  }

  const handleItemSubmit = async () => {
    if (!itemForm.name.trim()) { toast.error("Name is required"); return }
    if (!itemForm.currentPricePerUnit || Number.parseFloat(itemForm.currentPricePerUnit) < 0) { toast.error("Enter a valid price"); return }
    setItemSubmitting(true)
    try {
      const payload = { ...itemForm, currentPricePerUnit: Number.parseFloat(itemForm.currentPricePerUnit), seasonId }
      if (editingItem) {
        await axios.put(`${api}/feed-items/${editingItem._id}`, payload, { headers })
        toast.success("Feed item updated")
      } else {
        await axios.post(`${api}/feed-items`, payload, { headers })
        toast.success("Feed item added")
      }
      setShowItemModal(false)
      fetchFeedData()
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save item")
    } finally {
      setItemSubmitting(false)
    }
  }

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return
    try {
      await axios.delete(`${api}/feed-items/${item._id}`, { headers })
      toast.success("Item deleted")
      fetchFeedData()
    } catch {
      toast.error("Failed to delete item")
    }
  }

  const handleUsageSubmit = async () => {
    if (!usageForm.feedItemId) { toast.error("Select a feed item"); return }
    if (!usageForm.quantity || Number.parseFloat(usageForm.quantity) <= 0) { toast.error("Enter a valid quantity"); return }
    setUsageSubmitting(true)
    try {
      const payload = {
        feedItemId: usageForm.feedItemId,
        date: usageForm.date,
        quantity: Number.parseFloat(usageForm.quantity),
        pricePerUnit: usageForm.pricePerUnit ? Number.parseFloat(usageForm.pricePerUnit) : undefined,
        notes: usageForm.notes,
        seasonId,
      }
      if (editingUsage) {
        await axios.put(`${api}/feed-usage/${editingUsage._id}`, payload, { headers })
        toast.success("Usage entry updated")
      } else {
        await axios.post(`${api}/feed-usage`, payload, { headers })
        toast.success("Usage logged")
      }
      setUsageForm({ feedItemId: "", date: new Date().toISOString().split("T")[0], quantity: "", pricePerUnit: "", notes: "" })
      setEditingUsage(null)
      fetchFeedData()
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to log usage")
    } finally {
      setUsageSubmitting(false)
    }
  }

  const handleEditUsage = (entry) => {
    setEditingUsage(entry)
    setUsageForm({
      feedItemId: entry.feedItemId?._id || entry.feedItemId || "",
      date: entry.date ? new Date(entry.date).toISOString().split("T")[0] : "",
      quantity: String(entry.quantity ?? ""),
      pricePerUnit: String(entry.pricePerUnit ?? ""),
      notes: entry.notes || "",
    })
  }

  const handleDeleteUsage = async (entry) => {
    if (!window.confirm("Delete this usage entry?")) return
    try {
      await axios.delete(`${api}/feed-usage/${entry._id}`, { headers })
      toast.success("Usage entry deleted")
      fetchFeedData()
    } catch {
      toast.error("Failed to delete entry")
    }
  }

  const sortedUsage = [...usageEntries].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (loading) return <Loading message="Loading feed data..." />

  return (
    <div className="feedtracker-wrapper">
      <div className="feedtracker-header">
        <h2>Feed Tracker</h2>
        {activeTab === "catalog" && (
          <button className="btn-primary feedtracker-add-btn" onClick={openAddItemModal}>
            + Add Feed Item
          </button>
        )}
      </div>

      <div className="feedtracker-summary">
        <div className="feedtracker-summary-card">
          <span className="feedtracker-summary-icon">🌾</span>
          <div>
            <div className="feedtracker-summary-label">Total Feed Cost</div>
            <div className="feedtracker-summary-value">₹{feedSummary.totalFeed.toLocaleString()}</div>
          </div>
        </div>
        <div className="feedtracker-summary-card">
          <span className="feedtracker-summary-icon">💊</span>
          <div>
            <div className="feedtracker-summary-label">Total Medicine Cost</div>
            <div className="feedtracker-summary-value">₹{feedSummary.totalMedicine.toLocaleString()}</div>
          </div>
        </div>
        <div className="feedtracker-summary-card">
          <span className="feedtracker-summary-icon">🧾</span>
          <div>
            <div className="feedtracker-summary-label">Grand Total</div>
            <div className="feedtracker-summary-value accent">₹{feedSummary.grandTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="feedtracker-tabs">
        <button className={`feedtracker-tab ${activeTab === "catalog" ? "active" : ""}`} onClick={() => setActiveTab("catalog")}>
          Feed Items Catalog
        </button>
        <button className={`feedtracker-tab ${activeTab === "usage" ? "active" : ""}`} onClick={() => setActiveTab("usage")}>
          Daily Usage Log
        </button>
      </div>

      {activeTab === "catalog" && (
        <div className="feedtracker-panel">
          {feedItems.length === 0 ? (
            <div className="feedtracker-empty">No feed items yet. Click &quot;+ Add Feed Item&quot; to get started.</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Unit</th>
                    <th>Price/Unit</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feedItems.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.unit}</td>
                      <td>₹{Number(item.currentPricePerUnit || 0).toLocaleString()}</td>
                      <td style={{ textTransform: "capitalize" }}>{item.category}</td>
                      <td>
                        <button className="btn-edit" onClick={() => openEditItemModal(item)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteItem(item)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "usage" && (
        <div className="feedtracker-panel">
          <div className="feedtracker-form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Feed Item</label>
              <select value={usageForm.feedItemId} onChange={(e) => handleFeedItemSelect(e.target.value)}>
                <option value="">-- Select --</option>
                {feedItems.map((fi) => (
                  <option key={fi._id} value={fi._id}>{fi.name} ({fi.unit})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Date</label>
              <input type="date" value={usageForm.date} onChange={(e) => setUsageForm({ ...usageForm, date: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Quantity</label>
              <input type="number" value={usageForm.quantity} onChange={(e) => setUsageForm({ ...usageForm, quantity: e.target.value })} placeholder="Qty" min="0" step="0.01" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Price/Unit ({selectedFeedItem?.unit || ""})</label>
              <input type="number" value={usageForm.pricePerUnit} onChange={(e) => setUsageForm({ ...usageForm, pricePerUnit: e.target.value })} placeholder="Auto-filled" min="0" step="0.01" />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input type="text" value={usageForm.notes} onChange={(e) => setUsageForm({ ...usageForm, notes: e.target.value })} placeholder="Optional" />
          </div>
          <button className="btn-primary" onClick={handleUsageSubmit} disabled={usageSubmitting} style={{ width: "auto", padding: "10px 32px" }}>
            {usageSubmitting ? "Saving..." : editingUsage ? "Update Entry" : "Log Usage"}
          </button>
          {editingUsage && (
            <button className="btn-cancel" onClick={() => { setEditingUsage(null); setUsageForm({ feedItemId: "", date: new Date().toISOString().split("T")[0], quantity: "", pricePerUnit: "", notes: "" }) }} style={{ marginLeft: 8, padding: "8px 16px" }}>
              Cancel Edit
            </button>
          )}

          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, marginBottom: 12, color: "var(--color-text)" }}>Usage History</h3>
            {sortedUsage.length === 0 ? (
              <div className="feedtracker-empty">No usage entries logged yet.</div>
            ) : (
              <>
                <div className="feedtracker-daily-summary">
                  <span>
                    <strong>Today&apos;s Cost:</strong> ₹
                    {sortedUsage
                      .filter((u) => u.date && new Date(u.date).toISOString().split("T")[0] === new Date().toISOString().split("T")[0])
                      .reduce((sum, u) => sum + (u.quantity || 0) * (u.pricePerUnit || 0), 0)
                      .toLocaleString()}
                  </span>
                  <span>
                    <strong>Total Entries:</strong> {sortedUsage.length}
                  </span>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price/Unit</th>
                        <th>Cost</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsage.map((entry) => {
                        const itemName = entry.feedItemId?.name || entry.itemName || "—"
                        const cost = (entry.quantity || 0) * (entry.pricePerUnit || 0)
                        return (
                          <tr key={entry._id}>
                            <td>{entry.date ? new Date(entry.date).toISOString().split("T")[0] : "—"}</td>
                            <td>{itemName}</td>
                            <td>{entry.quantity}</td>
                            <td>₹{Number(entry.pricePerUnit || 0).toLocaleString()}</td>
                            <td className="amount negative">₹{cost.toLocaleString()}</td>
                            <td>{entry.notes || "—"}</td>
                            <td>
                              <button className="btn-edit" onClick={() => handleEditUsage(entry)}>Edit</button>
                              <button className="btn-delete" onClick={() => handleDeleteUsage(entry)}>Del</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={showItemModal} onClose={() => setShowItemModal(false)} title={editingItem ? "Edit Feed Item" : "Add Feed Item"} size="sm">
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="e.g., Maize Feed" />
        </div>
        <div className="form-group">
          <label>Unit</label>
          <select value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}>
            {UNITS.map((u) => (<option key={u} value={u}>{u}</option>))}
          </select>
        </div>
        <div className="form-group">
          <label>Current Price Per Unit</label>
          <input type="number" value={itemForm.currentPricePerUnit} onChange={(e) => setItemForm({ ...itemForm, currentPricePerUnit: e.target.value })} placeholder="0.00" min="0" step="0.01" />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}>
            {CATEGORIES.map((c) => (<option key={c} value={c} style={{ textTransform: "capitalize" }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>))}
          </select>
        </div>
        <button className="btn-primary" onClick={handleItemSubmit} disabled={itemSubmitting} style={{ marginTop: 12 }}>
          {itemSubmitting ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
        </button>
      </Modal>
    </div>
  )
}

FeedTracker.propTypes = {
  seasonId: PropTypes.string,
}

export default FeedTracker
