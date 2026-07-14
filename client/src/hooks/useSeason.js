"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import api from "../components/Api/api"

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
})

const useSeason = () => {
  const [currentSeason, setCurrentSeason] = useState(null)
  const [allSeasons, setAllSeasons] = useState([])
  const [showSeasonForm, setShowSeasonForm] = useState(false)
  const [seasonFormData, setSeasonFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: null,
  })

  const fetchSeason = useCallback(async () => {
    try {
      const response = await axios.get(`${api}/seasons/current`, {
        headers: getAuthHeaders(),
      })
      setCurrentSeason(response.data)
      setShowSeasonForm(false)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        setShowSeasonForm(true)
        setCurrentSeason(null)
        console.log("No active season found, showing season form")
      } else {
        console.error("Error fetching season:", error)
        toast.error("Failed to load season data")
      }
      return null
    }
  }, [])

  const fetchAllSeasons = useCallback(async () => {
    try {
      const response = await axios.get(`${api}/seasons`, {
        headers: getAuthHeaders(),
      })
      setAllSeasons(response.data)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No seasons found for user")
        setAllSeasons([])
      } else {
        console.error("Error fetching all seasons:", error)
      }
      return []
    }
  }, [])

  const createSeason = useCallback(async (data) => {
    try {
      const response = await axios.post(
        `${api}/seasons`,
        { name: data.name, startDate: data.startDate, endDate: null },
        { headers: getAuthHeaders() }
      )
      setCurrentSeason(response.data)
      setAllSeasons((prev) => [...prev, response.data])
      setShowSeasonForm(false)
      setSeasonFormData({
        name: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: null,
      })
      toast.success("Season created successfully")
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || "Error creating season"
      toast.error(message)
      throw error
    }
  }, [])

  const endSeason = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to end this season? This action cannot be undone.")) {
      return null
    }
    try {
      const response = await axios.put(
        `${api}/seasons/${id}/end`,
        {},
        { headers: getAuthHeaders() }
      )
      setCurrentSeason(response.data)
      setAllSeasons((prev) =>
        prev.map((s) => (s._id === response.data._id ? response.data : s))
      )
      setShowSeasonForm(true)
      toast.success("Season ended")
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || "Error ending season"
      toast.error(message)
      throw error
    }
  }, [])

  const selectSeason = useCallback(
    async (id) => {
      const season = allSeasons.find((s) => s._id === id)
      if (season) {
        setCurrentSeason(season)
        return season
      }
      toast.error("Season not found")
      return null
    },
    [allSeasons]
  )

  return {
    currentSeason,
    allSeasons,
    showSeasonForm,
    seasonFormData,
    setShowSeasonForm,
    setSeasonFormData,
    fetchSeason,
    fetchAllSeasons,
    createSeason,
    endSeason,
    selectSeason,
  }
}

export default useSeason
