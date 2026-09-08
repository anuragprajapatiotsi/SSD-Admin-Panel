import { createRoot } from "react-dom/client";
import { AccessibilityProvider } from "./providers/accessibility-provider";
import { ConfirmationProvider } from "./providers/confirmation-provider";
import { QueryProvider } from "./providers/query-provider";
import { AppRouter } from "./routes/app-router";
import { Toaster } from "./components/ui/sonner";
import "./i18n";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <AccessibilityProvider>
    <QueryProvider>
      <ConfirmationProvider><AppRouter /></ConfirmationProvider>
      <Toaster />
    </QueryProvider>
  </AccessibilityProvider>,
);
