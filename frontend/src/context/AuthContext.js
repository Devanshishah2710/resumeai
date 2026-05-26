import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user); setIsAuthenticated(true);
    } catch { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user); setIsAuthenticated(true);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user); setIsAuthenticated(true);
    return data.user;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken');
    setUser(null); setIsAuthenticated(false);
  };

  const updateUser = updates => setUser(p => ({ ...p, ...updates }));

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error('useAuth outside AuthProvider'); return c; };
