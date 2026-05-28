import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Reads initial state from localStorage to persist login across page reloads
const getStoredUser  = () => JSON.parse(localStorage.getItem('mec_user')  || 'null');
const getStoredToken = () => localStorage.getItem('mec_token') || null;

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('mec_token', newToken);
    localStorage.setItem('mec_user',  JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mec_token');
    localStorage.removeItem('mec_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Convenience hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};


