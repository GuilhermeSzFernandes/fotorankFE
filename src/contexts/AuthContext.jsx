import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL ?? '';
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fotorank_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/auth/me')
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem('fotorank_user', JSON.stringify(data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('fotorank_user');
      })
      .finally(() => setLoading(false));
  }, []);

  function login(userData) {
    setUser(userData);
    localStorage.setItem('fotorank_user', JSON.stringify(userData));
  }

  async function logout() {
    await axios.post('/api/auth/logout').catch(() => {});
    setUser(null);
    localStorage.removeItem('fotorank_user');
  }

  function updateUser(updates) {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('fotorank_user', JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
