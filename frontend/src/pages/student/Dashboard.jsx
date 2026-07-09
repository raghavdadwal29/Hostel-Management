import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle, FiCalendar, FiDollarSign, FiFileText } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [fees, setFees] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/profile'),
      api.get('/fees/my-fees'),
      api.get('/complaints'),
      api.get('/notices'),
    ]).then(([p, f, c, n]) => {
      setProfile(p.data.student);
      setFees(f.data.fees);
      setComplaints(c.data.complaints);
      setNotices(n.data.notices.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;

  const pendingFees = fees.filter((f) => f.status !== 'paid').length;
  const openComplaints = complaints.filter((c) => c.status !== 'resolved' && c.status !== 'rejected').length;

  return (
    <div>
      <PageHeader title={`Welcome, ${profile?.user?.name?.split(' ')[0] || 'Student'}`} subtitle="Here's a snapshot of your hostel account" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FiHome} label="Room" value={profile?.allocation?.room?.roomNumber || 'Not Allocated'} tone="navy" />
        <StatCard icon={FiAlertCircle} label="Open Complaints" value={openComplaints} tone="red" />
        <StatCard icon={FiDollarSign} label="Pending Fees" value={pendingFees} tone="gold" />
        <StatCard icon={FiFileText} label="Application Status" value={<span className="capitalize">{profile?.applicationStatus?.replace('_', ' ')}</span>} tone="primary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold">Recent Notices</h3>
            <Link to="/student/notices" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {notices.length === 0 ? <p className="text-sm text-gray-400">No notices yet.</p> : (
            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n._id} className="border-b border-gray-100 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold">My Complaints</h3>
            <Link to="/student/complaints" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {complaints.length === 0 ? <p className="text-sm text-gray-400">No complaints raised yet.</p> : (
            <div className="space-y-3">
              {complaints.slice(0, 4).map((c) => (
                <div key={c._id} className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2 last:border-0">
                  <p className="text-sm font-medium truncate pr-2">{c.title}</p>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
