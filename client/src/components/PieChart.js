const PieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="no-data">No data available</div>
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return <div className="no-data">No data available</div>
  }

  let cumulativePercentage = 0

  const createPath = (percentage, startAngle) => {
    const angle = (percentage / 100) * 360
    const endAngle = startAngle + angle

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)

    const largeArcFlag = angle > 180 ? 1 : 0

    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="pie-chart">
      <svg viewBox="0 0 100 100" className="pie-svg">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const startAngle = (cumulativePercentage / 100) * 360 - 90
          const path = createPath(percentage, startAngle)

          cumulativePercentage += percentage

          return <path key={index} d={path} fill={item.color} stroke="#fff" strokeWidth="0.5" />
        })}
      </svg>

      <div className="pie-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: item.color }}></div>
            <span className="legend-label">
              {item.name}: ₹{item.value.toLocaleString()} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PieChart
