import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import CartographiePage from "./pages/CartographiePage";
import VideoPage from "./pages/VideoPage";
import TelemetriePage from "./pages/TelemetriePage";
import ControlePage from "./pages/ControlePage";
import MissionPage from "./pages/MissionPage";
import { useAuth } from "./context/useAuth";

function ProtectedLayout() {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app text-subtle">
        Chargement...
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cartographie" element={<CartographiePage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/telemetrie" element={<TelemetriePage />} />
        <Route path="/controle" element={<ControlePage />} />
        <Route path="/mission" element={<MissionPage />} />
      </Route>
    </Routes>
  );
}
