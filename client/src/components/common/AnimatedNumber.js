"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import PropTypes from "prop-types"

const AnimatedNumber = ({ value, duration = 1000, prefix = "₹ ", format = true }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)
  const startValueRef = useRef(0)

  const formatNumber = useCallback(
    (num) => {
      if (!format) return num.toFixed(2)
      return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    },
    [format]
  )

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    startValueRef.current = displayValue
    startTimeRef.current = null

    const targetValue = Number(value) || 0
    if (targetValue === startValueRef.current) {
      setDisplayValue(targetValue)
      return
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      const eased = 1 - Math.pow(1 - progress, 3)

      const current =
        startValueRef.current + (targetValue - startValueRef.current) * eased
      setDisplayValue(current)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration])

  const formattedDisplay =
    displayValue >= 1000
      ? formatNumber(Math.round(displayValue))
      : formatNumber(Math.round(displayValue * 100) / 100)

  return (
    <span style={styles.number}>
      {prefix}
      {formattedDisplay}
    </span>
  )
}

const styles = {
  number: {
    fontFamily: "'Manrope', 'Segoe UI', sans-serif",
    fontVariantNumeric: "tabular-nums",
  },
}

AnimatedNumber.propTypes = {
  value: PropTypes.number.isRequired,
  duration: PropTypes.number,
  prefix: PropTypes.string,
  format: PropTypes.bool,
}

export default AnimatedNumber
