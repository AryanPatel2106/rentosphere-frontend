import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);

  const getCurrentUser = async () => {
    try {
      const response = await api.get("/auth/current-user");

      const currentUser = response.data.data;

      setUser(currentUser);

      return currentUser;
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      setUser(null);

      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const updateTwoFactorStatus = (isTwoFactorEnabled) => {
    setUser((previousUser) => {
      if (!previousUser) {
        return null;
      }

      return {
        ...previousUser,
        isTwoFactorEnabled,
      };
    });
  };

  const contextValue = {
    user,
    setUser,
    authLoading,
    getCurrentUser,
    logout,
    updateTwoFactorStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };
