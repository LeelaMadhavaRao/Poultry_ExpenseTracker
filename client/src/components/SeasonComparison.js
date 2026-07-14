import { useState, useCallback } from "react"
import PropTypes from "prop-types"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import Loading from "./common/Loading"

const INCOME_COLOR = "#27ae60"
const PROFIT_COLOR = "#2d6a4f"

const formatCurrency = (value) => `₹${Math.abs(value).toLocaleString("en-IN")}`

const ComparisonTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div
      style={{
        background: "var(--color-surface, #fff)",
        border: "1px solid var(--color-border, #e0e7de)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color, margin: 0 }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

ComparisonTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
}

const SeasonComparison = ({ seasons, getSeasonData }) => {
  const [seasonAId, setSeasonAId] = useState("")
  const [seasonBId, setSeasonBId] = useState("")
  const [dataA, setDataA] = useState(null)
  const [dataB, setDataB] = useState(null)
  const [loading, setLoading] = useState(false)
  const [compared, setCompared] = useState(false)
  const [error, setError] = useState("")

  const seasonA = seasons.find((s) => s._id === seasonAId) || null
  const seasonB = seasons.find((s) => s._id === seasonBId) || null

  const handleCompare = useCallback(async () => {
    if (!seasonAId || !seasonBId) {
      setError("Please select both seasons to compare.")
      return
    }
    if (seasonAId === seasonBId) {
      setError("Please select two different seasons.")
      return
    }

    setError("")
    setLoading(true)
    setCompared(false)

    try {
      const [resultA, resultB] = await Promise.all([
        getSeasonData(seasonAId),
        getSeasonData(seasonBId),
      ])
      setDataA(resultA)
      setDataB(resultB)
      setCompared(true)
    } catch (err) {
      setError("Failed to load season data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [seasonAId, seasonBId, getSeasonData])

  const computeMetrics = (data) => {
    if (!data) return null
    const { incomes = [], expenses = [] } = data

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalIncome - totalExpense
    const incomeCount = incomes.length
    const expenseCount = expenses.length
    const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0
    const avgExpense = expenseCount > 0 ? totalExpense / expenseCount : 0

    return { totalIncome, totalExpense, netProfit, incomeCount, expenseCount, avgIncome, avgExpense }
  }

  const metricsA = computeMetrics(dataA)
  const metricsB = computeMetrics(dataB)

  const chartData =
    metricsA && metricsB
      ? [
          {
            name: "Total Income",
            "Season A": metricsA.totalIncome,
            "Season B": metricsB.totalIncome,
          },
          {
            name: "Total Expense",
            "Season A": metricsA.totalExpense,
            "Season B": metricsB.totalExpense,
          },
          {
            name: "Net Profit/Loss",
            "Season A": metricsA.netProfit,
            "Season B": metricsB.netProfit,
          },
        ]
      : []

  const renderMetricRow = (label, valueA, valueB, isCurrency = true) => {
    const diff = valueB - valueA
    const diffClass = diff > 0 ? "positive" : diff < 0 ? "negative" : ""

    const formatValue = (v) => (isCurrency ? formatCurrency(v) : Math.round(v).toString())

    return (
      <div className="comparison-row" key={label}>
        <span className="comparison-metric">{label}</span>
        <span className={`comparison-value ${dataA ? "" : "muted"}`}>
          {isCurrency && valueA < 0 ? "-" : ""}{formatValue(Math.abs(valueA))}
        </span>
        <span className={`comparison-value ${dataB ? "" : "muted"}`}>
          {isCurrency && valueB < 0 ? "-" : ""}{formatValue(Math.abs(valueB))}
        </span>
        <span className={`comparison-value ${diffClass}`}>
          {diff > 0 ? "+" : ""}{isCurrency ? formatCurrency(diff) : diff.toFixed(2)}
        </span>
      </div>
    )
  }

  return (
    <div className="season-comparison">
      <div className="comparison-header">
        <h2>Season Comparison</h2>
        <p>Compare financial performance between two seasons</p>
      </div>

      <div className="comparison-controls">
        <div className="comparison-select-group">
          <label htmlFor="seasonA">Season A</label>
          <select id="seasonA" value={seasonAId} onChange={(e) => setSeasonAId(e.target.value)}>
            <option value="">-- Select Season A --</option>
            {seasons.map((season) => (
              <option key={`a-${season._id}`} value={season._id}>
                {season.name} ({season.isActive ? "Active" : "Ended"})
              </option>
            ))}
          </select>
          {seasonA && (
            <span className="season-meta">
              {new Date(seasonA.startDate).toISOString().split("T")[0]}
              {seasonA.endDate && ` → ${new Date(seasonA.endDate).toISOString().split("T")[0]}`}
            </span>
          )}
        </div>

        <div className="comparison-select-group">
          <label htmlFor="seasonB">Season B</label>
          <select id="seasonB" value={seasonBId} onChange={(e) => setSeasonBId(e.target.value)}>
            <option value="">-- Select Season B --</option>
            {seasons.map((season) => (
              <option key={`b-${season._id}`} value={season._id}>
                {season.name} ({season.isActive ? "Active" : "Ended"})
              </option>
            ))}
          </select>
          {seasonB && (
            <span className="season-meta">
              {new Date(seasonB.startDate).toISOString().split("T")[0]}
              {seasonB.endDate && ` → ${new Date(seasonB.endDate).toISOString().split("T")[0]}`}
            </span>
          )}
        </div>

        <button className="btn-primary compare-btn" onClick={handleCompare} disabled={loading}>
          {loading ? "Loading..." : "Compare"}
        </button>
      </div>

      {error && <div className="comparison-error">{error}</div>}

      {loading && <Loading type="spinner" message="Loading season data..." />}

      {compared && metricsA && metricsB && (
        <div className="comparison-results">
          <div className="comparison-card">
            <h3>Comparison Table</h3>
            <div className="comparison-table-header">
              <span className="comparison-metric">Metric</span>
              <span className="comparison-value">{seasonA?.name || "Season A"}</span>
              <span className="comparison-value">{seasonB?.name || "Season B"}</span>
              <span className="comparison-value">Difference</span>
            </div>
            {renderMetricRow("Total Income", metricsA.totalIncome, metricsB.totalIncome)}
            {renderMetricRow("Total Expense", metricsA.totalExpense, metricsB.totalExpense)}
            {renderMetricRow("Net Profit/Loss", metricsA.netProfit, metricsB.netProfit)}
            {renderMetricRow("Income Entries", metricsA.incomeCount, metricsB.incomeCount, false)}
            {renderMetricRow("Expense Entries", metricsA.expenseCount, metricsB.expenseCount, false)}
            {renderMetricRow("Avg Income per Entry", metricsA.avgIncome, metricsB.avgIncome)}
            {renderMetricRow("Avg Expense per Entry", metricsA.avgExpense, metricsB.avgExpense)}
          </div>

          <div className="comparison-card">
            <h3>Side-by-Side Comparison</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e0e7de)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ComparisonTooltip />} />
                <Legend />
                <Bar
                  dataKey="Season A"
                  name={seasonA?.name || "Season A"}
                  fill={INCOME_COLOR}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Season B"
                  name={seasonB?.name || "Season B"}
                  fill={PROFIT_COLOR}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

SeasonComparison.propTypes = {
  seasons: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string,
      isActive: PropTypes.bool,
    })
  ).isRequired,
  getSeasonData: PropTypes.func.isRequired,
}

export default SeasonComparison
