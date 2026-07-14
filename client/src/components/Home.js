import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="material-symbols-outlined">verified</span>
            <span>Smart Farm Finance</span>
          </div>
          <h1>Poultry Expense Tracker</h1>
          <p className="hero-subtitle">
            Manage income, expenses, and seasonal performance in one clear dashboard designed for modern poultry professionals.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="hero-btn hero-btn-primary">
              <span>Create Account</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link to="/login" className="hero-btn hero-btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home-section">
        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <h3>Track Daily Income</h3>
            <p>Record egg sales, bird sales, and other farm revenues with clean, organized entries from any device.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <h3>Control Farm Expenses</h3>
            <p>Monitor feed, medicine, labor, and maintenance spending so costs stay visible and manageable.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <h3>Review Seasonal Performance</h3>
            <p>Compare each season to understand profitability trends and make better planning decisions.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="home-section timeline-section">
        <h2 className="section-title">How It Works</h2>
        <div className="timeline-steps">
          <div className="timeline-item">
            <div className="timeline-number">1</div>
            <h3>Create Season</h3>
            <p>Start with a production season and keep all your finance entries grouped in one business cycle.</p>
          </div>
          <div className="timeline-item">
            <div className="timeline-number">2</div>
            <h3>Add Daily Records</h3>
            <p>Enter feed bills, medicine costs, labor payments, sales revenue, and every major transaction.</p>
          </div>
          <div className="timeline-item">
            <div className="timeline-number">3</div>
            <h3>Review Dashboard</h3>
            <p>Analyze expense categories, compare totals, and quickly understand your current farm balance.</p>
          </div>
          <div className="timeline-item">
            <div className="timeline-number">4</div>
            <h3>Improve Planning</h3>
            <p>Use past season insights to set better budgets, control costs, and improve farm profitability.</p>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="home-section split-section">
        <div className="split-card glass-card">
          <h2>Why Farm Owners Choose This App</h2>
          <p>Poultry Expense Tracker is built for practical day-to-day usage — simple interface, powerful results.</p>
          <ul className="bullet-list">
            <li>Single place to manage all financial records</li>
            <li>Reduced manual errors from paper tracking</li>
            <li>Better communication with partners and staff</li>
            <li>Faster month-end and season-end reporting</li>
          </ul>
        </div>
        <div className="split-card split-card-dark">
          <h3>Designed for Real Farm Conditions</h3>
          <p>Whether you are in the office or near the sheds, the responsive interface helps you work smoothly from both desktop and mobile screens.</p>
          <Link to="/signup" className="hero-btn">Start Tracking Today</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="home-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-card glass-card">
            <h3>Can I use it for multiple seasons?</h3>
            <p>Yes. The app is season-based, so you can create, close, and compare multiple production cycles.</p>
          </div>
          <div className="faq-card glass-card">
            <h3>Is this suitable for small farms?</h3>
            <p>Absolutely. It works for both small and medium poultry operations that need simple finance control.</p>
          </div>
          <div className="faq-card glass-card">
            <h3>Does it work on mobile phones?</h3>
            <p>Yes. Login, signup, and the rest of the interface are responsive and optimized for smaller screens.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div>
            <span className="footer-brand">PoultryPro</span>
            <p>Empowering farmers with precision finance tools.</p>
          </div>
          <div className="footer-links">
            <span className="material-symbols-outlined">help</span>
            <span className="material-symbols-outlined">settings</span>
            <span className="material-symbols-outlined">description</span>
          </div>
          <p className="footer-copy">© 2024 PoultryPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
