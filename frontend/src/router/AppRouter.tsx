import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { JobApplicationsPage } from "../pages/JobApplicationsPage";
import { CreateJobApplicationPage } from "../pages/CreateJobApplicationPage";
import { JobApplicationDetailPage } from "../pages/JobApplicationDetailPage";
import { EditJobApplicationPage } from "../pages/EditJobApplicationPage";
import { RegisterPage } from "../pages/RegisterPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/applications" element={<JobApplicationsPage />} />
            <Route path="/applications/new" element={<CreateJobApplicationPage />} />
            <Route path="/applications/:id" element={<JobApplicationDetailPage />} />
            <Route path="/applications/:id/edit" element={<EditJobApplicationPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
