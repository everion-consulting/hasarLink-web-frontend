import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ProfileProvider } from './context/ProfileContext.jsx'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')).render(
  <ProfileProvider>
    <App />
    <Toaster position="top-right" />
  </ProfileProvider>
)