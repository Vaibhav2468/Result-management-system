import React, { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  Routes,
  Route,
  Navigate,
  useLocation,
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
const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState("/dashboard/home");

  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location]);

  // Toggle Sidebar for Mobile View
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Logout Functionality
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dashboard-container" style={{ marginTop: "50px" }}>
      {/* Header Section */}
      <header className="app-header">
        <button className="menu-icon" onClick={handleDrawerToggle}>
          ☰
        </button>
        <h1 className="header-title">RESULT MANAGEMENT SYSTEM</h1>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <ul className="menu">
          {[
            { path: "home", label: "Home" },
            { path: "courses", label: "Courses" },
            { path: "branches", label: "Branches" },
            { path: "students", label: "Students" },
            { path: "subjects", label: "Subjects" },
            { path: "results", label: "Results" },
          ].map(({ path, label }) => (
            <li
              key={path}
              className={`menu-item ${activeRoute === `/dashboard/${path}` ? "selected" : ""}`}
            >
              <Link to={`/dashboard/${path}`}>{label}</Link>
            </li>
          ))}
          <li className="menu-item logout" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          {/* Redirect /dashboard to /dashboard/home */}
          <Route path="" element={<Navigate to="home" />} />

          {/* Protected Routes */}
          {[
            { path: "home", component: Home },
            { path: "courses", component: Courses },
            { path: "branches", component: Branches },
            { path: "students", component: Students },
            { path: "subjects", component: Subjects },
            { path: "results", component: Results },
          ].map(({ path, component: Component }) => (
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
