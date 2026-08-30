import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppointmentProvider } from "./context/AppointmentContext";
import { AuthProvider } from "./context/AuthContext";
import { ClinicProvider } from "./context/ClinicContext";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element with id "root" not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ClinicProvider>
          <AppointmentProvider>
            <App />
          </AppointmentProvider>
        </ClinicProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
