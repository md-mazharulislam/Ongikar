import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ongikar_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem("ongikar_user", JSON.stringify(u));
    else localStorage.removeItem("ongikar_user");
  };

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem("ongikar_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      persistUser(data.user);
      setWallet(data.wallet);
    } catch (e) {
      persistUser(null);
      setWallet(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = async (phone, password) => {
    const { data } = await api.post("/auth/login", { phone, password });
    localStorage.setItem("ongikar_token", data.token);
    persistUser(data.user);
    await refreshMe();
    return data;
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    localStorage.setItem("ongikar_token", data.token);
    persistUser(data.user);
    setWallet(data.wallet);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("ongikar_token");
    persistUser(null);
    setWallet(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser: persistUser, wallet, setWallet, loading, login, signup, logout, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
