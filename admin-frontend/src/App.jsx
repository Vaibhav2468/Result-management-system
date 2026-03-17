import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Handles authentication across the app
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { ToastContainer } from "react-toastify"; // For showing notifications
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const App = () => {
  return (
    // Wrapping everything inside AuthProvider to manage user authentication state
    <AuthProvider>
      <Router>
        <div className="app">
          <ToastContainer position="top-center" autoClose={2000} />

          <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/dashboard/*" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
