import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import "./index.css";
import App from "./App.jsx";

// Prevent pinch-to-zoom and multi-finger zoom on mobile
if (typeof window !== "undefined") {
  document.addEventListener("gesturestart", (e) => e.preventDefault(), {
    passive: false,
  });
  document.addEventListener("gesturechange", (e) => e.preventDefault(), {
    passive: false,
  });
  document.addEventListener("gestureend", (e) => e.preventDefault(), {
    passive: false,
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
