import { useState, useMemo, useEffect } from "react"
import PieChart from "./PieChart"
import AnimatedNumber from "./common/AnimatedNumber"
import DashboardCards from "./DashboardCards"
import { exportToCSV, generateSeasonPDF } from "../utils/exportData"

const Dashboard = ({ incomes, expenses, currentSeason, allSeasons, onEndSeason, onSelectSeason }) => {
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" })

  useEffect(() => { if (currentSeason) {
    setDateFilter({
      startDate: new Date(currentSeason.startDate).toISOString().split("T")[0],
      endDate: currentSeason.endDate ? new Date(currentSeason.endDate).toISOString().split("T")[0] : "",
    })
  }}, [currentSeason])

  const filteredData = useMemo(() => {
    const filterByDate = (items) => {
      if (!dateFilter.startDate || !dateFilter.endDate) return items
      return items.filter((item) => {
        const itemDate = new Date(item.date)
        const start = new Date(dateFilter.startDate)
        const end = new Date(dateFilter.endDate)
        return itemDate >= start && itemDate <= end
      })
    }
    const filteredIncomes = filterByDate(incomes)
    const filteredExpenses = filterByDate(expenses)
    const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0)
    const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
    const balance = totalIncome - totalExpense
    const profitMargin = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0"
    const allTransactions = [
      ...filteredIncomes.map((i) => ({ ...i, type: "income" })),
      ...filteredExpenses.map((e) => ({ ...e, type: "expense" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    return { totalIncome, totalExpense, balance, profitMargin, allTransactions, filteredIncomes, filteredExpenses }
  }, [incomes, expenses, dateFilter])

  const pieChartData = [
    { name: "Income", value: filteredData.totalIncome, color: "#1a4d2e" },
    { name: "Expenses", value: filteredData.totalExpense, color: "#ba1a1a" },
  ]

  const handleDateFilterChange = (e) => setDateFilter({ ...dateFilter, [e.target.name]: e.target.value })
  const handleSeasonChange = (e) => onSelectSeason(e.target.value)

  if (!currentSeason) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>

  const fmt = (n) => `₹${(n || 0).toLocaleString("en-IN")}`

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Filter Row */}
      <section style={styles.filterRow}>
        <div style={styles.filterLeft}>
          <div style={styles.dateInputWrap}>
            <label style={styles.floatingLabel}>From</label>
            <input type="date" name="startDate" value={dateFilter.startDate} onChange={handleDateFilterChange} style={styles.dateInput} />
          </div>
          <div style={styles.dateInputWrap}>
            <label style={styles.floatingLabel}>To</label>
            <input type="date" name="endDate" value={dateFilter.endDate} onChange={handleDateFilterChange} style={styles.dateInput} />
          </div>
          <select value={currentSeason._id} onChange={handleSeasonChange} style={styles.selectInput}>
            {allSeasons.map((s) => (
              <option key={s._id} value={s._id}>{s.name} ({s.isActive ? "Active" : "Ended"})</option>
            ))}
          </select>
        </div>
        <div style={styles.filterRight}>
          <button onClick={() => exportToCSV([...filteredData.filteredIncomes.map(i=>({...i,type:"income"})),...filteredData.filteredExpenses.map(e=>({...e,type:"expense"}))], "report.csv")} style={styles.btnOutline}>
            <span className="material-symbols-outlined" style={{fontSize:18}}>download</span> Export
          </button>
          <button onClick={() => generateSeasonPDF({season:currentSeason,incomes:filteredData.filteredIncomes,expenses:filteredData.filteredExpenses,totals:{totalIncome:filteredData.totalIncome,totalExpense:filteredData.totalExpense,balance:filteredData.balance,profitMargin:filteredData.profitMargin}})} style={styles.btnOutline}>
            <span className="material-symbols-outlined" style={{fontSize:18}}>print</span> Print
          </button>
          {currentSeason.isActive && (
            <button onClick={onEndSeason} style={styles.btnDanger}>
              <span className="material-symbols-outlined" style={{fontSize:18}}>block</span> End Season
            </button>
          )}
        </div>
      </section>

      {/* Summary Cards */}
      <DashboardCards seasonId={currentSeason._id} />

      {/* Main Dashboard Grid */}
      <div style={styles.mainGrid}>
        {/* Financial Overview */}
        <div style={styles.financialCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Financial Overview</h2>
            <span className="material-symbols-outlined" style={{color:"var(--color-outline)"}}>pie_chart</span>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"12px 0",position:"relative"}}>
            <PieChart data={pieChartData} />
            <div style={{position:"absolute",display:"flex",flexDirection:"column",alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:700,color:"var(--color-outline)",textTransform:"uppercase"}}>Net Margin</span>
              <span style={{fontSize:24,fontWeight:700,color:"var(--color-primary)",fontFamily:"var(--font-display)"}}>{filteredData.profitMargin}%</span>
            </div>
          </div>
          <div style={styles.financialRows}>
            <div style={{...styles.finRow,background:"rgba(0,54,26,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:4,height:32,borderRadius:2,background:"var(--color-primary)"}}/>
                <div><p style={styles.finLabel}>Total Income</p><p style={{...styles.finValue,color:"var(--color-on-primary-container)"}}><AnimatedNumber value={filteredData.totalIncome} /></p></div>
              </div>
              <span className="material-symbols-outlined" style={{color:"var(--color-primary)",fontSize:20}}>arrow_upward</span>
            </div>
            <div style={{...styles.finRow,background:"rgba(186,26,26,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:4,height:32,borderRadius:2,background:"var(--color-danger)"}}/>
                <div><p style={styles.finLabel}>Total Expenses</p><p style={{...styles.finValue,color:"var(--color-danger)"}}><AnimatedNumber value={filteredData.totalExpense} /></p></div>
              </div>
              <span className="material-symbols-outlined" style={{color:"var(--color-danger)",fontSize:20}}>arrow_downward</span>
            </div>
            <div style={{...styles.finRow,background:"rgba(0,106,96,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:4,height:32,borderRadius:2,background:"var(--color-secondary)"}}/>
                <div><p style={styles.finLabel}>Balance</p><p style={{...styles.finValue,color:"var(--color-secondary)"}}><AnimatedNumber value={filteredData.balance} /></p></div>
              </div>
              <span className="material-symbols-outlined" style={{color:"var(--color-secondary)",fontSize:20}}>account_balance_wallet</span>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div style={styles.trendsCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Monthly Trends</h2>
              <p style={{fontSize:14,color:"var(--color-outline)"}}>Income vs Expenses Performance</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,borderRadius:"50%",background:"var(--color-primary)"}}/><span style={{fontSize:10,fontWeight:700,color:"var(--color-outline)",textTransform:"uppercase"}}>Income</span></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,borderRadius:"50%",background:"var(--color-danger)"}}/><span style={{fontSize:10,fontWeight:700,color:"var(--color-outline)",textTransform:"uppercase"}}>Expense</span></div>
            </div>
          </div>
          <div style={{flex:1,display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:8,padding:"24px 12px 8px",minHeight:300}}>
            {(incomes.length > 0 || expenses.length > 0) ? (
              (() => {
                const months = {}
                incomes.forEach(i => { const m = new Date(i.date).toISOString().slice(0,7); if(!months[m]) months[m]={inc:0,exp:0}; months[m].inc += i.amount })
                expenses.forEach(e => { const m = new Date(e.date).toISOString().slice(0,7); if(!months[m]) months[m]={inc:0,exp:0}; months[m].exp += e.amount })
                const sorted = Object.entries(months).sort((a,b) => a[0].localeCompare(b[0])).slice(-6)
                const maxVal = Math.max(...sorted.map(([,v]) => v.inc + v.exp), 1)
                return sorted.map(([m, v]) => {
                  const name = new Date(m+"-01").toLocaleString("en-US",{month:"short"})
                  const isCurrent = m === new Date().toISOString().slice(0,7)
                  return (
                    <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",opacity: isCurrent ? 1 : 0.6}}>
                      <div style={{width:"100%",display:"flex",justifyContent:"center",alignItems:"flex-end",gap:2,height:192}}>
                        <div style={{width:16,background:"var(--color-primary)",borderRadius:"4px 4px 0 0",height:`${Math.round((v.inc/maxVal)*192)}px`,transition:"opacity 0.2s"}}/>
                        <div style={{width:16,background:"var(--color-danger)",borderRadius:"4px 4px 0 0",height:`${Math.round((v.exp/maxVal)*192)}px`,transition:"opacity 0.2s"}}/>
                      </div>
                      <span style={{marginTop:8,fontSize:12,fontWeight:isCurrent?700:500,color:isCurrent?"var(--color-primary)":"var(--color-outline)"}}>{name}</span>
                    </div>
                  )
                })
              })()
            ) : <p style={{width:"100%",textAlign:"center",color:"var(--color-text-muted)"}}>Add income &amp; expenses to see trends</p>}
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={{...styles.fullCard, gridColumn: "1 / -1"}}>
          <div style={{...styles.cardHeader, marginBottom: 0}}>
            <h2 style={styles.cardTitle}>Recent Transactions</h2>
            <span style={{color:"var(--color-secondary)",fontSize:14,fontWeight:700,cursor:"pointer"}}>View All</span>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderSpacing:"0 12px",borderCollapse:"separate"}}>
              <thead>
                <tr style={{textAlign:"left"}}>
                  <th style={{...styles.th, paddingLeft:16}}>Entity / Description</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Date</th>
                  <th style={{...styles.th, textAlign:"right", paddingRight:16}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.allTransactions.map((t, i) => (
                  <tr key={i} style={{background:"var(--color-surface)"}}>
                    <td style={{...styles.td, paddingLeft:16, borderLeft: `4px solid ${t.type==="income"?"var(--color-danger)":"var(--color-primary)"}`, borderRadius:"8px 0 0 8px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:40,height:40,borderRadius:"50%",background:t.type==="income"?"rgba(186,26,26,0.1)":"rgba(0,54,26,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span className="material-symbols-outlined" style={{fontSize:18,color:t.type==="income"?"var(--color-danger)":"var(--color-primary)"}}>{t.type==="income"?"sell":"shopping_cart"}</span>
                        </div>
                        <div>
                          <p style={{fontWeight:700,color:"var(--color-text)"}}>{t.name}</p>
                          <p style={{fontSize:10,color:"var(--color-outline)"}}>{t.category}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:700,background:t.type==="income"?"var(--color-tertiary-fixed)":"var(--color-primary-fixed)",color:t.type==="income"?"var(--color-on-tertiary-fixed-variant)":"var(--color-on-primary-fixed-variant)"}}>
                        {t.type === "income" ? "SALES" : t.category?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{...styles.td, color:"var(--color-on-surface-variant)",fontWeight:500,fontSize:14}}>
                      {new Date(t.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                    </td>
                    <td style={{...styles.td, textAlign:"right", paddingRight:16, fontWeight:700, fontSize:16, color:t.type==="income"?"var(--color-danger)":"var(--color-primary)"}}>
                      {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  filterRow: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: 24, alignItems: "flex-end" },
  filterLeft: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" },
  filterRight: { display: "flex", gap: 8, flexWrap: "wrap" },
  dateInputWrap: { position: "relative" },
  floatingLabel: { position: "absolute", top: -8, left: 10, background: "var(--color-bg)", padding: "0 4px", fontSize: 10, fontWeight: 700, color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.05em" },
  dateInput: { padding: "8px 12px", border: "1px solid rgba(193,201,191,0.5)", borderRadius: 8, background: "var(--color-surface-container-low)", fontSize: 14, fontFamily: "var(--font-body)", color: "var(--color-text)", outline: "none" },
  selectInput: { padding: "8px 12px", border: "1px solid rgba(193,201,191,0.5)", borderRadius: 8, background: "var(--color-surface-container-low)", fontSize: 14, fontFamily: "var(--font-body)", color: "var(--color-text)", outline: "none", minWidth: 180 },
  btnOutline: { display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 16px", border: "1px solid var(--color-secondary)", color: "var(--color-secondary)", borderRadius: 8, background: "transparent", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-body)" },
  btnDanger: { display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 16px", border: "none", background: "var(--color-danger)", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" },
  mainGrid: { display: "grid", gridTemplateColumns: "1fr", gap: 24 },
  financialCard: { background: "var(--color-surface-container-lowest)", padding: 20, borderRadius: 16, border: "1px solid rgba(193,201,191,0.3)", boxShadow: "0px 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" },
  trendsCard: { background: "var(--color-surface-container-lowest)", padding: 20, borderRadius: 16, border: "1px solid rgba(193,201,191,0.3)", boxShadow: "0px 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", minHeight: 400 },
  fullCard: { background: "var(--color-surface-container-lowest)", padding: 20, borderRadius: 16, border: "1px solid rgba(193,201,191,0.3)", boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--color-primary)", margin: 0 },
  financialRows: { display: "flex", flexDirection: "column", gap: 12, marginTop: 16 },
  finRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 8 },
  finLabel: { fontSize: 10, fontWeight: 700, color: "var(--color-outline)", textTransform: "uppercase" },
  finValue: { fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" },
  th: { padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.05em" },
  td: { padding: "12px", fontSize: 14, color: "var(--color-text)" },
}

export default Dashboard

