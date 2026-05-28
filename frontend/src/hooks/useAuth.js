import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../context/AuthContext';
import authService from '../services/auth.service';

const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const loginWithCredentials = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { token: newToken, user: newUser } = await authService.login(email, password);
      login(newToken, newUser);
      // Admins go to dashboard; everyone else goes to courses
      navigate(newUser.role === 'admin' ? '/admin' : '/courses');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  const register = useCallback(async (email, username, password, fullName) => {
    setLoading(true);
    setError(null);
    try {
      const { token: newToken, user: newUser } = await authService.register(
        email, username, password, fullName
      );
      login(newToken, newUser);
      navigate('/courses');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  const logoutAndRedirect = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    clearError,
    loginWithCredentials,
    register,
    logout: logoutAndRedirect,
  };
};

export default useAuth;


