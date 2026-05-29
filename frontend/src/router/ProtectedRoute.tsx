import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
