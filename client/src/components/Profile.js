"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import api from "./Api/api"

const Profile = ({ onLogout }) => {
  const [profileData, setProfileData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

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
      alert("Error fetching profile: " + (error.response?.data?.error || "Server error"))
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      const response = await axios.put(`${api}/users/profile`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setProfileData(response.data)
      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (error) {
      alert("Error updating profile: " + (error.response?.data?.error || "Server error"))
    }
  }

  const handleCancel = () => {
    setEditForm(profileData)
    setIsEditing(false)
  }

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    })
  }

  if (!profileData) {
    return <div>Loading...</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile</h2>
        <div className="profile-actions">
          {!isEditing ? (
            <button className="btn-primary" onClick={handleEdit}>
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSave}>
                Save
              </button>
              <button className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-placeholder">{profileData.fullName.charAt(0).toUpperCase()}</div>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              {isEditing ? (
                <input type="text" name="fullName" value={editForm.fullName} onChange={handleChange} required />
              ) : (
                <span className="profile-value">{profileData.fullName}</span>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              {isEditing ? (
                <input type="email" name="email" value={editForm.email} onChange={handleChange} required />
              ) : (
                <span className="profile-value">{profileData.email}</span>
              )}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              {isEditing ? (
                <input type="tel" name="phoneNumber" value={editForm.phoneNumber} onChange={handleChange} required />
              ) : (
                <span className="profile-value">{profileData.phoneNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label>Username</label>
              {isEditing ? (
                <input type="text" name="username" value={editForm.username} onChange={handleChange} required />
              ) : (
                <span className="profile-value">{profileData.username}</span>
              )}
            </div>

            <div className="form-group">
              <label>Farm Name</label>
              {isEditing ? (
                <input type="text" name="farmName" value={editForm.farmName} onChange={handleChange} required />
              ) : (
                <span className="profile-value">{profileData.farmName}</span>
              )}
            </div>

            <div className="form-group">
              <label>Location</label>
              {isEditing ? (
                <input type="text" name="location" value={editForm.location} onChange={handleChange} required />
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
    </div>
  )
}

export default Profile