import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { JobApplicationsPage } from "../pages/JobApplicationsPage";
import { CreateJobApplicationPage } from "../pages/CreateJobApplicationPage";
import { JobApplicationDetailPage } from "../pages/JobApplicationDetailPage";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/applications" element={<JobApplicationsPage />} />
                <Route path="/applications/new" element={<CreateJobApplicationPage />} />
                <Route path="/applications/:id" element={<JobApplicationDetailPage />} />
            </Routes>
        </BrowserRouter>
    );
}
