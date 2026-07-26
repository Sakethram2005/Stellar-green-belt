// src/components/ConnectWallet.jsx
import { shortAddress } from "../lib/format";

export default function ConnectWallet({ address, loading, onConnect, onDisconnect }) {
  if (address) {
    return (
      <div className="wallet-connected">
        <span className="dot green" />
        <span className="wallet-addr">{shortAddress(address)}</span>
        <button className="btn btn-ghost btn-sm" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    );
  }
  return (
    <button className="btn btn-primary btn-sm" onClick={onConnect} disabled={loading}>
      {loading ? "Connecting…" : "Connect Freighter"}
    </button>
  );
}
