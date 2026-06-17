import { useState, useEffect } from 'react';

export function useAuth() {
  const [operator, setOperator] = useState<{ id: string; email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('terrawatch_token');
      if (!token) {
        setOperator(null);
        setLoading(false);
        return;
      }
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOperator(data.user);
      } else {
        localStorage.removeItem('terrawatch_token');
        setOperator(null);
      }
    } catch {
      localStorage.removeItem('terrawatch_token');
      setOperator(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('terrawatch_token', data.token);
      setOperator(data.user);
    }
    return data;
  };

  const register = async (email: string, pass: string, name: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, name })
    });
    const data = await res.json();
    return data;
  };

  const logout = () => {
    localStorage.removeItem('terrawatch_token');
    setOperator(null);
  };

  return { operator, loading, login, register, logout, refetchProfile: fetchProfile };
}
