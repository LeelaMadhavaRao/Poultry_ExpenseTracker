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

const categoryBadgeColors = {
  feed: { bg: "#14b8a6", text: "#fff" },
  medicine: { bg: "#f97316", text: "#fff" },
  supplement: { bg: "#8b5cf6", text: "#fff" },
  other: { bg: "#6b7280", text: "#fff" },
}

const injectCSS = `
.ft-wrapper { padding: 20px; max-width: 1200px; margin: 0 auto; }
.ft-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 12px; }
.ft-header h2 { font-family: var(--font-display); font-size: 24px; color: var(--color-text); margin: 0; }

.ft-tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 2px solid var(--color-border); }
.ft-tab { padding: 12px 24px; border: none; background: none; color: var(--color-text-muted); cursor: pointer; font-family: var(--font-body); font-size: 14px; font-weight: 600; position: relative; transition: color var(--transition); }
.ft-tab:hover { color: var(--color-text); }
.ft-tab.active { color: var(--color-primary); }
.ft-tab.active::after { content: ""; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: var(--color-primary); border-radius: 2px 2px 0 0; }

.ft-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.ft-summary-card { padding: 18px; display: flex; align-items: center; gap: 14px; border-radius: var(--radius-lg); }
.ft-summary-icon-circle { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.ft-summary-icon-circle.feed { background: var(--color-primary-fixed); color: var(--color-primary-dark); }
.ft-summary-icon-circle.medicine { background: var(--color-error-container); color: var(--color-danger); }
.ft-summary-icon-circle.grand { background: rgba(255,255,255,0.2); color: #fff; }
.ft-summary-label { font-size: 12px; color: var(--color-text-muted); font-family: var(--font-body); margin-bottom: 3px; }
.ft-summary-value { font-size: 18px; font-weight: 700; font-family: var(--font-display); color: var(--color-text); }
.ft-summary-card.grand-total { background: var(--color-primary); color: #fff; }
.ft-summary-card.grand-total .ft-summary-label { color: rgba(255,255,255,0.75); }
.ft-summary-card.grand-total .ft-summary-value { color: #fff; }

.ft-panel { padding: 0; }
.ft-panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.ft-panel-head h3 { font-family: var(--font-display); font-size: 16px; color: var(--color-text); margin: 0; }

.ft-form-card { background: var(--color-surface-container-lowest); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-sm); border: 1px solid var(--color-border); margin-bottom: 20px; }
.ft-form-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; align-items: end; margin-bottom: 12px; }

.ft-empty { text-align: center; padding: 40px; color: var(--color-text-muted); font-family: var(--font-body); }

.ft-category-badge { display: inline-block; padding: 3px 12px; border-radius: 999px; font-size: 11px; font-weight: 600; text-transform: capitalize; }

.ft-icon-btn { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: var(--radius-sm); transition: background var(--transition); }
.ft-icon-btn:hover { background: var(--color-surface-container); }
.ft-icon-btn.edit { color: var(--color-secondary); }
.ft-icon-btn.delete { color: var(--color-danger); }

.ft-bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 24px; }
.ft-bento-card { padding: 18px; border-radius: var(--radius-lg); }
.ft-bento-card.efficiency { background: var(--color-primary-container); color: var(--color-on-primary-container); }
.ft-bento-card.stock { background: var(--color-error-container); color: var(--color-danger); }
.ft-bento-card.delivery { background: var(--color-surface-container-lowest); border-left: 4px solid var(--color-tertiary); box-shadow: var(--shadow-sm); border-top: 1px solid var(--color-border); border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
.ft-bento-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; opacity: 0.85; }
.ft-bento-value { font-size: 20px; font-weight: 700; font-family: var(--font-display); }
.ft-bento-sub { font-size: 12px; margin-top: 4px; opacity: 0.8; }

.ft-load-more { text-align: center; margin-top: 16px; }

@media (max-width: 1023px) {
  .ft-form-row { grid-template-columns: repeat(2, 1fr); }
  .ft-bento { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 767px) {
  .ft-wrapper { padding: 15px; }
  .ft-header { flex-direction: column; align-items: stretch; }
  .ft-header h2 { font-size: 20px; }
  .ft-tabs { flex-direction: column; border-bottom: none; }
  .ft-tab { text-align: center; border-bottom: 1px solid var(--color-border); }
  .ft-tab.active::after { display: none; }
  .ft-tab.active { background: var(--color-primary-fixed); }
  .ft-summary { grid-template-columns: 1fr; }
  .ft-form-row { grid-template-columns: 1fr; }
  .ft-bento { grid-template-columns: 1fr; }
  .ft-panel-head { flex-direction: column; align-items: stretch; }
}
`

