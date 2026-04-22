import { Shield, ShieldX, Zap, ArrowRightLeft } from 'lucide-react';
import './DApp.css';

function DApp() {
  const apiKey = "MW8D5nfhcrQ_FX_Qq29fOAGe4mV5esP3I4kk9lDK0H8";

  // As per user request, we use the main embedded widget id, but also pass the api key.
  const widgetId = "117b56c2d987a0a5";
  const widgetUrl = `https://www.ghosty.cash/swap-widget/${widgetId}?apiKey=${apiKey}&receive-address=&from=&to=&amount=&support=false`;

  return (
    <div className="app-container">
      {/* Background Orbs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-logo">
          <Shield className="logo-icon" size={32} />
          <span className="logo-text">PrivyCash</span>
        </div>
        <div className="nav-links">
          <a href="#swap">Swap</a>
          <a href="#features">Features</a>
          <a href=" " target="_blank" rel="noreferrer" className="btn-docs">Docs</a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">

        {/* Left Hero Content */}
        <section className="hero-section animate-fade-in">
          <div className="badge">
            <ShieldX size={16} /> Privacy-First Swaps
          </div>
          <h1 className="hero-title">
            Unrestricted <br /> <span className="text-gradient">Cross-Chain</span> Swaps
          </h1>
          <p className="hero-subtitle">
            Effortlessly swap over 240 crypto assets anonymously and quickly across multiple blockchains directly in your dApp.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Zap size={24} /></div>
              <h3>Lightning Fast</h3>
              <p>Instant finality across all supported chains.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><ArrowRightLeft size={24} /></div>
              <h3>Cross-Chain</h3>
              <p>Seamlessly bridge your assets across 20+ networks.</p>
            </div>
          </div>
        </section>

        {/* Right Widget Panel */}
        <section className="widget-section">
          <div className="widget-container glass-panel animate-float">
            <div className="widget-header">
              <div className="dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="widget-title">Privy Swap</span>
            </div>
            <div className="widget-body">
              <iframe
                id="privycash-widget"
                src={widgetUrl}
                style={{
                  width: "100%",
                  height: "660px",
                  minWidth: "360px",
                  borderRadius: "15px",
                  border: "none",
                  overflow: "hidden"
                }}
                title="PrivyCash Swap Widget"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DApp;
