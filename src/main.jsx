/**
=========================================================
* SentryOS interface prototype
* Based on Material Tailwind Dashboard React v2.1.0
* Copyright 2023 Creative Tim — MIT licensed
=========================================================
*/
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-500.css";
import "@fontsource/source-sans-3/latin-600.css";
import "@fontsource/source-sans-3/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./tailwind.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
