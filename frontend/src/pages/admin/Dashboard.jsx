import React, { useEffect, useState } from 'react';
import { FiUsers, FiHome, FiCheckCircle, FiAlertTriangle, FiDollarSign, FiPercent } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';

const COLORS = ['#8f1e26', '#152e57', '#c9a227', '#2c5390', '#b8434b', '#4d70ab'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data.stats)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;
  if (!stats) return null;

  const trendData = (stats.monthlyTrend || []).map((t) => ({
    month: `${t._id.month}/${t._id.year}`,
    total: t.total,
  }));

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Overview of hostel operations at CGC University" />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FiUsers} label="Total Students" value={stats.totalStudents} tone="navy" />
        <StatCard icon={FiHome} label="Total Rooms" value={stats.totalRooms} tone="primary" />
        <StatCard icon={FiCheckCircle} label="Occupied Rooms" value={stats.occupiedRooms} tone="green" />
        <StatCard icon={FiHome} label="Vacant Rooms" value={stats.vacantRooms} tone="gold" />
        <StatCard icon={FiAlertTriangle} label="Pending Complaints" value={stats.pendingComplaints} tone="red" />
        <StatCard icon={FiUsers} label="Pending Applications" value={stats.pendingApplications} tone="navy" />
        <StatCard icon={FiDollarSign} label="This Month's Fee Collection" value={`₹${stats.monthlyFeeCollection.toLocaleString()}`} tone="green" />
        <StatCard icon={FiPercent} label="Attendance Rate" value={stats.attendancePercentage} suffix="%" tone="primary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-display font-bold mb-4">Monthly Fee Collection Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#8f1e26" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-bold mb-4">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.complaintsByCategory}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(d) => d._id}
              >
                {stats.complaintsByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
