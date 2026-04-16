import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Scoring',
    desc: 'XGBoost model trained on thousands of real applications gives you an instant, accurate credit risk score.',
  },
  {
    icon: '⚡',
    title: 'Instant Decisions',
    desc: 'Get your APPROVE, REVIEW, or REJECT decision in milliseconds — no waiting, no paperwork.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'Your financial data is encrypted and never shared. We prioritise your privacy at every step.',
  },
  {
    icon: '📊',
    title: 'Transparent Analytics',
    desc: 'Understand exactly why the AI made its decision with a detailed credit score breakdown.',
  },
];



export default function Hero() {
  const navigate = useNavigate();
  const heroRef  = useRef(null);

  /* subtle parallax on mouse move */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handleMove = (e) => {
      const { clientX, clientY, currentTarget } = e;
      const { width, height } = currentTarget.getBoundingClientRect();
      const x = (clientX / width  - 0.5) * 20;
      const y = (clientY / height - 0.5) * 20;
      el.style.setProperty('--tx', `${x}px`);
      el.style.setProperty('--ty', `${y}px`);
    };
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="hero-root" ref={heroRef}>

      {/* ── Animated Background ── */}
      <div className="hero-bg">
        <div className="hero-orb orb1" />
        <div className="hero-orb orb2" />
        <div className="hero-orb orb3" />
        <div className="hero-grid" />
      </div>

      {/* ── Navbar ── */}
      <nav className="hero-nav">
        <span className="hero-logo">⚡ Credit Score AI</span>
        <div className="hero-nav-links">
          <button className="hero-nav-btn" onClick={() => navigate('/login')}>Login</button>
          <button className="hero-nav-btn hero-nav-btn--cta" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero Content ── */}
      <section className="hero-section">
        <div className="hero-badge">🚀 Next-Gen Credit Intelligence</div>

        <h1 className="hero-title">
          Know Your Credit<br />
          <span className="hero-gradient-text">Score in Seconds</span>
        </h1>

        <p className="hero-subtitle">
          Credit Score AI uses advanced machine learning to instantly evaluate your loan eligibility,
          deliver a real-time credit score, and tell you exactly where you stand — no guesswork.
        </p>

        <div className="hero-cta-group">
          <button
            id="hero-get-started"
            className="hero-btn hero-btn--primary"
            onClick={() => navigate('/login')}
          >
            Get Started Free
            <svg viewBox="0 0 20 20" fill="currentColor" className="hero-btn-icon">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            id="hero-learn-more"
            className="hero-btn hero-btn--ghost"
            onClick={() => {
              document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn More
          </button>
        </div>


      </section>



      {/* ── Features ── */}
      <section id="features-section" className="hero-features">
        <h2 className="hero-features__title">Why Choose Credit Score AI?</h2>
        <p className="hero-features__sub">Everything you need to understand your financial standing — in one place.</p>
        <div className="hero-features__grid">
          {features.map((f) => (
            <div key={f.title} className="hero-feature-card">
              <div className="hero-feature-card__icon">{f.icon}</div>
              <h3 className="hero-feature-card__title">{f.title}</h3>
              <p className="hero-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="hero-cta-banner">
        <h2 className="hero-cta-banner__title">Ready to see your score?</h2>
        <p className="hero-cta-banner__sub">Join thousands of users who trust Credit Score AI for instant, unbiased credit assessments.</p>
        <button
          id="hero-cta-login"
          className="hero-btn hero-btn--primary hero-btn--lg"
          onClick={() => navigate('/login')}
        >
          Check My Score Now →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="hero-footer">
        <span>© 2026 Credit Score AI · Powered by XGBoost & FastAPI</span>
      </footer>
    </div>
  );
}
