import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AppointmentProvider } from "./context/AppointmentContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ClinicProvider } from "./context/ClinicContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
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