if (typeof document !== "undefined") {
  const styleId = "feedtracker-poultrypro-styles"
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

  const [visibleUsageCount, setVisibleUsageCount] = useState(10)

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

  useEffect(() => {
    setVisibleUsageCount(10)
  }, [activeTab])

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
  const visibleUsage = sortedUsage.slice(0, visibleUsageCount)
  const todayDate = new Date().toISOString().split("T")[0]
  const todayCost = sortedUsage
    .filter((u) => u.date && new Date(u.date).toISOString().split("T")[0] === todayDate)
    .reduce((sum, u) => sum + (u.quantity || 0) * (u.pricePerUnit || 0), 0)
  const totalUsageCost = sortedUsage.reduce((sum, u) => sum + (u.quantity || 0) * (u.pricePerUnit || 0), 0)
  const avgDailyCost = sortedUsage.length > 0 ? totalUsageCost / Math.max(1, new Set(sortedUsage.map((u) => u.date ? new Date(u.date).toISOString().split("T")[0] : "").filter(Boolean)).size) : 0
  const lowStockItems = feedItems.filter((fi) => sortedUsage.filter((u) => (u.feedItemId?._id || u.feedItemId) === fi._id).length === 0)

  if (loading) return <Loading message="Loading feed data..." />

  return (
    <div className="ft-wrapper">
      <div className="ft-tabs">
        <button className={`ft-tab ${activeTab === "catalog" ? "active" : ""}`} onClick={() => setActiveTab("catalog")}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: "middle", marginRight: 6 }}>inventory_2</span>
          Feed Items Catalog
        </button>
        <button className={`ft-tab ${activeTab === "usage" ? "active" : ""}`} onClick={() => setActiveTab("usage")}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: "middle", marginRight: 6 }}>receipt_long</span>
          Daily Usage Log
        </button>
      </div>

      <div className="ft-summary">
        <div className="ft-summary-card glass-card">
          <div className="ft-summary-icon-circle feed">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>nutrition</span>
          </div>
          <div>
            <div className="ft-summary-label">Total Feed Cost</div>
            <div className="ft-summary-value">₹{feedSummary.totalFeed.toLocaleString()}</div>
          </div>
        </div>
        <div className="ft-summary-card glass-card">
          <div className="ft-summary-icon-circle medicine">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>medical_services</span>
          </div>
          <div>
            <div className="ft-summary-label">Total Medicine Cost</div>
            <div className="ft-summary-value">₹{feedSummary.totalMedicine.toLocaleString()}</div>
          </div>
        </div>
        <div className="ft-summary-card glass-card grand-total">
          <div className="ft-summary-icon-circle grand">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>account_balance_wallet</span>
          </div>
          <div>
            <div className="ft-summary-label">Grand Total</div>
            <div className="ft-summary-value">₹{feedSummary.grandTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {activeTab === "catalog" && (
        <div className="ft-panel">
          <div className="ft-panel-head">
            <h3>Feed Items Catalog</h3>
            <button className="btn-secondary" onClick={openAddItemModal} style={{ padding: "10px 20px", height: "auto" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>add</span>
              Add New Item
            </button>
          </div>

          {feedItems.length === 0 ? (
            <div className="ft-empty">No feed items yet. Click &quot;Add New Item&quot; to get started.</div>
          ) : (
            <div className="table-container" style={{ background: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Unit</th>
                    <th>Price/Unit</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feedItems.map((item) => {
                    const badge = categoryBadgeColors[item.category] || categoryBadgeColors.other
                    return (
                      <tr key={item._id}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>{item.unit}</td>
                        <td>₹{Number(item.currentPricePerUnit || 0).toLocaleString()}</td>
                        <td>
                          <span className="ft-category-badge" style={{ background: badge.bg, color: badge.text }}>
                            {item.category}
                          </span>
                        </td>
                        <td>
                          <button className="ft-icon-btn edit" onClick={() => openEditItemModal(item)} title="Edit">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                          </button>
                          <button className="ft-icon-btn delete" onClick={() => handleDeleteItem(item)} title="Delete">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "usage" && (
        <div className="ft-panel">
          <div className="ft-form-card">
            <div className="ft-form-row">
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
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn-primary" onClick={handleUsageSubmit} disabled={usageSubmitting} style={{ width: "auto", padding: "10px 32px", height: "auto" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>save</span>
                {usageSubmitting ? "Saving..." : editingUsage ? "Update Entry" : "Record Entry"}
              </button>
              {editingUsage && (
                <button className="btn-cancel" onClick={() => { setEditingUsage(null); setUsageForm({ feedItemId: "", date: new Date().toISOString().split("T")[0], quantity: "", pricePerUnit: "", notes: "" }) }} style={{ padding: "8px 16px" }}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--color-text)", margin: 0 }}>Usage History</h3>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
              Today&apos;s Cost: <strong style={{ color: "var(--color-danger)" }}>₹{todayCost.toLocaleString()}</strong>
            </span>
          </div>

          {sortedUsage.length === 0 ? (
            <div className="ft-empty">No usage entries logged yet.</div>
          ) : (
            <>
              <div className="table-container" style={{ background: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price/Unit</th>
                      <th>Cost</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUsage.map((entry) => {
                      const itemName = entry.feedItemId?.name || entry.itemName || "—"
                      const cost = (entry.quantity || 0) * (entry.pricePerUnit || 0)
                      return (
                        <tr key={entry._id}>
                          <td>{entry.date ? new Date(entry.date).toISOString().split("T")[0] : "—"}</td>
                          <td style={{ fontWeight: 500 }}>{itemName}</td>
                          <td>{entry.quantity}</td>
                          <td>₹{Number(entry.pricePerUnit || 0).toLocaleString()}</td>
                          <td className="amount negative">₹{cost.toLocaleString()}</td>
                          <td>
                            <button className="ft-icon-btn edit" onClick={() => handleEditUsage(entry)} title="Edit">
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                            </button>
                            <button className="ft-icon-btn delete" onClick={() => handleDeleteUsage(entry)} title="Delete">
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {visibleUsageCount < sortedUsage.length && (
                <div className="ft-load-more">
                  <button className="btn-secondary" onClick={() => setVisibleUsageCount((prev) => prev + 10)} style={{ padding: "10px 24px", height: "auto" }}>
                    Load More Records ({sortedUsage.length - visibleUsageCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}

          <div className="ft-bento">
            <div className="ft-bento-card efficiency">
              <div className="ft-bento-title">Efficiency Insight</div>
              <div className="ft-bento-value">₹{Math.round(avgDailyCost).toLocaleString()}</div>
              <div className="ft-bento-sub">Avg. daily feed expenditure</div>
            </div>
            <div className="ft-bento-card stock">
              <div className="ft-bento-title">Stock Alert</div>
              <div className="ft-bento-value">{lowStockItems.length}</div>
              <div className="ft-bento-sub">Items with no usage yet</div>
            </div>
            <div className="ft-bento-card delivery">
              <div className="ft-bento-title" style={{ color: "var(--color-tertiary)" }}>Next Delivery</div>
              <div className="ft-bento-value" style={{ color: "var(--color-text)" }}>{feedItems.length}</div>
              <div className="ft-bento-sub" style={{ color: "var(--color-text-muted)" }}>Total items in catalog</div>
            </div>
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
