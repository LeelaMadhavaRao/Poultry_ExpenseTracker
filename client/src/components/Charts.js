"use client"

import PropTypes from "prop-types"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const INCOME_COLOR = "#27ae60"
const EXPENSE_COLOR = "#e74c3c"
const CHART_HEIGHT = 350

const groupByMonth = (incomes = [], expenses = []) => {
  const months = new Map()

  incomes.forEach((item) => {
    const key = new Date(item.date).toISOString().slice(0, 7)
    if (!months.has(key)) months.set(key, { month: key, income: 0, expense: 0 })
    months.get(key).income += item.amount
  })

  expenses.forEach((item) => {
    const key = new Date(item.date).toISOString().slice(0, 7)
    if (!months.has(key)) months.set(key, { month: key, income: 0, expense: 0 })
    months.get(key).expense += item.amount
  })

  return Array.from(months.values()).sort((a, b) => a.month.localeCompare(b.month))
}

const CustomTooltip = ({ active, payload, label }) => {
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
      <p style={{ fontWeight: 600, marginBottom: 4, color: "var(--color-text, #1c271f)" }}>{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color, margin: 0 }}>
          {entry.name}: ₹{entry.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  )
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
}

const formatMonthLabel = (month) => {
  const [y, m] = month.split("-")
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(m, 10) - 1]} ${y}`
}

const Charts = ({ incomes = [], expenses = [], type = "bar" }) => {
  const data = groupByMonth(incomes, expenses)

  if (type !== "pie" && data.length === 0) {
    return (
      <div className="no-data" style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted, #5a6c5e)" }}>
        No data to chart
      </div>
    )
  }

  if (type === "pie") {
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)

    if (totalIncome === 0 && totalExpense === 0) {
      return (
        <div className="no-data" style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted, #5a6c5e)" }}>
          No data to chart
        </div>
      )
    }

    const pieData = [
      { name: "Income", value: totalIncome },
      { name: "Expense", value: totalExpense },
    ]

    return (
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={4}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            <Cell fill={INCOME_COLOR} />
            <Cell fill={EXPENSE_COLOR} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e0e7de)" />
            <XAxis dataKey="month" tickFormatter={formatMonthLabel} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="income" name="Income" stroke={INCOME_COLOR} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="expense" name="Expense" stroke={EXPENSE_COLOR} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        )
      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e0e7de)" />
            <XAxis dataKey="month" tickFormatter={formatMonthLabel} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="income" name="Income" stroke={INCOME_COLOR} fill={INCOME_COLOR} fillOpacity={0.2} />
            <Area type="monotone" dataKey="expense" name="Expense" stroke={EXPENSE_COLOR} fill={EXPENSE_COLOR} fillOpacity={0.2} />
          </AreaChart>
        )
      case "bar":
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e0e7de)" />
            <XAxis dataKey="month" tickFormatter={formatMonthLabel} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        )
    }
  }

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      {renderChart()}
    </ResponsiveContainer>
  )
}

Charts.propTypes = {
  incomes: PropTypes.array,
  expenses: PropTypes.array,
  type: PropTypes.oneOf(["bar", "line", "area", "pie"]),
}

export default Charts
