import PageLoading from "./components/common/PageLoading";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const CartographiePage = lazy(() => import("./pages/CartographiePage"));
const VideoPage = lazy(() => import("./pages/VideoPage"));
const TelemetriePage = lazy(() => import("./pages/TelemetriePage"));
const ControlePage = lazy(() => import("./pages/ControlePage"));
const MissionPage = lazy(() => import("./pages/MissionPage"));
import { useAuth } from "./context/useAuth";

function ProtectedLayout() {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoading />;
  }
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoading>Chargement de la page…</PageLoading>}>
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
    </Suspense>
  );
}
