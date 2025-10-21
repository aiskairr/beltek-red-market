// hooks/useAuth.ts - Simple localStorage-based auth
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role: string;
}

const AUTH_KEY = 'beltek_auth_user';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem(AUTH_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simple hardcoded admin check (replace with your actual auth logic)
    if (email === 'admin@beltek.com' && password === 'admin123') {
      const user: User = {
        id: '1',
        email: email,
        role: 'admin',
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      setUser(user);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = async () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    navigate("/login");
  };

  return {
    user,
    loading,
    login,
    logout
  };
};

