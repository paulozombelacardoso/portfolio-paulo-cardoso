import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// O painel admin é carregado num bundle separado, só quando se visita /admin.
const AdminApp = lazy(() => import("./admin/AdminApp"));
const isAdmin = /^\/admin(\/|$)/.test(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
