import React, { lazy, Suspense, useContext } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jam from "./pages/Jam";
import Create from "./pages/Create";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import UsernameSetup from "./pages/UsernameSetup";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster } from "react-hot-toast";

const PrivacyPolicy = lazy(() => import("./pages/LegalPrivacy"));
const Terms = lazy(() => import("./pages/LegalTerms"));

function AuthFlowGate({ children }) {
  const { user, loading } = useContext(AuthContext);
  const { pathname } = useLocation();

  if (loading && pathname !== '/auth/callback') {
    return <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">Loading Aura…</div>;
  }
  if (pathname === '/setup-username') {
    return user ? children : <Navigate to="/login" replace />;
  }
  if (user && !user.username) return <Navigate to="/setup-username" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#18181b', // zinc-900
            color: '#e4e4e7', // zinc-200
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      <AuthFlowGate>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jam/:roomId" element={<Jam />} />
          <Route path="/create" element={<Create />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/setup-username" element={<UsernameSetup />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/privacy-policy" element={<Suspense fallback={null}><PrivacyPolicy /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={null}><Terms /></Suspense>} />
        </Routes>
      </AuthFlowGate>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
