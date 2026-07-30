// src/components/EscrowCard.jsx - v2 with dispute button
import { useState } from "react";
import toast from "react-hot-toast";
import StatusBadge from "./StatusBadge";
import { shortAddress, stroopsToXlm, formatDate, formatDeadline } from "../lib/format";
import { fundEscrow, approveEscrow, cancelEscrow, raiseDispute } from "../lib/soroban";
import { EXPLORER_TX } from "../lib/config";

export default function EscrowCard({ escrow, address, onRefresh }) {
  const [loading, setLoading] = useState(false);

  const isClient     = address === escrow.client;
  const isFreelancer = address === escrow.freelancer;
  const deadline     = formatDeadline(escrow.deadline);
  const isExpired    = deadline === "Expired";

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

      {/* Deadline badge */}
      {escrow.deadline > 0 && (
        <div className={`deadline-badge ${isExpired ? "expired" : ""}`}>
          ⏰ Deadline: {deadline}
        </div>
      )}

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

      {/* Action buttons */}
      {isClient && (
        <div className="escrow-actions">
          {escrow.status === "Active" && (
            <button className="btn btn-primary btn-sm" disabled={loading}
              onClick={() => handle("Fund Escrow", () => fundEscrow(address, escrow.id))}>
              💰 Fund Escrow
            </button>
          )}
          {escrow.status === "Funded" && (
            <button className="btn btn-success btn-sm" disabled={loading}
              onClick={() => handle("Approve & Release", () => approveEscrow(address, escrow.id))}>
              ✅ Approve & Release
            </button>
          )}
          {escrow.status === "Funded" && (
            <button className="btn btn-pink btn-sm" disabled={loading}
              onClick={() => handle("Raise Dispute", () => raiseDispute(address, escrow.id))}>
              ⚖️ Dispute
            </button>
          )}
          {(escrow.status === "Active" || escrow.status === "Funded") && (
            <button className="btn btn-danger btn-sm" disabled={loading}
              onClick={() => handle("Cancel Escrow", () => cancelEscrow(address, escrow.id))}>
              ✕ Cancel
            </button>
          )}
        </div>
      )}

      {isFreelancer && escrow.status === "Funded" && (
        <div className="escrow-actions">
          <button className="btn btn-pink btn-sm" disabled={loading}
            onClick={() => handle("Raise Dispute", () => raiseDispute(address, escrow.id))}>
            ⚖️ Raise Dispute
          </button>
        </div>
      )}

      {/* Status notes */}
      {escrow.status === "Completed" && (
        <div className="escrow-note success-note">🎉 Payment released to freelancer!</div>
      )}
      {escrow.status === "Cancelled" && (
        <div className="escrow-note cancelled-note">✕ This escrow was cancelled.</div>
      )}
      {escrow.status === "Disputed" && (
        <div className="escrow-note disputed-note">⚖️ Dispute raised. Under review.</div>
      )}
      {isFreelancer && escrow.status === "Funded" && (
        <div className="escrow-note">⏳ Waiting for client to approve delivery.</div>
      )}
    </div>
  );
}
