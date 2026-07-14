import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import PropTypes from "prop-types"
import api from "./Api/api"
import Modal from "./common/Modal"
import { useTranslation } from "../i18n/i18n"

const Profile = ({ onLogout }) => {
  const { t } = useTranslation()
  const [profileData, setProfileData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${api}/users/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setProfileData(response.data)
      setEditForm(response.data)
    } catch (error) {
      toast.error("Error fetching profile: " + (error.response?.data?.error || "Server error"))
    }
  }

  const handleEdit = () => setIsEditing(true)

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await axios.put(`${api}/users/profile`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setProfileData(response.data)
      setIsEditing(false)
      toast.success(t("profile.profileUpdated"))
    } catch (error) {
      toast.error("Error updating profile: " + (error.response?.data?.error || "Server error"))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditForm(profileData)
    setIsEditing(false)
  }

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("auth.passwordsNotMatch"))
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error(t("auth.passwordMinLength"))
      return
    }
    setLoading(true)
    try {
      await axios.put(
        `${api}/users/change-password`,
        { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      toast.success(t("profile.passwordChanged"))
      setShowPasswordModal(false)
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      toast.error(error.response?.data?.error || "Error changing password")
    } finally {
      setLoading(false)
    }
  }

  if (!profileData) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="pf-wrapper">
      {/* Header */}
      <div className="pf-header">
        <div>
          <h2 className="pf-heading">{t("nav.profile")}</h2>
        </div>
        <div className="pf-header-actions">
          {!isEditing ? (
            <>
              <button className="btn-secondary" onClick={() => setShowPasswordModal(true)} style={{ height: 40, fontSize: 13 }}>
                {t("auth.changePassword")}
              </button>
              <button className="btn-primary" onClick={handleEdit} style={{ height: 40, fontSize: 13 }}>
                {t("profile.editProfile")}
              </button>
            </>
          ) : (
            <>
              <button className="btn-save" onClick={handleSave} disabled={loading} style={{ height: 40, fontSize: 13 }}>
                {loading ? t("general.loading") : t("form.save")}
              </button>
              <button className="btn-cancel" onClick={handleCancel} style={{ height: 40, fontSize: 13 }}>
                {t("form.cancel")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="pf-card glass-card">
        <div className="pf-avatar-section">
          <div className="pf-avatar">
            {profileData.fullName?.charAt(0)?.toUpperCase()}
          </div>
        </div>
        <div className="pf-form-grid">
          <div className="form-group">
            <label>{t("auth.fullName")}</label>
            {isEditing ? (
              <input type="text" name="fullName" value={editForm.fullName || ""} onChange={handleChange} />
            ) : (
              <span className="pf-value">{profileData.fullName}</span>
            )}
          </div>
          <div className="form-group">
            <label>{t("auth.email")}</label>
            {isEditing ? (
              <input type="email" name="email" value={editForm.email || ""} onChange={handleChange} />
            ) : (
              <span className="pf-value">{profileData.email}</span>
            )}
          </div>
          <div className="form-group">
            <label>{t("auth.phone")}</label>
            {isEditing ? (
              <input type="tel" name="phoneNumber" value={editForm.phoneNumber || ""} onChange={handleChange} />
            ) : (
              <span className="pf-value">{profileData.phoneNumber}</span>
            )}
          </div>
          <div className="form-group">
            <label>Username</label>
            {isEditing ? (
              <input type="text" name="username" value={editForm.username || ""} onChange={handleChange} />
            ) : (
              <span className="pf-value">{profileData.username}</span>
            )}
          </div>
          <div className="form-group">
            <label>Farm Name</label>
            {isEditing ? (
              <input type="text" name="farmName" value={editForm.farmName || ""} onChange={handleChange} />
            ) : (
              <span className="pf-value">{profileData.farmName}</span>
            )}
          </div>
          <div className="form-group">
            <label>Location</label>
            {isEditing ? (
              <input type="text" name="location" value={editForm.location || ""} onChange={handleChange} />
            ) : (
              <span className="pf-value">{profileData.location}</span>
            )}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="pf-logout-section">
        <button className="pf-logout-btn" onClick={onLogout}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          Logout
        </button>
      </div>

      {/* Password Change Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password" size="sm">
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            placeholder="Enter current password"
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            placeholder="Min 6 characters"
          />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            placeholder="Re-enter new password"
          />
        </div>
        <button className="btn-primary" onClick={handlePasswordChange} disabled={loading} style={{ marginTop: 12, width: "100%" }}>
          {loading ? "Changing..." : "Change Password"}
        </button>
      </Modal>
    </div>
  )
}

const pfCSS = `
.pf-wrapper { padding: 24px; max-width: 720px; margin: 0 auto; }
.pf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.pf-heading { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--color-text); margin: 0; }
.pf-header-actions { display: flex; gap: 8px; }

.pf-card { padding: 32px; display: flex; gap: 32px; margin-bottom: 24px; }
.pf-avatar-section { flex-shrink: 0; }
.pf-avatar { width: 96px; height: 96px; border-radius: 50%; background: var(--color-primary-container); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; font-family: var(--font-display); }
.pf-form-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
.pf-value { padding: 12px 0; color: var(--color-text); font-weight: 500; font-size: 14px; display: block; }

.pf-logout-section { text-align: center; padding-top: 24px; }
.pf-logout-btn { display: inline-flex; align-items: center; gap: 8px; padding: 0 28px; background: var(--color-danger); color: #fff; border: none; border-radius: var(--radius-xl); font-family: var(--font-body); font-size: 14px; font-weight: 600; cursor: pointer; transition: all var(--transition); height: 44px; box-shadow: 0px 4px 12px rgba(186,26,26,0.2); }
.pf-logout-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0px 8px 20px rgba(186,26,26,0.3); }

@media (max-width: 640px) {
  .pf-wrapper { padding: 16px; }
  .pf-card { flex-direction: column; align-items: center; padding: 24px; }
  .pf-form-grid { grid-template-columns: 1fr; }
  .pf-header { flex-direction: column; align-items: stretch; }
  .pf-heading { font-size: 22px; }
  .pf-header-actions { justify-content: flex-end; }
}
`

if (typeof document !== "undefined") {
  const styleId = "profile-styles"
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style")
    styleEl.id = styleId
    styleEl.textContent = pfCSS
    document.head.appendChild(styleEl)
  }
}

Profile.propTypes = {
  onLogout: PropTypes.func.isRequired,
}

export default Profile
