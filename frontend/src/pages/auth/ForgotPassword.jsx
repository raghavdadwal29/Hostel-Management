import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from './AuthShell';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="text-2xl font-display font-bold text-primary-600 mb-1">Forgot Password</h2>
      <p className="text-sm text-gray-500 mb-5">Enter your registered email and we'll send a reset link.</p>

      {sent ? (
        <div className="rounded-lg bg-emerald-50 text-emerald-700 text-sm p-4">
          A password reset link has been sent to <strong>{email}</strong>. Please check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input" type="email" placeholder="Registered Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" disabled={loading} className="btn-primary w-full uppercase tracking-wide">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="text-sm text-gray-500 mt-5 text-center">
        <Link to="/login" className="text-primary-600 font-medium hover:underline">Back to Login</Link>
      </p>
    </AuthShell>
  );
};

export default ForgotPassword;
