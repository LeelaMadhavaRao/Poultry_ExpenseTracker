"use client"

import { useState, useEffect, useRef, useMemo } from "react"
const SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "rocket_launch",
    description: "Set up your account, farm, and first season",
    content: [
      {
        subtitle: "Step 1: Create Your Account",
        steps: [
          "Visit the signup page and fill in your name, email, phone number, username, and password.",
          "Add your farm name and location for a personalised experience.",
          "Submit the form — you'll be taken directly to the dashboard.",
        ],
        tip: "Use a phone number you actively use. It helps with account recovery.",
      },
      {
        subtitle: "Step 2: Set Up Your Farm",
        steps: [
          "Go to My Farms in the sidebar and create your farm profile.",
          "Enter farm name, location, and description.",
          "If you have multiple farms, you can add them all — switch between them using the farm selector in the header.",
          "Each farm keeps its own seasons, birds, and financial data separate.",
        ],
        tip: "Name your farms clearly — 'Main Shed' and 'Backyard Pen' are easier than 'Farm 1' and 'Farm 2'.",
      },
      {
        subtitle: "Step 3: Create a Season",
        steps: [
          "A season represents one batch cycle (e.g., 'Summer Broiler 2026').",
          "On first login, the app asks you to create a season — give it a meaningful name.",
          "Choose a start date. This is the day you bring in new chicks or start the batch.",
          "End the season when the batch is complete to lock the financials.",
        ],
        tip: "Keep season names consistent (e.g., 'Broiler-Jan2026', 'Layer-Summer2026') for easy comparison.",
      },
      {
        subtitle: "Step 4: Add Financial Entries",
        steps: [
          "From the sidebar, choose Add Income or Add Expense.",
          "Fill in the form: select category, enter amount, pick date, and add description.",
          "Press Add — your entry appears instantly and the dashboard updates.",
        ],
        tip: "Record transactions the same day — don't rely on memory at the end of the month.",
      },
    ],
  },
  {
    id: "manage-finances",
    title: "Managing Finances",
    icon: "payments",
    description: "Track income, expenses, and budgets",
    content: [
      {
        subtitle: "Income Categories",
        steps: [
          "Eggs Load — Bulk egg sales to wholesalers",
          "Eggs Local — Retail egg sales locally",
          "Birds Sale — Selling live birds",
          "Feces Sale — Selling poultry waste as fertilizer",
          "Other — Any other farm income",
        ],
        tip: "Separate 'Eggs Load' and 'Eggs Local' to track wholesale vs retail pricing separately.",
      },
      {
        subtitle: "Expense Categories",
        steps: [
          "Birds Purchase — Buying chicks or grown birds",
          "Feed Items — Maize, Soybean, Broken Rice, Stone grit",
          "Medicines — Feed medicines, liquid medicines, vaccination",
          "Maintenance — Machinery, construction, repairs",
          "Utilities — Diesel, electricity",
          "Labour — Worker wages",
          "Tax, Personal Use, Other — Miscellaneous expenses",
        ],
        tip: "Be specific with categories — it helps identify where your money goes.",
      },
      {
        subtitle: "Viewing & Editing Entries",
        steps: [
          "Use Income List or Expense List to view all entries in a table.",
          "Filter by month or search by name to find specific entries.",
          "Click Edit on any row to modify details inline — click Save when done.",
          "Click Delete to remove an entry (confirmation required).",
          "Use Export CSV to download data for Excel or sharing.",
        ],
        tip: "Review your expense list weekly to spot unusual spending patterns.",
      },
    ],
  },
  {
    id: "bird-tracker",
    title: "Bird Tracker",
    icon: "pets",
    description: "Monitor bird batches, deaths & survival",
    content: [
      {
        subtitle: "Managing Bird Batches",
        steps: [
          "Click Add Batch to create a new bird batch — enter name, breed, initial count, and start date.",
          "Breeds available: Broiler, Layer, Country Chicken, Other.",
          "Each batch card shows: current count, deaths, sold, and survival rate.",
          "Survival rate is color-coded: Green (>95% healthy), Yellow (>85%), Red (needs attention).",
        ],
        tip: "Create separate batches for different breeds or sheds — don't mix them. It makes tracking deaths and growth rates accurate.",
      },
      {
        subtitle: "Quick Actions",
        steps: [
          "Click '+ Death' to record a bird death — current count decreases by 1.",
          "Click '+ Sold' to record a sale — current count decreases, sold count increases.",
          "Edit any batch to update counts, breed, or notes.",
          "Delete a batch if created by mistake (confirmation required).",
        ],
        tip: "Record deaths daily — even 1-2 birds. Small numbers add up and help identify disease patterns early.",
      },
    ],
  },
  {
    id: "inventory-feed",
    title: "Inventory & Feed",
    icon: "grass",
    description: "Track feed usage & inventory levels",
    content: [
      {
        subtitle: "Feed Items Catalog",
        steps: [
          "Set up your feed items once: add each item with name, unit (kg/quintal/bag), and current market price.",
          "Categories: Feed, Medicine, Supplement, Other.",
          "Update prices when market rates change — all future usage logs will auto-fill the new price.",
        ],
        tip: "Update prices weekly. Feed prices fluctuate — accurate pricing means accurate cost calculations.",
      },
      {
        subtitle: "Daily Usage Log",
        steps: [
          "Every day, log how much of each feed item you used: select item, enter quantity, date.",
          "Price per unit auto-fills from your catalog — but you can edit it if today's price differs.",
          "View all usage entries sorted by date in the table below.",
          "Edit or delete any entry if you made a mistake.",
        ],
        tip: "Log feed usage at the same time each day (e.g., after morning feeding). Consistency gives accurate data.",
      },
    ],
  },
  {
    id: "multi-farm",
    title: "Multi-Farm Sync",
    icon: "hub",
    description: "Manage multiple farms from one account",
    content: [
      {
        subtitle: "How Multi-Farm Works",
        steps: [
          "Go to My Farms and add each of your farm locations.",
          "The farm selector appears in the header — switch between farms anytime.",
          "Each farm has its own seasons, birds, feed logs, and financial data — completely separate.",
          "Create a farm for each physical location or shed you manage.",
        ],
        tip: "If you have a broiler shed and a layer shed, create them as separate farms. This lets you compare profitability per farm type.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: "support_agent",
    description: "Fix common issues and get support",
    content: [
      {
        subtitle: "Common Issues",
        steps: [
          "Dashboard not loading? Check your internet connection and refresh the page.",
          "Data not saving? Ensure all required fields are filled correctly.",
          "Can't switch farms? Verify you have farms created in My Farms section.",
          "Wrong calculations? Check that all transactions are in the same season.",
        ],
        tip: "If problems persist, use the Contact Support option — we're here to help!",
      },
    ],
  },
]

const FAQS = [
  { q: "How do I add a new farm?", a: "Go to the My Farms page from the sidebar and click 'Add Farm'. Fill in the farm name, location, and description." },
  { q: "Can I track expenses across seasons?", a: "Yes! Each season keeps its own financial data. Use the Season Comparison tool to compare performance between seasons." },
  { q: "How do I export my data?", a: "Go to Income List or Expense List, apply your filters, then click the 'Export' button to download as CSV." },
  { q: "What happens when I end a season?", a: "Ending a season locks its financial data for reporting. You can still view it, but new entries must go to an active season." },
]

const CATEGORIES = [
  { id: "getting-started", title: "Getting Started", icon: "rocket_launch", description: "Set up your account, farm & first season quickly" },
  { id: "manage-finances", title: "Managing Finances", icon: "payments", description: "Track income, expenses, budgets & reports" },
  { id: "bird-tracker", title: "Bird Tracker", icon: "pets", description: "Monitor bird batches, deaths & survival rates" },
  { id: "inventory-feed", title: "Inventory & Feed", icon: "grass", description: "Track feed usage & inventory levels" },
  { id: "multi-farm", title: "Multi-Farm Sync", icon: "hub", description: "Manage multiple farms from one account" },
  { id: "troubleshooting", title: "Troubleshooting", icon: "support_agent", description: "Fix common issues and get support" },
]

const HelpGuide = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("getting-started")
  const [search, setSearch] = useState("")
  const [showTooltip, setShowTooltip] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState(null)
  const panelRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 8000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape" && isOpen) setIsOpen(false) }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const filteredSections = useMemo(() => {
    if (!search.trim()) return SECTIONS
    const q = search.toLowerCase()
    return SECTIONS.filter((s) => {
      const titleMatch = s.title.toLowerCase().includes(q)
      const contentMatch = s.content.some((c) =>
        c.subtitle.toLowerCase().includes(q) || c.steps.some((st) => st.toLowerCase().includes(q))
      )
      return titleMatch || contentMatch
    })
  }, [search])

  const activeContent = filteredSections.find((s) => s.id === activeSection) || filteredSections[0]

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="hg-fab" title="Help & Guide">
        <span>?</span>
      </button>
      {showTooltip && !isOpen && (
        <div className="hg-tooltip">Need help? Click here!</div>
      )}
      {isOpen && <div className="hg-overlay" onClick={() => setIsOpen(false)} />}
      <div ref={panelRef} className={`hg-panel ${isOpen ? "hg-panel-open" : ""}`}>
        {/* Panel Header */}
        <div className="hg-panel-header">
          <h2>Help Center</h2>
          <button onClick={() => setIsOpen(false)} className="hg-close-btn">&times;</button>
        </div>

        {/* Hero Section */}
        <div className="hg-hero">
          <div className="hg-hero-content">
            <h3>How can we help you today?</h3>
            <div className="hg-search-wrap">
              <input
                type="text"
                placeholder="Search help topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="hg-search-input"
              />
            </div>
          </div>
        </div>

        <div className="hg-scroll-body">
          {/* Category Grid */}
          {!search && (
            <>
              <h4 className="hg-section-label">Browse by Category</h4>
              <div className="hg-cat-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`hg-cat-card glass-card ${activeSection === cat.id ? "hg-cat-active" : ""}`}
                    onClick={() => setActiveSection(cat.id)}
                  >
                    <span className="material-symbols-outlined hg-cat-icon">{cat.icon}</span>
                    <div>
                      <h5>{cat.title}</h5>
                      <p>{cat.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Active Section Content */}
          {activeContent && (
            <div className="hg-content-section">
              <h4 className="hg-section-label">{activeContent.title}</h4>
              {activeContent.content.map((block, i) => (
                <div key={i} className="hg-guide-block">
                  <h5>{block.subtitle}</h5>
                  <ol>
                    {block.steps.map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ol>
                  {block.tip && (
                    <div className="hg-tip">
                      <strong>Pro Tip:</strong> {block.tip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {filteredSections.length === 0 && (
            <p className="hg-no-results">No results found. Try a different search term.</p>
          )}

          {/* FAQ Accordion */}
          <h4 className="hg-section-label" style={{ marginTop: 28 }}>Frequently Asked Questions</h4>
          <div className="hg-faq-list">
            {FAQS.map((faq, i) => (
              <div key={i} className="hg-faq-item glass-card">
                <button
                  className="hg-faq-q"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span className={`material-symbols-outlined hg-faq-chevron ${expandedFaq === i ? "hg-faq-open" : ""}`}>
                    expand_more
                  </span>
                </button>
                {expandedFaq === i && (
                  <div className="hg-faq-a">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Sidebar Cards (inline on mobile) */}
          <div className="hg-support-cards">
            <div className="hg-support-card">
              <h5>Still need help?</h5>
              <p className="hg-support-card-text">Our support team is ready to assist you with any questions.</p>
              <div className="hg-support-btns">
                <button className="btn-primary" style={{ flex: 1, height: 40, fontSize: 13, padding: "0 12px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>chat</span>
                  Live Chat
                </button>
                <button className="btn-secondary" style={{ flex: 1, height: 40, fontSize: 13, padding: "0 12px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>mail</span>
                  Email
                </button>
              </div>
              <div className="hg-agent-avatars">
                <div className="hg-agent-dot" style={{ background: "var(--color-success)" }} />
                <div className="hg-agent-dot" style={{ background: "var(--color-primary)" }} />
                <div className="hg-agent-dot" style={{ background: "var(--color-warning)" }} />
                <span className="hg-agent-text">3 agents online</span>
              </div>
            </div>
            <div className="hg-community-card">
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--color-accent)" }}>forum</span>
              <div>
                <h5>Farmer Community</h5>
                <p>Join 500+ poultry farmers sharing tips & best practices.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{hgCSS}</style>
    </>
  )
}

const hgCSS = `
.hg-fab { position: fixed; bottom: 24px; right: 24px; z-index: 1000; width: 52px; height: 52px; border-radius: 50%; background: var(--color-primary); color: #fff; border: none; font-size: 22px; cursor: pointer; box-shadow: 0 4px 16px rgba(45,106,79,0.35); display: flex; align-items: center; justify-content: center; transition: transform 0.2s; font-family: var(--font-body); font-weight: 700; }
.hg-fab:hover { transform: scale(1.08); }
.hg-tooltip { position: fixed; bottom: 84px; right: 20px; z-index: 1000; background: var(--color-text); color: var(--color-surface); padding: 8px 14px; border-radius: 8px; font-size: 13px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); animation: fadeIn 0.3s ease; }
.hg-overlay { position: fixed; inset: 0; z-index: 1099; background: rgba(0,0,0,0.35); }
.hg-panel { position: fixed; top: 0; right: 0; z-index: 1100; width: min(480px, 100vw); height: 100vh; background: var(--color-surface); box-shadow: -4px 0 32px rgba(0,0,0,0.12); transform: translateX(100%); transition: transform 0.28s ease; display: flex; flex-direction: column; }
.hg-panel-open { transform: translateX(0); }
.hg-panel-header { padding: 16px 20px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.hg-panel-header h2 { font-size: 18px; font-family: var(--font-display); color: var(--color-text); margin: 0; }
.hg-close-btn { background: none; border: none; font-size: 24px; color: var(--color-text-muted); cursor: pointer; padding: 0; line-height: 1; }

/* Hero */
.hg-hero { background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%); padding: 28px 20px; flex-shrink: 0; }
.hg-hero-content h3 { color: var(--color-on-primary); font-family: var(--font-display); font-size: 18px; margin: 0 0 14px; text-align: center; }
.hg-search-wrap { position: relative; }
.hg-search-input { width: 100%; padding: 12px 16px; border: none; border-radius: var(--radius-md); font-size: 14px; font-family: var(--font-body); background: rgba(255,255,255,0.2); color: #fff; backdrop-filter: blur(4px); }
.hg-search-input::placeholder { color: rgba(255,255,255,0.7); }
.hg-search-input:focus { outline: none; background: rgba(255,255,255,0.3); }

/* Scroll Body */
.hg-scroll-body { flex: 1; overflow-y: auto; padding: 20px; }

/* Section Label */
.hg-section-label { font-family: var(--font-display); font-size: 14px; color: var(--color-text); margin: 0 0 12px; }

/* Category Grid */
.hg-cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
.hg-cat-card { display: flex; align-items: center; gap: 10px; padding: 14px; cursor: pointer; border: none; text-align: left; transition: all 0.2s; background: rgba(255,255,255,0.8); font-family: var(--font-body); }
.hg-cat-card:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
.hg-cat-active { border-color: var(--color-primary); }
.hg-cat-icon { font-size: 22px; color: var(--color-primary); flex-shrink: 0; font-variation-settings: 'FILL' 1; }
.hg-cat-card h5 { font-family: var(--font-display); font-size: 12px; color: var(--color-text); margin: 0 0 2px; }
.hg-cat-card p { font-size: 11px; color: var(--color-text-muted); margin: 0; line-height: 1.3; }

/* Guide Content */
.hg-content-section { margin-bottom: 24px; }
.hg-guide-block { margin-bottom: 18px; }
.hg-guide-block h5 { font-size: 14px; font-weight: 700; color: var(--color-primary); margin: 0 0 6px; font-family: var(--font-display); }
.hg-guide-block ol { padding-left: 18px; margin: 0; }
.hg-guide-block li { margin-bottom: 4px; font-size: 13px; color: var(--color-text); line-height: 1.6; }
.hg-tip { margin-top: 10px; padding: 10px 14px; background: var(--color-bg); border-radius: 8px; border-left: 3px solid var(--color-primary); font-size: 12px; color: var(--color-text-muted); line-height: 1.5; }
.hg-no-results { text-align: center; color: var(--color-text-muted); padding: 30px; }

/* FAQ Accordion */
.hg-faq-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.hg-faq-item { overflow: hidden; }
.hg-faq-q { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: none; border: none; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--color-text); text-align: left; font-family: var(--font-body); transition: background 0.2s; }
.hg-faq-q:hover { background: var(--color-bg); }
.hg-faq-chevron { font-size: 20px; color: var(--color-text-muted); transition: transform 0.2s; }
.hg-faq-open { transform: rotate(180deg); }
.hg-faq-a { padding: 0 16px 14px; }
.hg-faq-a p { font-size: 13px; color: var(--color-text-muted); line-height: 1.6; margin: 0; }

/* Support Cards */
.hg-support-cards { display: flex; flex-direction: column; gap: 12px; }
.hg-support-card { background: var(--color-primary-container); border-radius: var(--radius-lg); padding: 18px; border: 1px solid rgba(0,54,26,0.08); }
.hg-support-card h5 { font-family: var(--font-display); font-size: 14px; color: var(--color-text); margin: 0 0 6px; }
.hg-support-card-text { font-size: 12px; color: var(--color-text-muted); margin: 0 0 12px; }
.hg-support-btns { display: flex; gap: 8px; }
.hg-agent-avatars { display: flex; align-items: center; gap: 6px; margin-top: 12px; }
.hg-agent-dot { width: 10px; height: 10px; border-radius: 50%; }
.hg-agent-text { font-size: 11px; color: var(--color-text-muted); }
.hg-community-card { background: var(--color-tertiary-fixed); border-radius: var(--radius-lg); padding: 16px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(0,0,0,0.06); }
.hg-community-card h5 { font-family: var(--font-display); font-size: 13px; color: var(--color-text); margin: 0 0 3px; }
.hg-community-card p { font-size: 11px; color: var(--color-text-muted); margin: 0; line-height: 1.4; }

@media (max-width: 480px) {
  .hg-cat-grid { grid-template-columns: 1fr; }
  .hg-support-btns { flex-direction: column; }
}
`

export default HelpGuide
