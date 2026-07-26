// src/components/FeedbackButton.jsx
export default function FeedbackButton() {
  const url = import.meta.env.VITE_GOOGLE_FORM_URL || "#";
  return (
    <a href={url} target="_blank" rel="noreferrer" className="feedback-btn">
      💬 Share Feedback
    </a>
  );
}
