import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Importing authentication context

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Getting the authenticated user

  // If no user is logged in, redirect them to the login page
  if (!user) {
    return <Navigate to="/" />;
  }

  // If the user is authenticated, render the requested component
  return children;
};

export default ProtectedRoute;
