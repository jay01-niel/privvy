import { useEffect, useRef } from 'react';
import {
  Shield,
  ArrowRight,
  Layers,
  Zap,
  Lock,
  Globe,
  Coins,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import './index.css';
import './Landing.css';

/* ─── Configure your main dapp URL here ─── */
const DAPP_URL = 'https://privycash.vercel.app';

/* ═══════════════════════════════════════════
   PARTICLE NETWORK CANVAS
   ═══════════════════════════════════════════ */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number; color: string;
    }
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawn = () => {
      particles = [];
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 80);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 0.5,
          color: Math.random() > 0.5
            ? 'rgba(188, 69, 255, 0.55)'
            : 'rgba(74, 222, 128, 0.35)',
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(188, 69, 255, ${0.12 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    spawn();
    draw();

    const handleResize = () => { resize(); spawn(); };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* ═══════════════════════════════════════════
   FEATURES DATA
   ═══════════════════════════════════════════ */
const FEATURES = [
  { icon: <Lock size={24} />,        title: 'No KYC Required',   desc: 'Swap freely without identity verification. Your privacy is non-negotiable.' },
  { icon: <Eye size={24} />,         title: 'Break the Trace',   desc: 'The on-chain link between sender and receiver is completely severed.' },
  { icon: <Globe size={24} />,       title: '20+ Networks',      desc: 'BNB, SOL, ETH, AVAX, Polygon, Arbitrum, and many more supported.' },
  { icon: <Zap size={24} />,         title: 'Lightning Fast',    desc: 'Sub-minute settlement times. Your funds arrive before you blink.' },
  { icon: <Coins size={24} />,       title: '240+ Assets',       desc: 'The widest privacy swap coverage in the entire DeFi ecosystem.' },
  { icon: <ShieldCheck size={24} />, title: 'Non-Custodial',     desc: 'Your keys, your crypto, always. We never touch your funds.' },
];

/* ═══════════════════════════════════════════
   APP
   ═══════════════════════════════════════════ */
export default function App() {
  /* scroll-reveal observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('revealed');
      }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      <ParticleCanvas />

      {/* ── NAV ── */}
      <nav className="nav" id="nav">
        <div className="nav-brand">
          <Shield size={26} />
          <span>PrivyCash</span>
        </div>
        <div className="nav-menu">
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href={DAPP_URL} className="nav-cta" id="nav-launch">Launch App</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="hero-badge">
          <EyeOff size={14} />
          <span>Privacy-First Protocol</span>
        </div>

        <h1 className="hero-headline">
          Swap Anything.<br />
          <span className="gradient-text">Trace Nothing.</span>
        </h1>

        <p className="hero-sub">
          The first privacy-native cross-chain swap. Send BNB, receive SOL —
          no bridges, no traces, no limits.
        </p>

        <a href={DAPP_URL} className="cta-button" id="hero-cta">
          <span>Enter the Void</span>
          <ArrowRight size={20} />
        </a>

        {/* orbiting chain logos */}
        <div className="orbit-container">
          <div className="orbit-center">
            <Shield size={30} />
          </div>
          <div className="orbit-ring">
            <div className="chain-badge">BNB</div>
            <div className="chain-badge">SOL</div>
            <div className="chain-badge">ETH</div>
            <div className="chain-badge">AVAX</div>
            <div className="chain-badge">MATIC</div>
            <div className="chain-badge">ARB</div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section how-it-works" id="how-it-works">
        <div className="section-header reveal-on-scroll">
          <span className="section-badge">How It Works</span>
          <h2>Three Steps to <span className="gradient-text">Invisible</span> Swaps</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card glass reveal-on-scroll">
            <div className="step-number">01</div>
            <div className="step-icon"><Layers size={26} /></div>
            <h3>Choose Your Chains</h3>
            <p>Select any source chain and destination. 240+ assets across 20+ networks — mix and match freely.</p>
          </div>

          <div className="step-connector reveal-on-scroll">
            <ArrowRight size={24} />
          </div>

          <div className="step-card glass reveal-on-scroll">
            <div className="step-number">02</div>
            <div className="step-icon"><EyeOff size={26} /></div>
            <h3>Ghost the Transaction</h3>
            <p>Your swap is fragmented across private routes. The on-chain link between sender and receiver is broken.</p>
          </div>

          <div className="step-connector reveal-on-scroll">
            <ArrowRight size={24} />
          </div>

          <div className="step-card glass reveal-on-scroll">
            <div className="step-number">03</div>
            <div className="step-icon"><Coins size={26} /></div>
            <h3>Receive Instantly</h3>
            <p>Funds arrive at your destination wallet in minutes. Fast, clean, untraceable. Simple as that.</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section features" id="features">
        <div className="section-header reveal-on-scroll">
          <span className="section-badge">Features</span>
          <h2>Why <span className="gradient-text">PrivyCash</span>?</h2>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card glass reveal-on-scroll" key={i}>
              <div className="feature-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner reveal-on-scroll">
        <div className="cta-banner-inner glass">
          <h2>Ready to Go <span className="gradient-text">Ghost Mode</span>?</h2>
          <p>Join thousands of users swapping privately across chains.</p>
          <a href={DAPP_URL} className="cta-button" id="bottom-cta">
            <span>Enter the Void</span>
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Shield size={22} />
            <span>PrivyCash</span>
          </div>
          <div className="footer-links">
            <a href="#">Docs</a>
            <a href="#">Twitter</a>
            <a href="#">Telegram</a>
          </div>
          <p className="footer-copy">&copy; 2025 PrivyCash. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
