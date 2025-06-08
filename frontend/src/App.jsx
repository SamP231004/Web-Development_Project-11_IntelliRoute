import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ToastProvider } from './components/useToast';

import CheckAuth from "./components/check-auth.jsx";
import Navbar from "./components/Navbar.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketDetailsPage from "./pages/TicketDetails.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

function AppLayout({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onThemeToggle={toggleTheme} currentTheme={theme} />

      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {children}
      </main>
      <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-8">
        <aside>
          <p>Copyright © {new Date().getFullYear()} - All rights reserved by IntelliRoute</p>
        </aside>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <CheckAuth protectedRoute={false}>
                <LoginPage />
              </CheckAuth>
            }
          />
          <Route
            path="/signup"
            element={
              <CheckAuth protectedRoute={false}>
                <SignupPage />
              </CheckAuth>
            }
          />

          <Route
            path="/"
            element={
              <CheckAuth protectedRoute={true}>
                <AppLayout>
                  <Tickets />
                </AppLayout>
              </CheckAuth>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <CheckAuth protectedRoute={true}>
                <AppLayout>
                  <TicketDetailsPage />
                </AppLayout>
              </CheckAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <CheckAuth protectedRoute={true} requiredRole="admin">
                <AppLayout>
                  <AdminPanel />
                </AppLayout>
              </CheckAuth>
            }
          />

          <Route path="*" element={<h1 className="text-center text-3xl mt-20 text-error">404 - Page Not Found</h1>} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}