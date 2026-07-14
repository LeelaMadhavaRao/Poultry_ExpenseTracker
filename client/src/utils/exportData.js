export const exportToCSV = (data, filename = "export.csv") => {
  if (!data || data.length === 0) {
    console.warn("No data to export")
    return
  }

  const headers = Object.keys(data[0])
  const csvRows = []

  csvRows.push(headers.join(","))

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header] != null ? row[header] : ""
      const escaped = String(val).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(","))
  }

  const csvString = csvRows.join("\n")
  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const generateSeasonPDF = ({ season, incomes, expenses, totals }) => {
  const { totalIncome = 0, totalExpense = 0 } = totals || {}
  const net = totalIncome - totalExpense

  const incomeByCategory = {}
  const expenseByCategory = {}

  if (incomes) {
    incomes.forEach((item) => {
      const cat = item.category || "Uncategorized"
      incomeByCategory[cat] = (incomeByCategory[cat] || 0) + item.amount
    })
  }

  if (expenses) {
    expenses.forEach((item) => {
      const cat = item.category || "Uncategorized"
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + item.amount
    })
  }

  const seasonName = season?.name || "Season Report"
  const startDate = season?.startDate ? new Date(season.startDate).toLocaleDateString("en-IN") : "N/A"
  const endDate = season?.endDate ? new Date(season.endDate).toLocaleDateString("en-IN") : "Ongoing"

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${seasonName} - Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Segoe UI", "Manrope", Arial, sans-serif;
      color: #1c271f;
      background: #fff;
      padding: 40px;
    }
    .report {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 3px solid #2d6a4f;
    }
    .header h1 {
      font-size: 28px;
      color: #2d6a4f;
      margin-bottom: 8px;
    }
    .header .subtitle {
      font-size: 14px;
      color: #5a6c5e;
    }
    .summary {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }
    .summary-card {
      flex: 1;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      color: #fff;
    }
    .summary-card.income { background: #27ae60; }
    .summary-card.expense { background: #e74c3c; }
    .summary-card.net { background: #2d6a4f; }
    .summary-card h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
      opacity: 0.9;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: 700;
    }
    .section {
      margin-bottom: 28px;
    }
    .section h2 {
      font-size: 18px;
      color: #2d6a4f;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e0e7de;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e0e7de;
    }
    th {
      background: #f6f8f5;
      font-weight: 600;
      font-size: 13px;
      color: #5a6c5e;
    }
    td { font-size: 14px; }
    .amount { text-align: right; font-weight: 600; }
    .amount.positive { color: #27ae60; }
    .amount.negative { color: #e74c3c; }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #9aac9e;
      border-top: 1px solid #e0e7de;
      padding-top: 16px;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="report">
    <div class="header">
      <h1>${seasonName}</h1>
      <p class="subtitle">${startDate} — ${endDate}</p>
    </div>

    <div class="summary">
      <div class="summary-card income">
        <h3>Total Income</h3>
        <p class="value">₹${totalIncome.toLocaleString("en-IN")}</p>
      </div>
      <div class="summary-card expense">
        <h3>Total Expense</h3>
        <p class="value">₹${totalExpense.toLocaleString("en-IN")}</p>
      </div>
      <div class="summary-card net">
        <h3>Net ${net >= 0 ? "Profit" : "Loss"}</h3>
        <p class="value">₹${Math.abs(net).toLocaleString("en-IN")}</p>
      </div>
    </div>

    <div class="section">
      <h2>Income Breakdown</h2>
      ${Object.keys(incomeByCategory).length > 0
        ? `<table>
            <thead><tr><th>Category</th><th class="amount">Amount</th></tr></thead>
            <tbody>
              ${Object.entries(incomeByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => `<tr><td>${cat}</td><td class="amount positive">₹${amt.toLocaleString("en-IN")}</td></tr>`)
                .join("")}
            </tbody>
          </table>`
        : `<p style="color:#5a6c5e;">No income recorded</p>`
      }
    </div>

    <div class="section">
      <h2>Expense Breakdown</h2>
      ${Object.keys(expenseByCategory).length > 0
        ? `<table>
            <thead><tr><th>Category</th><th class="amount">Amount</th></tr></thead>
            <tbody>
              ${Object.entries(expenseByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => `<tr><td>${cat}</td><td class="amount negative">₹${amt.toLocaleString("en-IN")}</td></tr>`)
                .join("")}
            </tbody>
          </table>`
        : `<p style="color:#5a6c5e;">No expenses recorded</p>`
      }
    </div>

    <div class="footer">
      <p>Generated by Poultry Expense Tracker on ${new Date().toLocaleDateString("en-IN")}</p>
    </div>
  </div>
</body>
</html>`

  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    console.warn("Popup blocked. Please allow popups for this site to print reports.")
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 500)
}
