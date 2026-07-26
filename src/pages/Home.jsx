// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";

export default function Home({ address, onConnect, loading }) {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-badge">Built on Stellar Testnet</div>
        <h1 className="hero-title">
          Trustless Payments<br />for Freelancers
        </h1>
        <p className="hero-sub">
          Lock funds in a smart contract. Release payment only after work is approved.
          No middlemen, no delays, no disputes.
        </p>
        <div className="hero-actions">
          {address ? (
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/dashboard")}>
              Go to Dashboard →
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={onConnect} disabled={loading}>
              {loading ? "Connecting…" : "Connect Wallet to Start"}
            </button>
          )}
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-lg"
          >
            View on Explorer ↗
          </a>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Funds Locked Securely</h3>
          <p>Client deposits XLM into a Soroban smart contract. Neither party can move funds without approval.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">✅</div>
          <h3>Release on Approval</h3>
          <p>Once the freelancer delivers, the client clicks Approve. Funds transfer instantly on-chain.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">↩</div>
          <h3>Cancel & Refund</h3>
          <p>Client can cancel before work starts for a full refund. No questions asked.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌍</div>
          <h3>Cross-Border Ready</h3>
          <p>Stellar's fast, low-fee network makes this perfect for international freelance work.</p>
        </div>
      </div>

      <div className="flow-section">
        <h2>Payment Flow</h2>
        <div className="flow-steps">
          {[
            { n: "1", title: "Create Escrow", desc: "Client defines job, amount, and freelancer address" },
            { n: "2", title: "Fund Escrow",   desc: "Client locks XLM in the smart contract" },
            { n: "3", title: "Work Delivered", desc: "Freelancer completes work off-chain" },
            { n: "4", title: "Approve & Pay", desc: "Client approves → funds released instantly" },
          ].map((s) => (
            <div key={s.n} className="flow-step">
              <div className="flow-num">{s.n}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
