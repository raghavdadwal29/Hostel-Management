import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from './AuthShell';
import api from '../../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      localStorage.setItem('token', data.token);
      toast.success('Password reset successfully! Please login again.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed or link expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="text-2xl font-display font-bold text-primary-600 mb-1">Reset Password</h2>
      <p className="text-sm text-gray-500 mb-5">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input" type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <input className="input" type="password" placeholder="Confirm New Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
        <button type="submit" disabled={loading} className="btn-primary w-full uppercase tracking-wide">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-5 text-center">
        <Link to="/login" className="text-primary-600 font-medium hover:underline">Back to Login</Link>
      </p>
    </AuthShell>
  );
};

export default ResetPassword;
