import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Reads initial state from localStorage to persist login across page reloads
const getStoredUser  = () => JSON.parse(localStorage.getItem('ep_user')  || 'null');
const getStoredToken = () => localStorage.getItem('ep_token') || null;

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('ep_token', newToken);
    localStorage.setItem('ep_user',  JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ep_token');
    localStorage.removeItem('ep_user');
    setToken(null);
    setUser(null);
  }, []);

  // Token-only swap, used when the server re-signs the caller's identity
  const replaceToken = useCallback((newToken) => {
    localStorage.setItem('ep_token', newToken);
    setToken(newToken);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, replaceToken }}>
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


