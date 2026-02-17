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
  document.body.innerHTML = `
    <div style="padding:20px;color:white;background:#0a0a0b;height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;">
      <h2>App failed to load</h2>
      <p>Please clear site data and refresh.</p>
    </div>
  `;
}
