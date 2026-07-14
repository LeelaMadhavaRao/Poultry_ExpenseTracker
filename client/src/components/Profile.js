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

  useEffect(() => {
    fetchProfile()
  }, [])

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
    return <div className="loading-container"><div className="spinner" /></div>
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{t("nav.profile")}</h2>
        <div className="profile-actions">
          {!isEditing ? (
            <>
              <button className="btn-secondary" onClick={() => setShowPasswordModal(true)}>
                {t("auth.changePassword")}
              </button>
              <button className="btn-primary" onClick={handleEdit}>
                {t("profile.editProfile")}
              </button>
            </>
          ) : (
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSave} disabled={loading}>
                {loading ? t("general.loading") : t("form.save")}
              </button>
              <button className="btn-cancel" onClick={handleCancel}>
                {t("form.cancel")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-placeholder">{profileData.fullName?.charAt(0)?.toUpperCase()}</div>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label>{t("auth.fullName")}</label>
              {isEditing ? (
                <input type="text" name="fullName" value={editForm.fullName || ""} onChange={handleChange} />
              ) : (
                <span className="profile-value">{profileData.fullName}</span>
              )}
            </div>
            <div className="form-group">
              <label>{t("auth.email")}</label>
              {isEditing ? (
                <input type="email" name="email" value={editForm.email || ""} onChange={handleChange} />
              ) : (
                <span className="profile-value">{profileData.email}</span>
              )}
            </div>
            <div className="form-group">
              <label>{t("auth.phone")}</label>
              {isEditing ? (
                <input type="tel" name="phoneNumber" value={editForm.phoneNumber || ""} onChange={handleChange} />
              ) : (
                <span className="profile-value">{profileData.phoneNumber}</span>
              )}
            </div>
            <div className="form-group">
              <label>Username</label>
              {isEditing ? (
                <input type="text" name="username" value={editForm.username || ""} onChange={handleChange} />
              ) : (
                <span className="profile-value">{profileData.username}</span>
              )}
            </div>
            <div className="form-group">
              <label>Farm Name</label>
              {isEditing ? (
                <input type="text" name="farmName" value={editForm.farmName || ""} onChange={handleChange} />
              ) : (
                <span className="profile-value">{profileData.farmName}</span>
              )}
            </div>
            <div className="form-group">
              <label>Location</label>
              {isEditing ? (
                <input type="text" name="location" value={editForm.location || ""} onChange={handleChange} />
              ) : (
                <span className="profile-value">{profileData.location}</span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-actions-bottom">
          <button className="btn-danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

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
        <button className="btn-primary" onClick={handlePasswordChange} disabled={loading}>
          {loading ? "Changing..." : "Change Password"}
        </button>
      </Modal>
    </div>
  )
}

Profile.propTypes = {
  onLogout: PropTypes.func.isRequired,
}

export default Profile
