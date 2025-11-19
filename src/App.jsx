import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthTabs from "./components/AuthTabs";
import Home from "./components/pages/Home";
import TopBar from "./components/TopBar";
import { ProfileProvider } from "./context/ProfileContext";
import Profile from "./components/pages/Profile";

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
          {/* Anasayfa */}
          <Route
            path="/"
            element={isAuth ? <Home /> : <Navigate to="/auth" replace />}
          />

          {/* Profil sayfası */}
          <Route
            path="/profile"
            element={isAuth ? <Profile/> : <Navigate to="/auth" replace />}
          />

          {/* Auth */}
          <Route
            path="/auth"
            element={
              isAuth ? <Navigate to="/" replace /> : <AuthTabs setIsAuth={setIsAuth} />
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProfileProvider>
    </Router>
  );
}
