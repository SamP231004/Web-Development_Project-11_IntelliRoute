// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Toast Provider (using react-hot-toast's Toaster)
import { ToastProvider } from './components/useToast';

// Your Application Components and Pages
import CheckAuth from "./components/check-auth.jsx";
import Navbar from "./components/Navbar.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketDetailsPage from "./pages/TicketDetails.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

// ========================================================================
// AppLayout Component (defined within App.jsx)
// This provides the main structural layout for your authenticated routes.
// Includes Navbar, main content area, and a footer, with theme switching.
// ========================================================================
function AppLayout({ children }) {
  // State for theme management (light/dark/etc.)
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage or default to 'light'
    return localStorage.getItem('theme') || 'light';
  });

  // Apply theme to the HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      // Cycle through some themes or just toggle between light/dark
      // Make sure these themes are listed in your tailwind.config.js daisyui.themes array
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'cupcake';
      if (prevTheme === 'cupcake') return 'dracula';
      if (prevTheme === 'dracula') return 'synthwave';
      if (prevTheme === 'synthwave') return 'corporate';
      if (prevTheme === 'corporate') return 'aqua';
      if (prevTheme === 'aqua') return 'forest';
      return 'light'; // Fallback to light
    });
  };

  return (
    <div className="flex flex-col min-h-screen"> {/* Ensure body takes full height and flex-col for footer */}
      {/* Navbar receives theme props for the toggle */}
      <Navbar onThemeToggle={toggleTheme} currentTheme={theme} />

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {children}
      </main>

      {/* Modern Footer */}
      <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-8">
        <aside>
          <p>Copyright © {new Date().getFullYear()} - All rights reserved by IntelliRoute</p>
        </aside>
      </footer>
    </div>
  );
}

// ========================================================================
// Main App Component
// ========================================================================
export default function App() {
  return (
    <BrowserRouter>
      {/* ToastProvider wraps the entire application */}
      <ToastProvider>
        <Routes>
          {/* Public Routes (Login/Signup) */}
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

          {/* Authenticated Routes (wrapped in AppLayout) */}
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

          {/* Admin Protected Route */}
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

          {/* Fallback for unknown routes */}
          <Route path="*" element={<h1 className="text-center text-3xl mt-20 text-error">404 - Page Not Found</h1>} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}