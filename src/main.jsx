import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ProfileProvider } from './context/ProfileContext.jsx'
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from './components/tema/theme-context.jsx';

createRoot(document.getElementById('root')).render(
  <ProfileProvider>
    <ThemeProvider>
      <App />
      <Toaster position="top-right" />
    </ThemeProvider>
  </ProfileProvider>
)