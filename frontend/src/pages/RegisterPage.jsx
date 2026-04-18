import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // updates the form data state as you type by matching the input name
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(formData);
      const queryParams = new URLSearchParams(location.search);
      const redirectParam = queryParams.get('redirect');
      if (redirectParam) {
        navigate(`/login?redirect=${redirectParam}`);
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('registration error', err);
      if (err.response && err.response.status === 400) {
        setError('This email address is already registered.');
      } else {
        setError('Registration failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] bg-zinc-50">
      <div className="auth-card">
        <header className="mb-12 divider-soft pb-6">
          <h1 className="heading-large tracking-tighter uppercase text-zinc-950">
            Create Account
          </h1>
          <p className="label-mono mt-2">
            Join our community
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="input-label">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="input-field p-2 bg-zinc-50 border-main focus:border-zinc-950 outline-none text-sm transition-all rounded-none"
                required
              />
            </div>
            <div className="flex-1">
              <label className="input-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="input-field p-2 bg-zinc-50 border-main focus:border-zinc-950 outline-none text-sm transition-all rounded-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input-field"
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4"
          >
            {loading ? 'Joining...' : 'Create Account'}
          </button>
        </form>

        <footer className="mt-12 text-center">
          <p className="label-mono">
            Already a member? <Link to={`/login${location.search}`} className="text-zinc-950 underline underline-offset-4">Log In</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default RegisterPage;
