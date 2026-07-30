// src/lib/format.js - v2

export const xlmToStroops = (xlm) =>
  BigInt(Math.round(parseFloat(xlm) * 10_000_000));

export const stroopsToXlm = (stroops) =>
  (Number(BigInt(stroops)) / 10_000_000).toFixed(2);

export const shortAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—";

export const shortTx = (hash) =>
  hash ? `${hash.slice(0, 12)}…${hash.slice(-8)}` : "";

export const formatDate = (timestamp) =>
  new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

export const formatDeadline = (timestamp) => {
  if (!timestamp || timestamp === 0) return null;
  const now  = Math.floor(Date.now() / 1000);
  const diff = Number(timestamp) - now;
  if (diff <= 0) return "Expired";
  const days  = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
};

export const STATUS_LABEL = {
  Active:    { text: "Active",    color: "#63b3ed" },
  Funded:    { text: "Funded",    color: "#f6ad55" },
  Completed: { text: "Completed", color: "#68d391" },
  Cancelled: { text: "Cancelled", color: "#fc8181" },
  Disputed:  { text: "Disputed",  color: "#f472b6" },
};