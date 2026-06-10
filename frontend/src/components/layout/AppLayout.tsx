import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";

export function AppLayout() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const refreshToken = localStorage.getItem("refreshToken");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xl font-bold text-slate-900">
              JobTracker
            </Link>

            <nav className="flex items-center gap-3 sm:gap-4">
              <div className="relative md:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((current) => !current)}
                  className=" text-slate-700 hover:bg-slate-50"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                >
                  Menu 
                </button>

                {isMobileMenuOpen && (
                  <div
                    id="mobile-menu"
                    className="absolute left-0 top-11 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                  >
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm ${
                        isActive
                          ? "font-medium text-slate-900"
                          : "text-slate-600 hover:text-slate-900"
                        }`
                      }
                    >
                      Dashboard
                    </NavLink>

                    <NavLink
                      to="/applications"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm ${
                          isActive
                            ? "bg-slate-100 font-medium text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`
                      }
                    >
                      Applications
                    </NavLink>

                    <NavLink
                      to="/calendar"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm ${
                          isActive
                            ? "bg-slate-100 font-medium text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`
                      }
                    >
                      Calendar
                    </NavLink>

                    <NavLink
                      to="/email-templates"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm ${
                          isActive
                            ? "bg-slate-100 font-medium text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`
                      }
                    >
                      Email Templates
                    </NavLink>

                    <NavLink
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm ${
                          isActive
                            ? "bg-slate-100 font-medium text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`
                      }
                    >
                      Profile
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/applications"
                className={({ isActive }) =>
                  `hidden md:inline ${
                    isActive
                      ? "font-medium text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                Applications
              </NavLink>

              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  `hidden md:inline ${
                    isActive
                      ? "font-medium text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                Calendar
              </NavLink>
              
              <NavLink
                to="/email-templates"
                className={({ isActive }) =>
                  `hidden md:inline ${
                    isActive
                      ? "font-medium text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                Email Templates
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `hidden md:inline ${
                    isActive
                      ? "font-medium text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                Profile
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
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
