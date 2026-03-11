import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./receptionist.css";

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconId = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <circle cx="8" cy="12" r="2"/>
    <path d="M13 10h4M13 14h4"/>
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconClipboard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

// ── Mock registered receptionists (in real app this comes from your backend) ───
// Admin registers receptionists — their ID + password stored in DB
// Here we simulate two registered receptionists for demo purposes
const REGISTERED_RECEPTIONISTS = [
  { id: "REC11", password: "MedFlow2026!" },
  { id: "REC12", password: "Kasalika55" },
];

const MAX_ATTEMPTS = 3;

// ── Login Form ─────────────────────────────────────────  ────────────────────────
export default function ReceptionistLogin({ onLoginSuccess, onBack }) {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId]     = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [attempts, setAttempts]         = useState(0);
  const [locked, setLocked]             = useState(false);
  const [loading, setLoading]           = useState(false);

  const isBlocked = locked || attempts >= MAX_ATTEMPTS;

  const handleLogin = (e) => {
    e.preventDefault();
    if (isBlocked) return;

    // Basic empty field check
    if (!employeeId.trim() || !password.trim()) {
      setError("Please enter both your ID number and password.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate a network call (replace with real API call)
    setTimeout(() => {
      const match = REGISTERED_RECEPTIONISTS.find(
        (r) => r.id === employeeId.trim() && r.password === password
      );

      if (match) {
        // Success — navigate to Receptionist Dashboard
        if (onLoginSuccess) {
          onLoginSuccess({ id: employeeId.trim(), role: "receptionist" });
        }
        navigate("/receptionist-dashboard", { state: { receptionistId: employeeId.trim() } });
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setLocked(true);
          setError("Too many failed attempts. Access has been locked. Contact your administrator.");
        } else {
          setError(
            `Incorrect ID or password. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining.`
          );
        }
      }

      setLoading(false);
    }, 900);
  };

  return (
    <div className="login-page">

      {/* Top bar */}
      <header className="login-topbar">
        <div className="login-topbar__brand">
          <div className="login-topbar__logo">M</div>
          <div>
            <div className="login-topbar__name">MedFlow</div>
            <div className="login-topbar__tagline">Hospital management system</div>
          </div>
        </div>
        <button className="login-back-btn" onClick={onBack}>
          <IconArrowLeft /> Back to portals
        </button>
      </header>

      {/* Card */}
      <main className="login-main">
        <div className={`login-card${isBlocked ? " login-card--locked" : ""}`}>

          {/* Card header */}
          <div className="login-card__header">
            <div className="login-card__icon">
              <IconClipboard />
            </div>
            <h1 className="login-card__title">Receptionist portal</h1>
            <p className="login-card__subtitle">
              Sign in with your staff ID and password assigned by your administrator.
            </p>
          </div>

          {/* Locked state */}
          {isBlocked && (
            <div className="login-alert login-alert--danger">
              <IconAlert />
              <div>
                <strong>Access locked</strong>
                <p>Too many failed attempts. Please contact your system administrator to reset your access.</p>
              </div>
            </div>
          )}

          {/* Form */}
          {!isBlocked && (
            <form className="login-form" onSubmit={handleLogin} noValidate>

              {/* Error banner */}
              {error && (
                <div className="login-alert login-alert--warning">
                  <IconAlert />
                  <span>{error}</span>
                </div>
              )}

              {/* ID field */}
              <div className="login-field">
                <label className="login-label" htmlFor="employeeId">
                  Staff ID number
                </label>
                <div className="login-input-wrap">
                  <span className="login-input-icon"><IconId /></span>
                  <input
                    id="employeeId"
                    className="login-input"
                    type="text"
                    placeholder="e.g. REC-0011"
                    value={employeeId}
                    onChange={(e) => { setEmployeeId(e.target.value); setError(""); }}
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
                <p className="login-hint">Enter the ID number provided by your administrator.</p>
              </div>

              {/* Password field */}
              <div className="login-field">
                <label className="login-label" htmlFor="password">
                  Password
                </label>
                <div className="login-input-wrap">
                  <span className="login-input-icon"><IconLock /></span>
                  <input
                    id="password"
                    className="login-input login-input--password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="login-toggle-pw"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              {/* Attempts indicator */}
              {attempts > 0 && (
                <div className="login-attempts">
                  {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                    <span
                      key={i}
                      className={`login-attempts__dot${i < attempts ? " login-attempts__dot--used" : ""}`}
                    />
                  ))}
                  <span className="login-attempts__label">
                    {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts === 1 ? "" : "s"} left
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                className={`login-submit${loading ? " login-submit--loading" : ""}`}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="login-spinner" />
                ) : (
                  <>
                    <IconLock /> Sign in to portal
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="login-card__footer">
            Forgot your credentials? Contact your system administrator.
          </div>
        </div>

        <p className="login-page__security-note">
          <IconLock /> All login activity is encrypted and recorded for security purposes.
        </p>
      </main>
    </div>
  );
}
