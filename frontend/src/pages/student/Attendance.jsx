import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance').then(({ data }) => setRecords(data.attendance))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, []);

  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const percentage = records.length ? Math.round((present / records.length) * 100) : 0;

  const columns = [
    { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'remarks', label: 'Remarks', render: (r) => r.remarks || '—' },
  ];

  return (
    <div>
      <PageHeader title="My Attendance" subtitle="Your daily hostel attendance history" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FiCheckCircle} label="Present Days" value={present} tone="green" />
        <StatCard icon={FiXCircle} label="Absent Days" value={absent} tone="red" />
        <StatCard icon={FiCalendar} label="Total Records" value={records.length} tone="navy" />
        <StatCard icon={FiCheckCircle} label="Attendance %" value={percentage} suffix="%" tone="primary" />
      </div>
      <div className="card p-5">
        <DataTable columns={columns} data={records} loading={loading} emptyTitle="No attendance records yet" />
      </div>
    </div>
  );
};

export default StudentAttendance;
