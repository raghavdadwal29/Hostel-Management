import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from './AuthShell';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    enrollmentNo: '', course: '', branch: '', gender: 'male',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Registration successful!');
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="text-2xl font-display font-bold text-primary-600 mb-1">Student Registration</h2>
      <p className="text-sm text-gray-500 mb-5">Create an account to apply for hostel accommodation.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="input" placeholder="Full Name" value={form.name} onChange={update('name')} required />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={update('email')} required />
        <input className="input" placeholder="Phone Number" value={form.phone} onChange={update('phone')} required />
        <input className="input" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={update('password')} required minLength={6} />
        <input className="input" placeholder="Enrollment Number" value={form.enrollmentNo} onChange={update('enrollmentNo')} required />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Course (e.g. B.Tech)" value={form.course} onChange={update('course')} required />
          <input className="input" placeholder="Branch (e.g. CSE)" value={form.branch} onChange={update('branch')} />
        </div>
        <select className="input" value={form.gender} onChange={update('gender')}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <button type="submit" disabled={loading} className="btn-primary w-full uppercase tracking-wide mt-2">
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-5 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">Login</Link>
      </p>
    </AuthShell>
  );
};

export default Register;
