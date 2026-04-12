import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { getMe, login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set a small timeout to avoid hanging on slow connections
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 5000);

      getMe()
        .then((res) => {
          setUser(res.data);
          clearTimeout(timeout);
        })
        .catch((err) => {
          console.error("Auth initialization failed:", err);
          localStorage.removeItem('token');
          setUser(null);
          clearTimeout(timeout);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    localStorage.setItem('token', res.data.access_token);
    const userRes = await getMe();
    setUser(userRes.data);
    toast.success(`Welcome back, ${userRes.data.username}! 🔥`, { duration: 3000 });
  };

  const register = async (username, email, password, role = 'agent') => {
    await apiRegister({ username, email, password, role });
    toast.success('Account created! Please log in.');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast('Signed out successfully', { icon: '👋', duration: 2500 });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
