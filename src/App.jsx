// src/App.jsx
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import ConnectWallet from "./components/ConnectWallet";
import Home      from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { useFreighter } from "./hooks/useFreighter";
import { CONTRACT_ID, EXPLORER_CONTRACT } from "./lib/config";

export default function App() {
  const { address, loading, connect, disconnect } = useFreighter();
  const location = useNavigate();
  const loc      = useLocation();

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-left">
          <Link to="/" className="logo">
            🔒 <span>EscrowPay</span>
          </Link>
          <a
            href={`${EXPLORER_CONTRACT}/${CONTRACT_ID}`}
            target="_blank"
            rel="noreferrer"
            className="contract-badge"
          >
            Testnet
          </a>
        </div>
        <nav className="header-nav">
          <Link to="/"          className={`nav-link ${loc.pathname === "/"          ? "active" : ""}`}>Home</Link>
          <Link to="/dashboard" className={`nav-link ${loc.pathname === "/dashboard" ? "active" : ""}`}>Dashboard</Link>
        </nav>
        <ConnectWallet
          address={address}
          loading={loading}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      </header>

      {/* ── Routes ─────────────────────────────────────────────────────────── */}
      <main className="main">
        <Routes>
          <Route path="/"          element={<Home      address={address} onConnect={connect} loading={loading} />} />
          <Route path="/dashboard" element={<Dashboard address={address} onConnect={connect} loading={loading} />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>
          Built on <a href="https://stellar.org" target="_blank" rel="noreferrer">Stellar</a> Testnet
          · Soroban Smart Contract · Level 4 Green Belt
        </p>
        <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
          Contract: <span className="mono">{CONTRACT_ID.slice(0, 12)}…{CONTRACT_ID.slice(-6)}</span>
        </p>
      </footer>
    </div>
  );
}
