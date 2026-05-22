import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global/styles/index.scss";
import App from "./App.tsx";
import { CursorProvider } from "./contexts/CursorContext.tsx";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CursorProvider>
      <App />
      <Analytics />
    </CursorProvider>
  </StrictMode>
);
