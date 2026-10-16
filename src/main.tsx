import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/glassmorphism.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";

console.log("ENV CHECK:", import.meta.env.VITE_SUPABASE_URL);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);