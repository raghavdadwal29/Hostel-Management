import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';

const StudentApply = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ guardianName: '', guardianPhone: '', address: '', bloodGroup: '', dob: '' });

  const load = () => {
    setLoading(true);
    api.get('/student/profile').then(({ data }) => setProfile(data.student)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/student/apply', form);
      toast.success('Application submitted! Await admin approval.');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit application'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Loader full />;

  const canApply = profile?.applicationStatus === 'not_applied' || profile?.applicationStatus === 'rejected';

  return (
    <div>
      <PageHeader title="Apply for Hostel Accommodation" subtitle="Submit your details to request a hostel room allocation" />

      <div className="card p-5 mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Current Application Status</p>
          <div className="mt-1"><StatusBadge status={profile?.applicationStatus} /></div>
        </div>
      </div>

      {canApply ? (
        <form onSubmit={submit} className="card p-5 grid sm:grid-cols-2 gap-4">
          <div><label className="label">Guardian Name</label><input className="input" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} required /></div>
          <div><label className="label">Guardian Phone</label><input className="input" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} required /></div>
          <div><label className="label">Date of Birth</label><input type="date" className="input" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></div>
          <div><label className="label">Blood Group</label><input className="input" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Permanent Address</label><textarea className="input" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></div>
          <div className="sm:col-span-2 flex justify-end"><button className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button></div>
        </form>
      ) : (
        <div className="card p-5 text-sm text-gray-500">
          {profile?.applicationStatus === 'pending' && 'Your application is under review by the administration.'}
          {profile?.applicationStatus === 'approved' && 'Your application has been approved. Check "My Room" for allocation details.'}
        </div>
      )}
    </div>
  );
};

export default StudentApply;
