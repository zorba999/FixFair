import { shortAddr } from "../lib/format.js";

export default function Header({ onHome, onDocket, onCreate, onToggleTheme, account, onConnect }) {
  return (
    <header className="hdr">
      <div className="hdr-in">
        <button className="brand-btn" onClick={onHome}>
          <svg viewBox="0 0 100 100" width="34" height="34" style={{ flex: "none" }}>
            <defs>
              <linearGradient id="fxg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#5b8cff" />
                <stop offset="1" stopColor="#7c5cff" />
              </linearGradient>
            </defs>
            <g className="spin-logo">
              <circle cx="50" cy="50" r="46" fill="none" stroke="url(#fxg)" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
            </g>
            <g stroke="url(#fxg)" strokeWidth="3" strokeLinecap="round" fill="none">
              <line x1="50" y1="26" x2="50" y2="66" />
              <line x1="28" y1="38" x2="72" y2="38" />
              <line x1="28" y1="38" x2="28" y2="47" />
              <line x1="72" y1="38" x2="72" y2="47" />
              <path d="M21 47 a7 7 0 0 0 14 0" />
              <path d="M65 47 a7 7 0 0 0 14 0" />
              <line x1="42" y1="66" x2="58" y2="66" />
            </g>
            <circle cx="50" cy="24" r="3.4" fill="url(#fxg)" />
          </svg>
          <span className="brand-name">
            Fix<em>Fair</em>
          </span>
        </button>

        <nav className="hdr-nav">
          <button className="nav-link" onClick={onDocket}>The Docket</button>
          <button className="nav-link" onClick={onCreate}>Open a case</button>

          <button className="theme-toggle" aria-label="Toggle theme" onClick={onToggleTheme}>
            <span className="theme-knob">
              <svg className="icon-moon" viewBox="0 0 24 24" width="14" height="14" style={{ position: "absolute" }}>
                <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="#fff" />
              </svg>
              <svg className="icon-sun" viewBox="0 0 24 24" width="15" height="15" style={{ position: "absolute" }} stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" fill="#fff" stroke="none" />
                <line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
                <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
                <line x1="5" y1="5" x2="6.5" y2="6.5" /><line x1="17.5" y1="17.5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="17.5" y2="6.5" /><line x1="6.5" y1="17.5" x2="5" y2="19" />
              </svg>
            </span>
          </button>

          {account ? (
            <span className="wallet-btn" title={account}>
              <span className="dot" /> {shortAddr(account)}
            </span>
          ) : (
            <button className="wallet-btn wallet-btn--off" onClick={onConnect}>
              Connect wallet
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
