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
      setUser(null);

      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, [user, setUser]);

  const logout = async () => {
    await api.post("/auth/logout");

    setUser(null);
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
