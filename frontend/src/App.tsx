import React, { lazy, Suspense } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jam from "./pages/Jam";
import Create from "./pages/Create";
import AuthCallback from "./pages/AuthCallback";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

const PrivacyPolicy = lazy(() => import("./pages/LegalPrivacy"));
const Terms = lazy(() => import("./pages/LegalTerms"));

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jam/:roomId" element={<Jam />} />
        <Route path="/create" element={<Create />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/privacy-policy" element={<Suspense fallback={null}><PrivacyPolicy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={null}><Terms /></Suspense>} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </>
  );
}


