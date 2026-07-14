"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"

const SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    content: [
      {
        subtitle: "Step 1: Create Your Account",
        steps: [
          "Visit the signup page and fill in your name, email, and a strong password.",
          "Pick a farm name (optional) to personalise your experience.",
          "Submit the form and verify your email if prompted.",
          "You'll be taken directly to the dashboard after your first login.",
        ],
        visual: '[Form with fields: Full Name, Email, Password, Confirm Password] → [Green "Create Account" button]',
        tip: "Use a password you can remember but others cannot guess. Write it down in a safe place.",
      },
      {
        subtitle: "Step 2: Create a Season",
        steps: [
          "A season represents one production batch or cycle (e.g. \"Summer Batch 2026\").",
          "On your first login the app will ask you to create a season — give it a meaningful name.",
          "Choose a start date. This is usually the day you bring in new chicks.",
          "Click \"Create Season\" to finish. You can create multiple seasons later.",
        ],
        visual: '[Season Form] Name: "Summer Batch 2026" | Start Date: <date picker> | [Create Season button]',
        tip: "Keep season names simple and consistent so you can compare them easily later.",
      },
      {
        subtitle: "Step 3: Add Your First Entry",
        steps: [
          "From the sidebar menu, choose either \"Add Income\" or \"Add Expense\".",
          "Fill in the form: select a category, enter the amount, pick a date, and add a note.",
          "Press \"Save\" — your entry will appear instantly in the table.",
          "Add a few more entries to see how the dashboard updates automatically.",
        ],
        visual: 'Income form showing: Category [dropdown: Egg Sales], Amount [₹ 5,000], Date [01-Jul-2026], Note "First pickup"',
        tip: "Record transactions the same day they happen so nothing gets forgotten.",
      },
      {
        subtitle: "Step 4: View Your Dashboard",
        steps: [
          "Go to the Dashboard page to see a summary of your farm finances.",
          "The top cards show total income, total expenses, and your net balance at a glance.",
          "A colour-coded pie chart breaks down income vs expenses visually.",
          "Recent transactions are listed below so you can quickly review what you entered.",
        ],
        visual: "[Dashboard screen] Cards: Income ₹12,000 | Expense ₹8,000 | Balance ₹4,000 | Pie chart with green/red slices",
        tip: "Check your dashboard at the end of each day — it takes only 10 seconds and keeps you in control.",
      },
    ],
  },
  {
    id: "managing",
    title: "Managing Income & Expenses",
    icon: "📋",
    content: [
      {
        subtitle: "How to Add Income",
        steps: [
          "Navigate to \"Add Income\" from the sidebar menu.",
          "Choose a category: Egg Sales, Bird Sales, Manure Sales, or Other Income.",
          "Enter the amount in rupees (for example, ₹ 3,500).",
          "Select the date when you received the payment.",
          "Add an optional note like \"Tuesday pickup\" or \"Weekend bonus batch\".",
          "Click the green \"Save\" button. The entry is stored instantly.",
        ],
        visual: '[Green highlighted form] Category: Egg Sales | Amount: ₹ 3,500 | Date: 05-Jul-2026 | Note: "Tuesday pickup" | [Save ✓]',
        tip: "Create separate income entries for different products so you know which items bring the most profit.",
      },
      {
        subtitle: "How to Add Expenses",
        steps: [
          "Navigate to \"Add Expense\" from the sidebar menu.",
          "Select a category: Feed, Medicine, Labour, Transport, Electricity, Maintenance, or Other.",
          "Enter the exact amount you spent.",
          "Pick the date the expense occurred.",
          "Add a note to remember details — brand names, quantity, or supplier information.",
          "Click the red \"Save\" button. The expense is recorded.",
        ],
        visual: '[Red highlighted form] Category: Feed | Amount: ₹ 12,000 | Date: 03-Jul-2026 | Note: "Layer feed 10 bags from Sriram" | [Save ✓]',
        tip: "Feed is usually the biggest expense. Track it carefully — even a small saving per bag adds up over a season.",
      },
      {
        subtitle: "How to View, Edit, and Delete Entries",
        steps: [
          "Use the \"Income List\" or \"Expense List\" pages to see all your records in a table.",
          "Each row shows the date, category, amount, and note for that entry.",
          "To edit: click the blue \"Edit\" button, change the values inline, then press \"Save\".",
          "To delete: click the red \"Delete\" button. You will see a confirmation prompt before it is removed.",
          "Use the month filter at the top to show entries for a specific month.",
          "Use the search box to find entries by category name or note text.",
        ],
        visual: '[Table view] Columns: Date | Category | Amount | Note | Actions (Edit / Delete) | Search bar above table | Month dropdown filter',
        tip: "Review your entries weekly. It is much easier to fix a mistake after a few days than after a few months.",
      },
      {
        subtitle: "How to Filter by Month and Search",
        steps: [
          "At the top of Income List and Expense List, you will find filter controls.",
          "Month filter: pick a month from the dropdown to show only that month's records.",
          "Search box: type a word like \"feed\" or \"transport\" to find matching entries.",
          "Both filters can be used together — search within a specific month.",
          "Clear the filters to see all entries again.",
        ],
        visual: '[Filter bar] Month: [August 2026 ▼] | Search: "feed..." | [Clear Filters]',
        tip: "Use the search filter at the end of each month to find and verify all your major expenses in seconds.",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Using the Dashboard",
    icon: "📊",
    content: [
      {
        subtitle: "Understanding the Pie Chart",
        steps: [
          "The pie chart on the dashboard shows the split between your income and expenses.",
          "Green slices represent income categories (egg sales, bird sales, etc.).",
          "Red slices represent expense categories (feed, medicine, labour, etc.).",
          "Hover or tap on a slice to see the exact amount and percentage.",
          "If you have no entries yet, the chart will show a message to add data first.",
        ],
        visual: '[Pie chart] Green wedge (Income, 60%) — Red wedge (Expense, 40%) | Legend: Egg Sales ₹7,200 | Feed ₹5,000 | Medicine ₹1,800',
        tip: "A healthy farm operation usually keeps expenses below 65% of income. Watch the ratio every week.",
      },
      {
        subtitle: "Understanding Summary Cards",
        steps: [
          "Total Income card (green): sum of all income entries for the selected date range.",
          "Total Expense card (red): sum of all expenses for the selected date range.",
          "Balance card (blue or purple): income minus expense — shows your profit or loss.",
          "Profit Margin card: balance divided by income shows what percentage you are keeping.",
          "Each card updates instantly when you add, edit, or delete entries.",
        ],
        visual: '[Four cards in a row] [Income: ₹ 45,000 🟢] [Expense: ₹ 28,500 🔴] [Balance: ₹ 16,500 🔵] [Margin: 36.7%]',
        tip: "The profit margin card is your best quick-check indicator. If it drops suddenly, find out why that day itself.",
      },
      {
        subtitle: "Using Date Filters to Narrow Down Data",
        steps: [
          "Just above the dashboard cards, you will find a date filter section.",
          "Set a \"Start Date\" and \"End Date\" to limit the view to a specific time period.",
          "Only entries within that date range will appear in charts, cards, and the transaction list.",
          "Click \"Clear\" or remove dates to show all entries again.",
          "This is useful for checking how a particular week or month performed.",
        ],
        visual: '[Date filter bar] From: [01-Aug-2026] To: [31-Aug-2026] | All summary cards update below',
        tip: "Compare the first and last month of a season — the difference tells you whether your birds earned more as they matured.",
      },
      {
        subtitle: "Switching Between Seasons",
        steps: [
          "At the top of the dashboard, you will see the current season name.",
          "Click the season dropdown (or selector) to see all your seasons.",
          "Pick any season — the entire dashboard switches to show that season's data.",
          "Active seasons show a green \"Active\" badge, ended seasons show a red \"Ended\" badge.",
          "Switch seasons at any time without losing data.",
        ],
        visual: '[Season selector dropdown] "Summer Batch 2026 (Active ▼)" shows list: Summer Batch 2026 | Winter Batch 2025 (Ended) | Monsoon Batch 2025 (Ended)',
        tip: "You can compare two seasons side by side using the Season Comparison feature in the sidebar.",
      },
      {
        subtitle: "Viewing Recent Transactions",
        steps: [
          "Scroll down on the dashboard to find the \"Recent Transactions\" section.",
          "Income entries show a green left border, expense entries show a red left border.",
          "Each transaction card shows: category name, amount, and date.",
          "The list shows the most recent entries first for quick reference.",
          "Click on any category in the sidebar to see the full list with more details.",
        ],
        visual: '[Recent Transactions list] 🟢 Egg Sales — ₹ 2,500 — Jul 14 | 🔴 Feed — ₹ 6,000 — Jul 13 | 🟢 Bird Sales — ₹ 18,000 — Jul 12',
        tip: "Scan your recent transactions every evening. It takes less than one minute and catches mistakes early.",
      },
      {
        subtitle: "Understanding Monthly Trend Charts",
        steps: [
          "Below the pie chart you may see a bar or line chart showing monthly totals.",
          "Each bar represents one month: green for income total, red for expense total.",
          "The trend line helps you see whether income is rising or expenses are growing.",
          "Click on chart type options to switch between bar and line views.",
          "Use this to spot patterns — for example, feed costs might be higher in early months.",
        ],
        visual: '[Bar chart] Jan: 🟢₹30K 🔴₹20K | Feb: 🟢₹35K 🔴₹22K | Mar: 🟢₹32K 🔴₹25K | Trend line sloping upward',
        tip: "If expenses keep climbing month after month while income stays flat, you may need to review your feed plan.",
      },
      {
        subtitle: "How to Export Data as CSV or Print",
        steps: [
          "On the dashboard, look for export buttons (CSV, Print) near the chart section.",
          "Click \"Export CSV\" to download all visible financial data as a spreadsheet file.",
          "Open the CSV file in Excel or Google Sheets for custom analysis.",
          "Click \"Print Report\" to generate a printer-friendly summary of your finances.",
          "You can share the CSV with your accountant or partner for review.",
        ],
        visual: '[Export buttons] [📥 Export CSV] [🖨️ Print Report] — placed near the chart header',
        tip: "Export a CSV at the end of each season and save it as a permanent record. It helps during tax filing.",
      },
    ],
  },
  {
    id: "advanced",
    title: "Advanced Features",
    icon: "⚙️",
    content: [
      {
        subtitle: "Season Comparison: Compare Two Seasons Side by Side",
        steps: [
          "Navigate to \"Season Comparison\" from the sidebar.",
          "Select two different seasons (for example, Summer 2026 and Summer 2025).",
          "Click the \"Compare\" button — the tool fetches data for both seasons.",
          "View a side-by-side table showing: total income, total expense, balance, and margin for each season.",
          "The difference column shows whether you improved or declined compared to the previous season.",
          "Use this before planning a new batch to set realistic targets.",
        ],
        visual: '[Season Comparison screen] Season A: "Summer 2026" | Season B: "Summer 2025" | [Compare] | Table: Income, Expense, Balance, Margin, Difference',
        tip: "Comparing the same calendar season across years gives the most meaningful data because weather and market conditions are similar.",
      },
      {
        subtitle: "Budget Tracker: Set Limits and Track Spending",
        steps: [
          "Navigate to \"Budget Tracker\" from the sidebar.",
          "Set a monthly or seasonal budget limit for each expense category (feed, medicine, labour, etc.).",
          "The tracker shows a progress bar for each category: green = within budget, orange = approaching limit, red = over budget.",
          "Update your budget amounts at any time as your needs change.",
          "Receive visual alerts when spending in a category crosses 80% of the budget.",
        ],
        visual: '[Budget cards] Feed: ████████░░ 80% (₹9,600 / ₹12,000) 🟡 | Medicine: ███░░░░░░░ 30% (₹1,500 / ₹5,000) 🟢 | Labour: ██████████ 105% (₹8,400 / ₹8,000) 🔴',
        tip: "Set the feed budget first — it is the largest expense. Even a 5% saving on feed can increase overall profit by 2-3%.",
      },
      {
        subtitle: "Dark Mode: Toggle Dark/Light Theme",
        steps: [
          "Look for the theme toggle switch in the sidebar at the bottom.",
          "Click the toggle to switch between Light and Dark mode.",
          "Dark mode is easier on the eyes during evening farm management sessions.",
          "Light mode works well in bright daylight or outdoor conditions.",
          "Your theme preference is saved and applied automatically on your next login.",
        ],
        visual: '[Theme toggle] ☀️ Light | Toggle switch | 🌙 Dark — located at the bottom of the sidebar',
        tip: "Switch to dark mode in the evening to reduce eye strain when checking your farm data on your phone.",
      },
      {
        subtitle: "Language: Switch Between English, Hindi, Telugu",
        steps: [
          "If language support is available, you will find a language selector in the sidebar or settings.",
          "Choose your preferred language from the dropdown.",
          "The interface labels, buttons, and messages switch to the selected language.",
          "Available languages may include English, Hindi (हिन्दी), and Telugu (తెలుగు).",
          "This makes the app more comfortable for farm staff who are not fluent in English.",
        ],
        visual: '[Language selector] 🌐 English ▼ | हिन्दी | తెలుగు — in sidebar or profile settings',
        tip: "Show this app to your farm workers in their preferred language — they will enter data more accurately.",
      },
      {
        subtitle: "Profile: Edit Profile and Change Password",
        steps: [
          "Navigate to \"Profile\" from the sidebar.",
          "View your current name, email, and farm details.",
          "Click \"Edit\" to update your name or farm information.",
          "To change your password, click the \"Change Password\" section.",
          "Enter your current password once plus your new password twice for confirmation.",
          "Click \"Save Changes\" — your profile is updated immediately.",
        ],
        visual: '[Profile page] Avatar (initials) | Name: "Ramesh Kumar" | Email: ramesh@farm.com | [Edit] [Change Password] [Logout]',
        tip: "Change your password every 2-3 months for security. Use a mix of letters, numbers, and at least one symbol.",
      },
    ],
  },
  {
    id: "tips",
    title: "Tips for Farmers",
    icon: "💡",
    content: [
      {
        subtitle: "Record Entries Daily for Best Tracking",
        steps: [
          "Make it a habit to enter every transaction on the same day it happens.",
          "Set aside 5 minutes each evening to open the app and add entries for the day.",
          "If you cannot enter it immediately, keep a small notebook as backup and transfer data later.",
          "Daily recording ensures no amount is missed and your reports are always accurate.",
        ],
        tip: "Set a daily phone reminder at 8 PM: \"Enter today's farm expenses\". A 5-minute habit saves hours of confusion later.",
      },
      {
        subtitle: "Categorise Expenses Properly for Better Analysis",
        steps: [
          "Always pick the correct category when adding expenses (Feed, Medicine, Labour, etc.).",
          "If you buy feed and medicine in one bill, split it into two separate entries.",
          "Avoid using the \"Other\" category too often — it makes analysis harder later.",
          "Good categorisation helps you see exactly where your money is going.",
        ],
        tip: "At week-end, look at the pie chart. If the \"Other\" slice is large, you need to be more specific with your categories.",
      },
      {
        subtitle: "End Seasons When a Batch Is Complete",
        steps: [
          "When you sell off your birds or the production cycle ends, mark the season as \"Ended\".",
          "Go to the season selector and click the \"End Season\" button on the current active season.",
          "Ended seasons are locked — you cannot accidentally add or delete entries from them.",
          "This keeps your historical data safe and clean for future comparison.",
        ],
        tip: "End the season within a week of selling the birds. Delays can lead to accidental entries in the wrong season.",
      },
      {
        subtitle: "Compare Seasons to Improve Profitability",
        steps: [
          "Use the Season Comparison tool at the end of each production cycle.",
          "Look at which categories grew between seasons — both income and expense.",
          "If feed costs went up without a matching increase in egg or bird sales, investigate why.",
          "Set a target margin for the next season based on what the comparison shows.",
        ],
        tip: "Write down three improvement goals for each new season based on the previous season's data. Small tweaks lead to big gains.",
      },
      {
        subtitle: "Use Budget Tracker to Control Feed and Medicine Costs",
        steps: [
          "Set a realistic budget for each major expense category before the season starts.",
          "Check the budget tracker weekly to see if you are on track.",
          "If a category is approaching its limit (orange bar), take action immediately.",
          "Adjust budgets mid-season only if there is a genuine price change in your area.",
          "At season end, review which categories stayed within budget and which did not.",
        ],
        tip: "The budget tracker is like a speedometer for your farm — check it regularly, not just when you sense a problem.",
      },
    ],
  },
]

const HelpGuide = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState("getting-started")
  const [searchQuery, setSearchQuery] = useState("")
  const [showTooltip, setShowTooltip] = useState(true)
  const [highlightedSection, setHighlightedSection] = useState(null)
  const panelRef = useRef(null)
  const searchInputRef = useRef(null)
  const tooltipTimerRef = useRef(null)

  useEffect(() => {
    tooltipTimerRef.current = setTimeout(() => {
      setShowTooltip(false)
    }, 5000)
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      document.body.style.overflow = "hidden"
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true)
        })
      })
    } else {
      setAnimating(false)
      document.body.style.overflow = ""
      const timer = setTimeout(() => setVisible(false), 320)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setShowTooltip(false)
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        setIsOpen(false)
      }
    },
    []
  )

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    if (query.length >= 2) {
      const match = SECTIONS.find(
        (sec) =>
          sec.title.toLowerCase().includes(query) ||
          sec.content.some(
            (item) =>
              item.subtitle.toLowerCase().includes(query) ||
              item.steps.some((s) => s.toLowerCase().includes(query))
          )
      )
      if (match) {
        setActiveTab(match.id)
        setHighlightedSection(query)
        setTimeout(() => setHighlightedSection(null), 3000)
      }
    } else {
      setHighlightedSection(null)
    }
  }, [])

  const filteredSections = useMemo(() => {
    if (searchQuery.length < 2) return SECTIONS
    return SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(searchQuery) ||
        sec.content.some(
          (item) =>
            item.subtitle.toLowerCase().includes(searchQuery) ||
            item.steps.some((s) => s.toLowerCase().includes(searchQuery))
        )
    )
  }, [searchQuery])

  const activeContent = useMemo(() => {
    return SECTIONS.find((s) => s.id === activeTab) || SECTIONS[0]
  }, [activeTab])

  const highlightMatch = (text) => {
    if (!highlightedSection || highlightedSection.length < 2) return text
    const idx = text.toLowerCase().indexOf(highlightedSection)
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark style={styles.highlightMark}>{text.slice(idx, idx + highlightedSection.length)}</mark>
        {text.slice(idx + highlightedSection.length)}
      </>
    )
  }

  const overlayStyle = {
    ...styles.overlay,
    opacity: animating ? 1 : 0,
    visibility: visible ? "visible" : "hidden",
  }

  const panelStyle = {
    ...styles.panel,
    transform: animating ? "translateX(0)" : "translateX(100%)",
  }

  return (
    <>
      <div style={styles.floatBtnWrapper}>
        {showTooltip && (
          <div style={styles.tooltip}>
            <div style={styles.tooltipText}>Need help? Click here!</div>
            <div style={styles.tooltipArrow} />
          </div>
        )}
        <button
          style={styles.floatBtn}
          onClick={handleOpen}
          aria-label="Open help guide"
          title="Help & Guide"
          type="button"
        >
          <span style={styles.floatBtnIcon}>?</span>
        </button>
      </div>

      {visible && (
        <div style={overlayStyle} onClick={handleOverlayClick}>
          <div style={panelStyle} ref={panelRef}>
            <div style={styles.panelHeader}>
              <div style={styles.headerLeft}>
                <span style={styles.headerIcon}>🐔</span>
                <div>
                  <h2 style={styles.panelTitle}>Help & Guide</h2>
                  <p style={styles.panelSubtitle}>Poultry Expense Tracker</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                style={styles.closeBtn}
                aria-label="Close help panel"
                type="button"
              >
                ✕
              </button>
            </div>

            <div style={styles.searchBar}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setHighlightedSection(null)
                    if (searchInputRef.current) searchInputRef.current.focus()
                  }}
                  style={styles.clearSearchBtn}
                  type="button"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div style={styles.tabBar}>
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveTab(section.id)
                    setSearchQuery("")
                    setHighlightedSection(null)
                  }}
                  style={{
                    ...styles.tab,
                    ...(activeTab === section.id ? styles.tabActive : {}),
                  }}
                  type="button"
                >
                  <span style={styles.tabIcon}>{section.icon}</span>
                  <span style={styles.tabLabel}>{section.title}</span>
                </button>
              ))}
            </div>

            <div style={styles.panelBody}>
              {filteredSections.length === 0 ? (
                <div style={styles.noResults}>
                  <span style={styles.noResultsIcon}>🔍</span>
                  <p style={styles.noResultsText}>
                    No help topics found for &quot;{searchQuery}&quot;
                  </p>
                  <p style={styles.noResultsHint}>
                    Try searching for words like &quot;income&quot;, &quot;dashboard&quot;, &quot;budget&quot;, or &quot;season&quot;.
                  </p>
                </div>
              ) : searchQuery.length >= 2 ? (
                <div style={styles.searchResults}>
                  <p style={styles.searchResultsCount}>
                    Found {filteredSections.length} section{filteredSections.length > 1 ? "s" : ""} matching &quot;{searchQuery}&quot;
                  </p>
                  {filteredSections.map((section) => (
                    <div key={section.id} style={styles.searchResultSection}>
                      <h3
                        style={styles.searchResultTitle}
                        onClick={() => {
                          setActiveTab(section.id)
                          setSearchQuery("")
                          setHighlightedSection(null)
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setActiveTab(section.id)
                            setSearchQuery("")
                            setHighlightedSection(null)
                          }
                        }}
                      >
                        {section.icon} {highlightMatch(section.title)}
                      </h3>
                      {section.content.map((item, idx) => (
                        <div key={idx} style={styles.searchResultItem}>
                          <h4 style={styles.searchResultSubtitle}>
                            {highlightMatch(item.subtitle)}
                          </h4>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div style={styles.sectionHeader}>
                    <h3 style={styles.sectionTitle}>
                      {activeContent.icon} {activeContent.title}
                    </h3>
                  </div>
                  {activeContent.content.map((item, idx) => (
                    <div key={idx} style={styles.helpCard}>
                      <h4 style={styles.helpCardTitle}>{item.subtitle}</h4>

                      {item.visual && (
                        <div style={styles.visualBox}>
                          <span style={styles.visualIcon}>🖥️</span>
                          <span style={styles.visualText}>{item.visual}</span>
                        </div>
                      )}

                      <ol style={styles.stepList}>
                        {item.steps.map((step, stepIdx) => (
                          <li key={stepIdx} style={styles.stepItem}>
                            {step}
                          </li>
                        ))}
                      </ol>

                      {item.tip && (
                        <div style={styles.tipBox}>
                          <div style={styles.tipHeader}>
                            <span style={styles.tipIcon}>💡</span>
                            <span style={styles.tipLabel}>Pro Tip</span>
                          </div>
                          <p style={styles.tipText}>{item.tip}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.panelFooter}>
              <p style={styles.footerText}>
                Still need help? Contact support or ask a fellow farmer.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  floatBtnWrapper: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  floatBtn: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(45, 106, 79, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    fontSize: 24,
    fontWeight: 800,
    fontFamily: "'Sora', sans-serif",
    lineHeight: 1,
    outline: "none",
    position: "relative",
  },
  floatBtnIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    fontWeight: 800,
    fontSize: 28,
    lineHeight: 1,
  },
  tooltip: {
    position: "absolute",
    bottom: 68,
    right: 0,
    backgroundColor: "#1c271f",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'Manrope', sans-serif",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    animation: "tooltipFadeIn 0.4s ease",
    zIndex: 1001,
  },
  tooltipText: {
    position: "relative",
    zIndex: 1,
  },
  tooltipArrow: {
    position: "absolute",
    bottom: -8,
    right: 20,
    width: 0,
    height: 0,
    borderLeft: "8px solid transparent",
    borderRight: "8px solid transparent",
    borderTop: "8px solid #1c271f",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1100,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    backdropFilter: "blur(2px)",
    transition: "opacity 0.3s ease, visibility 0.3s ease",
  },
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100vh",
    width: 400,
    maxWidth: "92vw",
    backgroundColor: "#fff",
    boxShadow: "-4px 0 40px rgba(0,0,0,0.15)",
    zIndex: 1101,
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e0e7de",
    background: "linear-gradient(135deg, #f6f8f5 0%, #e8ede6 100%)",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    fontSize: 28,
    lineHeight: 1,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1c271f",
    fontFamily: "'Sora', sans-serif",
    margin: 0,
    lineHeight: 1.2,
  },
  panelSubtitle: {
    fontSize: 12,
    color: "#5a6c5e",
    margin: "2px 0 0",
    fontFamily: "'Manrope', sans-serif",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 22,
    color: "#8a9c8e",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 6,
    lineHeight: 1,
    transition: "color 0.15s, background 0.15s",
    fontFamily: "'Manrope', sans-serif",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    padding: "12px 20px",
    borderBottom: "1px solid #e0e7de",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.6,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 14,
    fontFamily: "'Manrope', sans-serif",
    color: "#1c271f",
    background: "transparent",
    padding: "4px 0",
  },
  clearSearchBtn: {
    background: "none",
    border: "none",
    fontSize: 14,
    color: "#8a9c8e",
    cursor: "pointer",
    padding: "4px 6px",
    borderRadius: 4,
    lineHeight: 1,
    flexShrink: 0,
    fontFamily: "'Manrope', sans-serif",
  },
  tabBar: {
    display: "flex",
    overflowX: "auto",
    borderBottom: "2px solid #e0e7de",
    backgroundColor: "#fafcfa",
    flexShrink: 0,
    gap: 0,
    scrollbarWidth: "none",
  },
  tab: {
    flex: "0 0 auto",
    padding: "12px 14px",
    background: "none",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "#5a6c5e",
    fontFamily: "'Manrope', sans-serif",
    transition: "color 0.15s, border-color 0.15s",
    whiteSpace: "nowrap",
    outline: "none",
  },
  tabActive: {
    color: "#2d6a4f",
    borderBottomColor: "#2d6a4f",
  },
  tabIcon: {
    fontSize: 15,
    lineHeight: 1,
    flexShrink: 0,
  },
  tabLabel: {
    whiteSpace: "nowrap",
  },
  panelBody: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
    backgroundColor: "#fff",
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1c271f",
    fontFamily: "'Sora', sans-serif",
    margin: 0,
  },
  helpCard: {
    backgroundColor: "#f6f8f5",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    border: "1px solid #e0e7de",
  },
  helpCardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1b4332",
    margin: "0 0 12px",
    fontFamily: "'Sora', sans-serif",
  },
  visualBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#e8ede6",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 14,
    border: "1px solid #d4dcd2",
  },
  visualIcon: {
    fontSize: 16,
    flexShrink: 0,
    lineHeight: 1.4,
  },
  visualText: {
    fontSize: 12,
    color: "#4a5c4e",
    fontFamily: "'Manrope', sans-serif",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  stepList: {
    margin: 0,
    paddingLeft: 20,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  stepItem: {
    fontSize: 13.5,
    color: "#3a4a3e",
    lineHeight: 1.6,
    fontFamily: "'Manrope', sans-serif",
  },
  tipBox: {
    marginTop: 14,
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    padding: "12px 14px",
    border: "1px solid #ffe9a0",
    borderLeft: "4px solid #f59e0b",
  },
  tipHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  tipIcon: {
    fontSize: 14,
    lineHeight: 1,
  },
  tipLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#92400e",
    fontFamily: "'Sora', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  tipText: {
    fontSize: 13,
    color: "#78350f",
    lineHeight: 1.55,
    margin: 0,
    fontFamily: "'Manrope', sans-serif",
  },
  highlightMark: {
    backgroundColor: "#fde68a",
    color: "#1c271f",
    borderRadius: 2,
    padding: "0 2px",
  },
  noResults: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#5a6c5e",
  },
  noResultsIcon: {
    fontSize: 40,
    display: "block",
    marginBottom: 12,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 600,
    margin: "0 0 8px",
    fontFamily: "'Sora', sans-serif",
    color: "#3a4a3e",
  },
  noResultsHint: {
    fontSize: 13,
    color: "#8a9c8e",
    margin: 0,
    fontFamily: "'Manrope', sans-serif",
  },
  searchResults: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  searchResultsCount: {
    fontSize: 13,
    color: "#5a6c5e",
    margin: "0 0 12px",
    fontFamily: "'Manrope', sans-serif",
    fontStyle: "italic",
  },
  searchResultSection: {
    marginBottom: 16,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#2d6a4f",
    margin: "0 0 8px",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
    padding: "4px 0",
    outline: "none",
  },
  searchResultItem: {
    padding: "4px 0 4px 16px",
    borderLeft: "2px solid #d4dcd2",
    marginBottom: 4,
  },
  searchResultSubtitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#3a4a3e",
    margin: 0,
    fontFamily: "'Manrope', sans-serif",
  },
  panelFooter: {
    padding: "12px 24px",
    borderTop: "1px solid #e0e7de",
    backgroundColor: "#f6f8f5",
    flexShrink: 0,
  },
  footerText: {
    fontSize: 12,
    color: "#8a9c8e",
    margin: 0,
    textAlign: "center",
    fontFamily: "'Manrope', sans-serif",
  },
}

HelpGuide.propTypes = {}

export default HelpGuide
