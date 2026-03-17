import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
// Creating authentication context
const AuthContext = createContext();

// AuthProvider component manages user authentication state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the logged-in user
  const [isLoading, setIsLoading] = useState(true); // Tracks loading state

  // Check if a user is already logged in when the app loads
  useEffect(() => {
    const checkLoggedIn = async () => {
      let token = localStorage.getItem("auth-token"); // Retrieve token from local storage

      if (!token) {
        localStorage.setItem("auth-token", ""); // Ensure token is initialized
        token = "";
      }

      try {
        console.log("Checking token validity...");
        const tokenResponse = await axios.post(
         `${API_BASE_URL}/api/auth/tokenIsValid`,
          null,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Token validation response:", tokenResponse.data);

        if (tokenResponse.data) {
          // If token is valid, fetch user details
          const userRes = await axios.get(`${API_BASE_URL}/api/auth/`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log("User data fetched:", userRes.data);
          setUser(userRes.data);
        } else {
          console.warn("Token is invalid. User is logged out.");
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check error:", err.response?.data || err.message);
      }

      setIsLoading(false); // Mark loading as complete
    };

    checkLoggedIn();
  }, []);

  // Login function to authenticate user
  const login = async (username, password) => {
    try {
      console.log("Login attempt:", { username, password });

      const loginRes = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: username,
        password,
      });

      console.log("Login successful:", loginRes.data);

      setUser(loginRes.data.user); // Set user state
      localStorage.setItem("auth-token", loginRes.data.token); // Store token locally

      return true;
    } catch (err) {
      console.error("Login error:", err.response?.data?.message || err.message);
      throw err;
    }
  };

  // Logout function to clear user session
  const logout = () => {
    console.log("User logged out.");
    setUser(null);
    localStorage.setItem("auth-token", ""); // Clear stored token
    toast.success("You have been logged out successfully!");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {!isLoading && children} {/* Render children only after loading completes */}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to authentication context
export const useAuth = () => useContext(AuthContext);
