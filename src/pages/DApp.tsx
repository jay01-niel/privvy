import { ShieldX, Zap, ArrowRightLeft } from 'lucide-react';
import Logo from '../components/Logo.tsx';
import SwapWidget from '../components/SwapWidget.tsx';
import './DApp.css';

function DApp() {

  return (
    <div className="app-container">
      {/* Background Orbs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-logo">
          <Logo size={32} />
          <span className="logo-text">PrivyCash</span>
        </div>
        <div className="nav-links">
          <a href="#swap">Swap</a>
          <a href="#features">Features</a>
          <a href="https://docs.privycash.app" target="_blank" rel="noreferrer" className="btn-docs">Docs</a>
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
              <SwapWidget />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DApp;
