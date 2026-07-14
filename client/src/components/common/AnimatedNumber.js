import { useState, useEffect, useRef, useCallback } from "react"
import PropTypes from "prop-types"

const AnimatedNumber = ({ value, duration = 1000, prefix = "₹ ", format = true }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)
  const prevDisplayRef = useRef(0)

  useEffect(() => {
    prevDisplayRef.current = displayValue
  })

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

    const startValue = prevDisplayRef.current
    startTimeRef.current = null

    const targetValue = Number(value) || 0
    if (targetValue === startValue) {
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

      const current = startValue + (targetValue - startValue) * eased
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  const formattedDisplay =
    displayValue >= 1000
      ? formatNumber(Math.round(displayValue))
      : formatNumber(Math.round(displayValue * 100) / 100)

  return (
    <span className="animated-number">
      {prefix}
      {formattedDisplay}
    </span>
  )
}

AnimatedNumber.propTypes = {
  value: PropTypes.number.isRequired,
  duration: PropTypes.number,
  prefix: PropTypes.string,
  format: PropTypes.bool,
}

export default AnimatedNumber
