import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./config";
import AuthTabs from "./components/AuthTabs";
import ForgotPassword from "./components/ForgotPassword";
import Home from "./components/pages/Home";
import TopBar from "./components/TopBar";
import { ProfileProvider } from "./context/ProfileContext";
import Profile from "./components/pages/Profile";
import VictimInfoStepper from "./components/pages/VictimInfoStepper";
import InsuranceSelect from "./components/pages/InsuranceSelect";
import DriverInfoScreen from "./components/pages/DriverInfoScreen";
import DriverVictimStepperScreen from "./components/pages/DriverVictimStepperScreen";
import StepInfoScreen from "./components/pages/StepInfoScreen";
import InsuranceStepper from "./components/pages/InsuranceStepper";
import InsuredMechanicStepperScreen from "./components/pages/InsuredMechanicStepperScreen";
import EditFavoritesScreen from "./components/pages/EditFavoriScreen";
import AccidentTypeScreen from "./components/pages/AccidentTypeScreen";
import Contact from "./components/pages/Contact";
import "./styles/styles.css";
import DraftNotifications from "./components/pages/DraftNotifications";
import FileDamageInfoStepperScreen from "./components/pages/FileDamageInfoStepperScreen";
import FileDetail from "./components/pages/FileDetail";
import NotificationScreen from "./components/pages/NotificationScreen";
import apiService from "./services/apiServices";
import Settings from "./components/pages/Setting";
import FileNotifications from "./components/pages/FileNotifications";

function AppContent({ isAuth, setIsAuth }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Dashboard mı?
  const isDashboard = location.pathname === "/";

  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    const fetchDraftCount = async () => {
      try {
        const drafts = await apiService.getDrafts();
        setDraftCount(drafts.length);
      } catch (error) {
        console.error("Error fetching draft count:", error);
      }
    };

    fetchDraftCount();
  }, []);

  const navigateToDrafts = () => {
    navigate('/draft-notifications');
  };

  return (
    <div className={isDashboard ? "page-wrapper dashboard" : "page-wrapper page-bg"}>

      {isAuth && <TopBar />}

      <Routes>
        <Route path="/" element={isAuth ? <Home /> : <Navigate to="/auth" replace />} />
        <Route path="/profile" element={isAuth ? <Profile /> : <Navigate to="/auth" replace />} />
        <Route path="/contact" element={isAuth ? <Contact /> : <Navigate to="/auth" replace />} />
        <Route path="/settings" element={isAuth ? <Settings /> : <Navigate to="/auth" replace />} />
        <Route path="/victim-info" element={isAuth ? <VictimInfoStepper /> : <Navigate to="/auth" replace />} />
        <Route path="/driver-info" element={isAuth ? <DriverInfoScreen /> : <Navigate to="/auth" replace />} />
        <Route path="/driver-victim-stepper" element={isAuth ? <DriverVictimStepperScreen /> : <Navigate to="/auth" replace />} />
        <Route path="/step-info" element={isAuth ? <StepInfoScreen /> : <Navigate to="/auth" replace />} />
        <Route path="/insurance-select" element={isAuth ? <InsuranceSelect /> : <Navigate to="/auth" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/edit-favorites" element={isAuth ? <EditFavoritesScreen /> : <Navigate to="/auth" replace />} />
        <Route path="/insurance-stepper" element={isAuth ? <InsuranceStepper /> : <Navigate to="/auth" replace />} />
        <Route path="/insured-mechanic-stepper" element={isAuth ? <InsuredMechanicStepperScreen /> : <Navigate to="/auth" replace />} />
        <Route path="/accident-type" element={isAuth ? <AccidentTypeScreen /> : <Navigate to="/auth" replace />} />
        <Route path="/draft-notifications" element={isAuth ? <DraftNotifications /> : <Navigate to="/auth" replace />} />
        <Route path="/file-notifications" element={isAuth ? <FileNotifications /> : <Navigate to="/auth" replace />} />
        <Route path="/file-detail/:fileId" element={isAuth ? <FileDetail /> : <Navigate to="/auth" replace />} />
        <Route path="/hasar-bilgileri" element={isAuth ? <FileDamageInfoStepperScreen /> : <Navigate to="/auth" replace />} />
        <Route path="/notifications" element={isAuth ? <NotificationScreen /> : <Navigate to="/auth" replace />} />
        <Route path="/auth" element={isAuth ? <Navigate to="/" replace /> : <AuthTabs setIsAuth={setIsAuth} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const savedToken = localStorage.getItem("authToken");
  const validToken = savedToken && savedToken !== "undefined" && savedToken !== "null";
  const [isAuth, setIsAuth] = useState(!!validToken);

  // Token kontrolü - her 5 dakikada bir
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("authToken");
      if (!token || token === "undefined" || token === "null") {
        if (isAuth) {
          setIsAuth(false);
          localStorage.clear();
        }
        return;
      }

      // Token'in geçerliliğini kontrol et (API çağrısı ile)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE || "https://dosya-bildirim-vrosq.ondigitalocean.app"}/api/profile/`, {
          headers: {
            "Authorization": `Token ${token}`,
          },
        });

        if (!response.ok) {
          // Token geçersiz
          console.log("⚠️ Token geçersiz, oturum sonlandırılıyor");
          localStorage.clear();
          setIsAuth(false);
        }
      } catch (err) {
        console.error("Token kontrol hatası:", err);
      }
    };

    // İlk kontrol
    if (isAuth) {
      checkTokenValidity();
    }

    // Her 5 dakikada bir kontrol et
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuth]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      setIsAuth(!!(token && token !== "undefined" && token !== "null"));
    };
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <ProfileProvider>
          <AppContent isAuth={isAuth} setIsAuth={setIsAuth} />
        </ProfileProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}
