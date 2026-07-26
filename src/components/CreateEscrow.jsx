// src/components/CreateEscrow.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { createEscrow } from "../lib/soroban";
import { xlmToStroops } from "../lib/format";
import { EXPLORER_TX } from "../lib/config";

export default function CreateEscrow({ address, onSuccess }) {
  const [freelancer,   setFreelancer]   = useState("");
  const [amount,       setAmount]       = useState("");
  const [description,  setDescription]  = useState("");
  const [loading,      setLoading]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address) { toast.error("Connect your wallet first."); return; }
    if (!freelancer.trim()) { toast.error("Freelancer address required."); return; }
    if (freelancer.trim() === address) { toast.error("You cannot escrow to yourself."); return; }
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid XLM amount."); return; }
    if (!description.trim()) { toast.error("Add a project description."); return; }

    setLoading(true);
    const tid = toast.loading("Creating escrow… waiting for signature");

    try {
      const stroops = xlmToStroops(amount);
      const result  = await createEscrow(address, freelancer.trim(), stroops, description.trim());

      toast.success(
        <span>
          Escrow created!{" "}
          <a href={`${EXPLORER_TX}/${result.hash}`} target="_blank" rel="noreferrer"
             style={{ color: "#63b3ed" }}>View TX ↗</a>
        </span>,
        { id: tid, duration: 8000 }
      );

      setFreelancer("");
      setAmount("");
      setDescription("");
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || "Transaction failed", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-escrow">
      <h2>Create New Escrow</h2>
      <p className="section-sub">
        Lock funds securely. Release only after work is approved.
      </p>

      {!address && (
        <div className="info-box">
          ⚠ Connect your Freighter wallet to create an escrow.
        </div>
      )}

      <form onSubmit={handleSubmit} className="escrow-form">
        <div className="field">
          <label htmlFor="freelancer">Freelancer Wallet Address</label>
          <input
            id="freelancer"
            type="text"
            className="input mono"
            placeholder="G…"
            value={freelancer}
            onChange={(e) => setFreelancer(e.target.value.trim())}
            disabled={loading || !address}
            spellCheck={false}
          />
        </div>

        <div className="field">
          <label htmlFor="amount">Amount (XLM)</label>
          <div className="input-suffix-wrap">
            <input
              id="amount"
              type="number"
              className="input"
              placeholder="10"
              min="0.0000001"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading || !address}
            />
            <span className="input-suffix">XLM</span>
          </div>
          {amount && (
            <span className="field-hint">
              = {(parseFloat(amount) * 10_000_000).toLocaleString()} stroops
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="description">Project Description</label>
          <textarea
            id="description"
            className="input"
            placeholder="e.g. Logo design for startup — 3 concepts, 2 revisions"
            rows={3}
            maxLength={200}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || !address}
          />
          <span className="char-count">{description.length}/200</span>
        </div>

        <button
          type="submit"
          className="btn btn-primary full-width"
          disabled={loading || !address}
        >
          {loading ? <><span className="spinner" /> Creating…</> : "🔒 Create Escrow"}
        </button>
      </form>

      <div className="how-it-works">
        <h3>How it works</h3>
        <ol>
          <li><strong>Create</strong> — define the job, amount, and freelancer address</li>
          <li><strong>Fund</strong> — lock XLM in the smart contract</li>
          <li><strong>Approve</strong> — after work is done, release payment to freelancer</li>
          <li><strong>Cancel</strong> — get a full refund if work hasn't started</li>
        </ol>
      </div>
    </div>
  );
}
