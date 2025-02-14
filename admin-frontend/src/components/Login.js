import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
//import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaLock, FaSignInAlt, FaChartLine } from "react-icons/fa"; // React Icons
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success(" Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      toast.error(
        ` ${err.response?.data?.message || "Login failed. Please try again."}`,
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <div className="screen-wrapper">
      <div className="login-container">
        <div className="login-left">
          <div className="system-icon">
            <FaChartLine className="icon" />
          </div>
          <h1 className="system-title">Result Management System</h1>
          <p className="system-description">
            Access your academic results securely and efficiently.
          </p>
        </div>
        <div className="login-right">
          <h1 className="login-title">Admin Login</h1>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                className="login-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              <FaSignInAlt className="button-icon" />
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
