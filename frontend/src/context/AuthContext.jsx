import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('krishiai_token');
    const saved = localStorage.getItem('krishiai_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      // Verify token is still valid
      API.get('/auth/me')
        .then(r => setUser(r.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone, password) => {
    const { data } = await API.post('/auth/login', { phone, password });
    localStorage.setItem('krishiai_token', data.token);
    localStorage.setItem('krishiai_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    localStorage.setItem('krishiai_token', data.token);
    localStorage.setItem('krishiai_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('krishiai_token');
    localStorage.removeItem('krishiai_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
