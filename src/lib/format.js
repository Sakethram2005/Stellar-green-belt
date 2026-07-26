// src/lib/format.js

// 1 XLM = 10,000,000 stroops
const STROOPS_PER_XLM = 10_000_000n;

export const xlmToStroops = (xlm) =>
  BigInt(Math.round(parseFloat(xlm) * 10_000_000));

export const stroopsToXlm = (stroops) =>
  (Number(BigInt(stroops)) / 10_000_000).toFixed(7).replace(/\.?0+$/, "");

export const shortAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—";

export const shortTx = (hash) =>
  hash ? `${hash.slice(0, 12)}…${hash.slice(-8)}` : "";

export const formatDate = (timestamp) =>
  new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

export const STATUS_LABEL = {
  Active:    { text: "Active",    color: "#63b3ed" },
  Funded:    { text: "Funded",    color: "#f6ad55" },
  Completed: { text: "Completed", color: "#68d391" },
  Cancelled: { text: "Cancelled", color: "#fc8181" },
};
