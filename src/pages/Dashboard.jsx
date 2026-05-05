import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconStethoscope = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
    <path d="M8 15v1a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-4"/>
    <circle cx="20" cy="10" r="2"/>
  </svg>
);

const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconClipboard = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>
  </svg>
);

const IconUser = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );

const IconLock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ── Portal definitions ───────────────────────────
const portals = [
  {
    id: "patient",
    label: "Patient portal",
    subtitle: "Book visits & check symptoms",
    icon: <IconUser />,
    accent: "#3b82f6",
    accentLight: "#eff6ff",
  },
  {
    id: "doctor",
    label: "Doctor portal",
    subtitle: "Authorized clinical staff only",
    icon: <IconStethoscope />,
    accent: "#10b981",
    accentLight: "#f0fdf4",
  },
  {
    id: "receptionist",
    label: "Receptionist portal",
    subtitle: "Front desk staff only",
    icon: <IconClipboard />,
    accent: "#f97316",
    accentLight: "#fff7ed",
  },
  {
    id: "admin",
    label: "Admin portal",
    subtitle: "System administrators only",
    icon: <IconShield />,
    accent: "#7c3aed",
    accentLight: "#f5f3ff",
  },
];

// ── Portal Card ────────────────────────────────────────────────────────────────
function PortalCard({ portal, onEnter, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`portal-card${hovered ? " portal-card--hovered" : ""}`}
      style={{
        "--accent": portal.accent,
        "--accent-light": portal.accentLight,
        animationDelay: `${index * 110}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onEnter(portal.id)}
    >
      <div className="portal-card__icon">{portal.icon}</div>

      <div className="portal-card__meta">
        <h2 className="portal-card__label">{portal.label}</h2>
        <p className="portal-card__subtitle">{portal.subtitle}</p>
      </div>

      <div className="portal-card__lock-notice">
        <IconLock />
        <span>Login required</span>
      </div>

      <button
        className="portal-card__cta"
        onClick={(e) => { e.stopPropagation(); onEnter(portal.id); }}
      >
        Enter portal <IconArrow />
      </button>
    </div>
  );
}

// ── Top Bar ────────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <div className="topbar__logo" style={{backgroundColor: '#3b82f6'}}>C</div>
        <div>
          <div className="topbar__name">CareConnect</div>
          <div className="topbar__tagline">AI-Optimized Healthcare</div>
        </div>
      </div>
      <div className="topbar__secure-badge" style={{color: '#10b981'}}>
        <IconLock />
        Secure gateway
      </div>
    </header>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  const handleEnter = (id) => {
    switch(id) {
      case 'patient': navigate('/patient-login'); break;
      case 'doctor': navigate('/doctor-login'); break;
      case 'receptionist': navigate('/receptionist-login'); break;
      default: alert(`${id.charAt(0).toUpperCase() + id.slice(1)} Portal login is currently restricted to local admin.`);
    }
  };

  return (
    <div className="dashboard">
      <TopBar />

      <main className="dashboard__main">
        <div className="dashboard__hero">
          <h1 className="dashboard__title">Healthcare at your fingertips</h1>
          <p className="dashboard__desc">
            The integrated CareConnect platform bridges AI triage with professional clinical management.
            Please select your portal to continue.
          </p>
        </div>

        <div className="portals-grid">
          {portals.map((p, i) => (
            <PortalCard key={p.id} portal={p} onEnter={handleEnter} index={i} />
          ))}
        </div>

        <p className="dashboard__footer-note">
          <IconLock />
          All sessions are encrypted and activity is logged for compliance.
        </p>
      </main>
    </div>
  );
}
