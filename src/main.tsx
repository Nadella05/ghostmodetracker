import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

try {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (err) {
  console.error("App failed to initialize:", err);
  // Build the fallback DOM safely (no innerHTML with strings) to avoid any XSS risk
  const root = document.getElementById("root") || document.body;
  root.replaceChildren();
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "padding:20px;color:white;background:#0a0a0b;height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;";
  const h = document.createElement("h2");
  h.textContent = "App failed to load";
  const p = document.createElement("p");
  p.textContent = "Please clear site data and refresh.";
  wrap.append(h, p);
  root.append(wrap);
}
