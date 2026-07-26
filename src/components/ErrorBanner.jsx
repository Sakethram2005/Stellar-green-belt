// src/components/ErrorBanner.jsx
export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="error-banner">
      <span>⚠ {message}</span>
      {onClose && <button className="btn-close" onClick={onClose}>✕</button>}
    </div>
  );
}
