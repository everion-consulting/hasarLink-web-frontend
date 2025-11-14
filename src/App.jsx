import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthTabs from "./components/AuthTabs";
import Home from "./components/pages/Home";

export default function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("auth_token"));

  useEffect(() => {
    const checkAuth = () => setIsAuth(!!localStorage.getItem("auth_token"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuth ? <Home /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/auth"
          element={isAuth ? <Navigate to="/" replace /> : <AuthTabs setIsAuth={setIsAuth} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
