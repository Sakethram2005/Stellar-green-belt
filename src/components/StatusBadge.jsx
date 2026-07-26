// src/components/StatusBadge.jsx
import { STATUS_LABEL } from "../lib/format";

export default function StatusBadge({ status }) {
  const s = STATUS_LABEL[status] || { text: status, color: "#64748b" };
  return (
    <span className="status-badge" style={{ color: s.color, borderColor: s.color + "44", background: s.color + "15" }}>
      {s.text}
    </span>
  );
}
