// src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ text = "Loading…" }) {
  return (
    <div className="loading-state">
      <span className="spinner" />
      <span>{text}</span>
    </div>
  );
}
