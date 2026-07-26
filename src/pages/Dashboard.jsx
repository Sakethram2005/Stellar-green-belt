// src/pages/Dashboard.jsx
import { useState } from "react";
import CreateEscrow from "../components/CreateEscrow";
import EscrowCard from "../components/EscrowCard";
import LoadingSpinner from "../components/LoadingSpinner";
import FeedbackButton from "../components/FeedbackButton";
import { useEscrowList } from "../hooks/useEscrowList";
import { shortAddress } from "../lib/format";

export default function Dashboard({ address, onConnect, loading: walletLoading }) {
  const [tab, setTab] = useState("list"); // list | create
  const { escrows, loading, error, refresh } = useEscrowList(address);

  const active    = escrows.filter((e) => e.status === "Active" || e.status === "Funded");
  const completed = escrows.filter((e) => e.status === "Completed" || e.status === "Cancelled");

  if (!address) {
    return (
      <div className="dashboard-empty">
        <div className="empty-icon">🔐</div>
        <h2>Connect Your Wallet</h2>
        <p>Connect Freighter to view and manage your escrows.</p>
        <button className="btn btn-primary btn-lg" onClick={onConnect} disabled={walletLoading}>
          {walletLoading ? "Connecting…" : "Connect Freighter"}
        </button>
        <p className="hint">Don't have Freighter? <a href="https://www.freighter.app/" target="_blank" rel="noreferrer">Install it here →</a></p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="wallet-line">
            <span className="dot green" /> {shortAddress(address)}
          </p>
        </div>
        <div className="dashboard-header-actions">
          <FeedbackButton />
          <button className="btn btn-ghost btn-sm" onClick={refresh}>↻ Refresh</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{escrows.length}</span>
          <span className="stat-label">Total Escrows</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{active.length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{completed.filter(e => e.status === "Completed").length}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "list"   ? "tab-active" : ""}`} onClick={() => setTab("list")}>
          My Escrows ({escrows.length})
        </button>
        <button className={`tab ${tab === "create" ? "tab-active" : ""}`} onClick={() => setTab("create")}>
          + New Escrow
        </button>
      </div>

      {tab === "create" && (
        <CreateEscrow
          address={address}
          onSuccess={() => { refresh(); setTab("list"); }}
        />
      )}

      {tab === "list" && (
        <div>
          {loading && <LoadingSpinner text="Loading your escrows…" />}
          {error   && <div className="error-banner">⚠ {error}</div>}

          {!loading && escrows.length === 0 && (
            <div className="empty-state">
              <p>No escrows yet.</p>
              <button className="btn btn-primary" onClick={() => setTab("create")}>
                Create Your First Escrow
              </button>
            </div>
          )}

          {active.length > 0 && (
            <div className="escrow-section">
              <h3 className="section-label">Active</h3>
              <div className="escrow-grid">
                {active.map((e) => (
                  <EscrowCard key={e.id} escrow={e} address={address} onRefresh={refresh} />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div className="escrow-section">
              <h3 className="section-label">History</h3>
              <div className="escrow-grid">
                {completed.map((e) => (
                  <EscrowCard key={e.id} escrow={e} address={address} onRefresh={refresh} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
