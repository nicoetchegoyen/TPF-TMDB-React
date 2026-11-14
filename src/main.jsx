import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";

// HashRouter cambia la vista de React sin pedir otra página al servidor.
createRoot(document.getElementById("root")).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
