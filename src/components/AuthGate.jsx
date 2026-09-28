import React, { useEffect, useState } from 'react';
import { loginUser, registerUser, getToken, getStoredUser, clearSession } from '../api/api';

/**
 * Gate that keeps task management behind a valid JWT.
 * Renders a sign-in / sign-up form when no token is stored.
 */
export default function AuthGate({ children, themeColor }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getStoredUser());
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // The API layer fires this event when a request comes back 401
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
        if (mode === 'register') {
          await registerUser({ name: form.name, email: form.email, password: form.password });
          // Register returns 201 without a token, so log straight in
          const data = await loginUser({ email: form.email, password: form.password });
          setToken(data.token);
          setUser(data.user);
          window.dispatchEvent(new CustomEvent('auth:session'));
        } else {
          const data = await loginUser({ email: form.email, password: form.password });
          setToken(data.token);
          setUser(data.user);
          window.dispatchEvent(new CustomEvent('auth:session'));
        }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  if (token) {
    return (
      <div className="auth-gate">
        <div className="auth-session-bar">
          <span>
            Signed in as <strong>{user?.name}</strong> ({user?.email})
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ borderColor: themeColor, color: themeColor }}
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="auth-gate">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 style={{ color: themeColor }}>
          {mode === 'login' ? 'Log in to manage tasks' : 'Create your account'}
        </h2>
        <p className="auth-subtitle">
          Task routes are protected with JWT authentication.
        </p>

        {mode === 'register' && (
          <input
            type="text"
            className="task-input"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange('name')}
            disabled={submitting}
            required
          />
        )}

        <input
          type="email"
          className="task-input"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange('email')}
          disabled={submitting}
          required
        />

        <input
          type="password"
          className="task-input"
          placeholder="Password"
          value={form.password}
          onChange={handleChange('password')}
          disabled={submitting}
          required
        />

        {error && <p className="auth-error">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ backgroundColor: themeColor, borderColor: themeColor }}
          disabled={submitting}
        >
          {submitting ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Register'}
        </button>

        <button
          type="button"
          className="auth-toggle"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          {mode === 'login'
            ? 'No account? Register here'
            : 'Already registered? Log in here'}
        </button>
      </form>
    </div>
  );
}
