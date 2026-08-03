import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/editorial/fonts.css";
import "../styles/editorial/tokens.css";
import App from "./AppWorkspace";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
