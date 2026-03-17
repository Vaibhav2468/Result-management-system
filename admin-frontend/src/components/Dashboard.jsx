import React, { useState, useEffect } from "react";
import {
  NavLink,
  useNavigate,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

import Home from "./Home";
import Courses from "./Courses";
import Branches from "./Branches";
import Students from "./Students";
import Subjects from "./Subjects";
import Results from "./Results";
import ProtectedRoute from "../context/ProtectedRoute";

const dashboardRoutes = [
  { path: "home", label: "Home", component: Home },
  { path: "courses", label: "Courses", component: Courses },
  { path: "branches", label: "Branches", component: Branches },
  { path: "students", label: "Students", component: Students },
  { path: "subjects", label: "Subjects", component: Subjects },
  { path: "results", label: "Results", component: Results },
];

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Close sidebar on route change (on mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(true); // Always open on desktop
      } else {
        setMobileOpen(false); // Closed on mobile
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="app-header">
        <button className="menu-icon" onClick={handleDrawerToggle}>
          ☰
        </button>
        <h1 className="header-title">RESULT MANAGEMENT SYSTEM</h1>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <ul className="menu">
          {dashboardRoutes.map(({ path, label }) => (
            <li key={path}>
              <NavLink
                to={`/dashboard/${path}`}
                className={({ isActive }) =>
                  `menu-item ${isActive ? "selected" : ""}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li className="menu-item logout" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route index element={<Navigate to="home" />} />
          {dashboardRoutes.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
                  <Component />
                </ProtectedRoute>
              }
            />
          ))}
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
