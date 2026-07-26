import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import * as Sentry from "@sentry/react";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.jsx";
import "./index.css";

// ── Sentry error monitoring ───────────────────────────────────────────────────
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  enabled: import.meta.env.PROD,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#0e1520",
            color: "#e8f0fe",
            border: "1px solid rgba(99,179,237,0.2)",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#68d391", secondary: "#0e1520" } },
          error:   { iconTheme: { primary: "#fc8181", secondary: "#0e1520" } },
        }}
      />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);
