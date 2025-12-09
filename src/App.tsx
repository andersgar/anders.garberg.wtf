import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AuthCallback } from "./pages/AuthCallback";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { QRGeneratorPage } from "./pages/QRGeneratorPage";
import { SettingsSync } from "./components/SettingsSync";
import { trackVisit } from "./lib/analytics";

function App() {
  useEffect(() => {
    trackVisit();
  }, []);

  return (
    <BrowserRouter>
      <SettingsSync />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/om-meg" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/qr-generator" element={<QRGeneratorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
