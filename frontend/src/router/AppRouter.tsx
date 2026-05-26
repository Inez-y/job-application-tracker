import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { JobApplicationsPage } from "../pages/JobApplicationsPage";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/applications" element={<JobApplicationsPage />} />
            </Routes>
        </BrowserRouter>
    );
}
