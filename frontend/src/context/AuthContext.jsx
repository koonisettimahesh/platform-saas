import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // LOGIN
  const login = async (data) => {
    const res = await api.post("/auth/login", data);
    localStorage.setItem("token", res.data.data.token);
    setUser(res.data.data.user);
  };

  // LOGOUT (API + CLIENT CLEANUP)
  const logout = async () => {
    try {
      await api.post("/auth/logout"); // 🔑 API 4
    } catch {
      // Even if API fails, client must logout
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      window.location.href = "/login";
    }
  };

  // VERIFY TOKEN ON LOAD
  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
