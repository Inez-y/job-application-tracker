import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";

export function AppLayout() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const refreshToken = localStorage.getItem("refreshToken");

  async function handleLogout() {
    try {
      if (refreshToken) {
        await logout(refreshToken);
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");

      navigate("/login");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="text-xl font-bold text-slate-900">
            JobTracker
          </Link>

          <nav className="flex items-center gap-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "font-medium text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/applications"
              className={({ isActive }) =>
                isActive
                  ? "font-medium text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }
            >
              Applications
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="hidden text-sm text-slate-500 sm:inline">
                {userEmail}
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
