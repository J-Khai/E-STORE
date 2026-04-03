import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      const { token, ...userData } = response;
      authLogin(userData, token);
      
      const queryParams = new URLSearchParams(location.search);
      const redirectParam = queryParams.get('redirect');
      if (redirectParam === 'checkout') {
          navigate('/checkout');
      } else {
          navigate('/products');
      }
    } catch (err) {
      console.error('oops login failed', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] bg-zinc-50">
      <div className="auth-card">
        <header className="mb-12 divider-soft pb-6">
          <h1 className="heading-large mb-2">Sign In</h1>
          <p className="label-mono">Log in to your account</p>
        </header>

        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <footer className="mt-12 text-center">
          <p className="label-mono text-zinc-950/40">
            Don't have an account? <Link to={`/register${location.search}`} className="text-zinc-950 underline underline-offset-4">Register</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
