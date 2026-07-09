import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthShell from './AuthShell';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(identifier, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-lg bg-primary-500 text-white flex items-center justify-center font-display font-extrabold text-sm shrink-0">
          CGC
        </div>
        <div className="leading-tight">
          <p className="text-primary-600 font-display font-extrabold text-lg -mb-0.5">CGC</p>
          <p className="text-navy-800 font-display font-extrabold text-lg -mb-0.5">UNIVERSITY</p>
          <p className="text-primary-600 font-display font-bold text-sm">MOHALI</p>
        </div>
      </div>

      <h2 className="text-3xl font-display font-bold text-primary-600 mb-6">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            className="input"
            placeholder="Roll / Enrollment No / EMP Code"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <input
            className="input pr-10"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button type="submit" disabled={loading} className="btn-primary uppercase tracking-wide px-6">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <Link to="/forgot-password" className="text-sm text-navy-600 hover:text-primary-600 hover:underline">
            Forgot Password ?
          </Link>
        </div>
      </form>

      <p className="text-xs text-gray-400 mt-8">
        Powered By · <span className="font-semibold text-navy-700">Bloomfield Innovations</span>
      </p>

      <p className="text-sm text-gray-500 mt-3">
        New student?{' '}
        <Link to="/register" className="text-primary-600 font-medium hover:underline">
          Apply / Register here
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;
