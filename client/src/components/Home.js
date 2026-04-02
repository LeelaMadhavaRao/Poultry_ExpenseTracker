import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-bg-shape hero-bg-shape-one"></div>
        <div className="hero-bg-shape hero-bg-shape-two"></div>

        <div className="hero-content">
          <p className="hero-kicker">Smart Farm Finance</p>
          <h1>Poultry Expense Tracker</h1>
          <p className="hero-subtitle">
            Manage income, expenses, and seasonal performance in one clear dashboard built for poultry farm owners.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="hero-btn hero-btn-primary">
              Create Account
            </Link>
            <Link to="/login" className="hero-btn hero-btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2>What This Web App Helps You Do</h2>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Track Daily Income</h3>
            <p>Record egg sales, bird sales, and other farm revenues with clean, organized entries.</p>
          </article>

          <article className="feature-card">
            <h3>Control Farm Expenses</h3>
            <p>Monitor feed, medicine, labor, and maintenance spending so costs stay visible and manageable.</p>
          </article>

          <article className="feature-card">
            <h3>Review Seasonal Performance</h3>
            <p>Compare each season to understand profitability trends and make better planning decisions.</p>
          </article>
        </div>
      </section>

      <section className="home-section">
        <h2>How the Platform Works</h2>
        <div className="timeline-grid">
          <article className="timeline-step">
            <span className="timeline-index">01</span>
            <h3>Create Season</h3>
            <p>Start with a production season and keep all your finance entries grouped in one business cycle.</p>
          </article>

          <article className="timeline-step">
            <span className="timeline-index">02</span>
            <h3>Add Daily Records</h3>
            <p>Enter feed bills, medicine costs, labor payments, sales revenue, and every major transaction.</p>
          </article>

          <article className="timeline-step">
            <span className="timeline-index">03</span>
            <h3>Review Dashboard</h3>
            <p>Analyze expense categories, compare totals, and quickly understand your current farm balance.</p>
          </article>

          <article className="timeline-step">
            <span className="timeline-index">04</span>
            <h3>Improve Planning</h3>
            <p>Use past season insights to set better budgets, control costs, and improve farm profitability.</p>
          </article>
        </div>
      </section>

      <section className="home-section content-split">
        <div className="content-split-card">
          <h2>Why Farm Owners Choose This App</h2>
          <p>
            Poultry Expense Tracker is built for practical day-to-day usage. The interface stays simple, but the
            results are powerful: better spending visibility, faster decision-making, and fewer financial surprises.
          </p>
          <ul className="content-bullet-list">
            <li>Single place to manage all financial records</li>
            <li>Reduced manual errors from paper tracking</li>
            <li>Better communication with partners and staff</li>
            <li>Faster month-end and season-end reporting</li>
          </ul>
        </div>

        <div className="content-split-card content-split-contrast">
          <h3>Designed for Real Farm Conditions</h3>
          <p>
            Whether you are in the office or near the sheds, the responsive interface helps you work smoothly from
            both desktop and mobile screens.
          </p>
          <p>
            Every entry is tied to your season, making it easy to monitor active performance and compare completed
            cycles without confusion.
          </p>
          <Link to="/signup" className="hero-btn hero-btn-primary">
            Start Tracking Today
          </Link>
        </div>
      </section>

      <section className="home-section faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <article className="faq-card">
            <h3>Can I use it for multiple seasons?</h3>
            <p>Yes. The app is season-based, so you can create, close, and compare multiple production cycles.</p>
          </article>
          <article className="faq-card">
            <h3>Is this suitable for small farms?</h3>
            <p>Absolutely. It works for both small and medium poultry operations that need simple finance control.</p>
          </article>
          <article className="faq-card">
            <h3>Does it work on mobile phones?</h3>
            <p>Yes. Login, signup, and the rest of the interface are responsive and optimized for smaller screens.</p>
          </article>
        </div>
      </section>

      <section className="home-section highlight-band">
        <h2>Built for Clarity and Better Decisions</h2>
        <p>
          Poultry Expense Tracker brings all farm finance data into one secure place. Instead of scattered notes and
          manual calculations, you get a focused workflow from data entry to analysis.
        </p>
      </section>
    </div>
  )
}

export default Home
