// src/components/EscrowCard.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import StatusBadge from "./StatusBadge";
import { shortAddress, stroopsToXlm, formatDate } from "../lib/format";
import { fundEscrow, approveEscrow, cancelEscrow } from "../lib/soroban";
import { EXPLORER_TX } from "../lib/config";

export default function EscrowCard({ escrow, address, onRefresh }) {
  const [loading, setLoading] = useState(false);

  const isClient     = address === escrow.client;
  const isFreelancer = address === escrow.freelancer;

  const handle = async (label, fn) => {
    setLoading(true);
    const tid = toast.loading(`${label}… waiting for signature`);
    try {
      const result = await fn();
      toast.success(
        <span>
          {label} success!{" "}
          <a href={`${EXPLORER_TX}/${result.hash}`} target="_blank" rel="noreferrer"
             style={{ color: "#63b3ed" }}>View TX ↗</a>
        </span>,
        { id: tid, duration: 8000 }
      );
      onRefresh();
    } catch (e) {
      toast.error(e.message || "Transaction failed", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`escrow-card ${escrow.status.toLowerCase()}`}>
      <div className="escrow-card-header">
        <div>
          <span className="escrow-id">#{escrow.id}</span>
          {isClient     && <span className="role-badge client">You: Client</span>}
          {isFreelancer && <span className="role-badge freelancer">You: Freelancer</span>}
        </div>
        <StatusBadge status={escrow.status} />
      </div>

      <p className="escrow-description">{escrow.description}</p>

      <div className="escrow-meta">
        <div>
          <span className="meta-label">Amount</span>
          <span className="meta-value amount">{stroopsToXlm(escrow.amount)} XLM</span>
        </div>
        <div>
          <span className="meta-label">Client</span>
          <span className="meta-value mono">{shortAddress(escrow.client)}</span>
        </div>
        <div>
          <span className="meta-label">Freelancer</span>
          <span className="meta-value mono">{shortAddress(escrow.freelancer)}</span>
        </div>
        <div>
          <span className="meta-label">Created</span>
          <span className="meta-value">{formatDate(escrow.created_at)}</span>
        </div>
      </div>

      {isClient && (
        <div className="escrow-actions">
          {escrow.status === "Active" && (
            <button
              className="btn btn-primary btn-sm"
              disabled={loading}
              onClick={() => handle("Fund Escrow", () => fundEscrow(address, escrow.id))}
            >
              💰 Fund Escrow
            </button>
          )}
          {escrow.status === "Funded" && (
            <button
              className="btn btn-success btn-sm"
              disabled={loading}
              onClick={() => handle("Approve & Release", () => approveEscrow(address, escrow.id))}
            >
              ✅ Approve & Release
            </button>
          )}
          {(escrow.status === "Active" || escrow.status === "Funded") && (
            <button
              className="btn btn-danger btn-sm"
              disabled={loading}
              onClick={() => handle("Cancel Escrow", () => cancelEscrow(address, escrow.id))}
            >
              ✕ Cancel
            </button>
          )}
        </div>
      )}

      {isFreelancer && escrow.status === "Funded" && (
        <div className="escrow-note">
          ⏳ Waiting for client to approve delivery and release payment.
        </div>
      )}
      {escrow.status === "Completed" && (
        <div className="escrow-note success-note">
          🎉 Payment released to freelancer!
        </div>
      )}
      {escrow.status === "Cancelled" && (
        <div className="escrow-note cancelled-note">
          ✕ This escrow was cancelled.
        </div>
      )}
    </div>
  );
}
