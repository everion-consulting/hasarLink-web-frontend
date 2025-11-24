import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthTabs from "./components/AuthTabs";
import Home from "./components/pages/Home";
import TopBar from "./components/TopBar";
import { ProfileProvider } from "./context/ProfileContext";
import Profile from "./components/pages/Profile";
import VictimInfoStepper from "./components/pages/VictimInfoStepper";
import InsuranceSelect from "./components/pages/InsuranceSelect";
import Contact from "./components/pages/Contact";
import DriverInfoScreen from "./components/pages/DriverInfoScreen";
import DriverVictimStepperScreen from "./components/pages/DriverVictimStepperScreen";
import StepInfoScreen from "./components/pages/StepInfoScreen";
import InsuranceStepper from "./components/pages/InsuranceStepper";
import EditFavoritesScreen from "./components/pages/EditFavoriScreen";

export default function App() {
  const savedToken = localStorage.getItem("authToken");
  const validToken = savedToken && savedToken !== "undefined" && savedToken !== "null";
  const [isAuth, setIsAuth] = useState(!!validToken);

  useEffect(() => {
    const checkAuth = () => setIsAuth(!!localStorage.getItem("authToken"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <Router>
      <ProfileProvider>
        {isAuth && <TopBar />}

        <Routes>
          <Route
            path="/"
            element={isAuth ? <Home /> : <Navigate to="/auth" replace />}
          />

          <Route
            path="/profile"
            element={isAuth ? <Profile /> : <Navigate to="/auth" replace />}
          />

          <Route
            path="/contact"
            element={isAuth ? <Contact /> : <Navigate to="/auth" replace />}
          />

          <Route
            path="/victim-info"
            element={isAuth ? <VictimInfoStepper /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/driver-info"
            element={isAuth ? <DriverInfoScreen /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/driver-victim-stepper"
            element={isAuth ? <DriverVictimStepperScreen  /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/step-info"
            element={isAuth ? <StepInfoScreen /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/edit-favorites"
            element={isAuth ? <EditFavoritesScreen /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/insurance-stepper"
            element={isAuth ? <InsuranceStepper /> : <Navigate to="/auth" replace />}
          />

          <Route
            path="/insurance-select"
            element={isAuth ? <InsuranceSelect /> : <Navigate to="/auth" replace />}
          />

          <Route
            path="/auth"
            element={
              isAuth ? <Navigate to="/" replace /> : <AuthTabs setIsAuth={setIsAuth} />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProfileProvider>
    </Router>
  );
}
