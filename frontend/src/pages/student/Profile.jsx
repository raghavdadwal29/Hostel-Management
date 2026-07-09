import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';

const StudentProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qr, setQr] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', guardianName: '', guardianPhone: '', bloodGroup: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/student/profile');
      setProfile(data.student);
      setForm({
        name: data.student.user?.name || '', phone: data.student.user?.phone || '',
        address: data.student.address || '', guardianName: data.student.guardianName || '',
        guardianPhone: data.student.guardianPhone || '', bloodGroup: data.student.bloodGroup || '',
      });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/student/profile', form);
      toast.success('Profile updated');
      const updatedUser = { ...user, name: form.name, phone: form.phone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/update-password', passwordForm);
      toast.success('Password updated');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update password'); }
  };

  const generateQr = async () => {
    try {
      const { data } = await api.get('/student/qr-code');
      setQr(data.qrCode);
    } catch { toast.error('Failed to generate QR code'); }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal details and account security" />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <form onSubmit={saveProfile} className="card p-5 space-y-4">
            <h3 className="font-display font-bold">Personal Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="label">Guardian Name</label><input className="input" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} /></div>
              <div><label className="label">Guardian Phone</label><input className="input" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} /></div>
              <div><label className="label">Blood Group</label><input className="input" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} /></div>
            </div>
            <div><label className="label">Address</label><textarea className="input" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="flex justify-end"><button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button></div>
          </form>

          <form onSubmit={changePassword} className="card p-5 space-y-4">
            <h3 className="font-display font-bold">Change Password</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="label">Current Password</label><input type="password" className="input" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required /></div>
              <div><label className="label">New Password</label><input type="password" className="input" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} /></div>
            </div>
            <div className="flex justify-end"><button className="btn-secondary">Update Password</button></div>
          </form>
        </div>

        <div className="card p-5 text-center">
          <h3 className="font-display font-bold mb-4">Student ID Card QR</h3>
          {qr ? (
            <img src={qr} alt="Student QR code" className="mx-auto rounded-lg border" />
          ) : (
            <div className="h-40 w-40 mx-auto rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-xs text-gray-400">No QR generated yet</div>
          )}
          <button onClick={generateQr} className="btn-outline w-full mt-4">Generate / Refresh QR</button>
          <p className="text-xs text-gray-400 mt-3">{profile?.enrollmentNo}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
