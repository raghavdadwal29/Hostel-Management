import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiX } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';

const AdminApplications = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/applications', { params: { status: 'pending' } });
      setStudents(data.students);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const review = async (id, status) => {
    try {
      await api.put(`/admin/applications/${id}/review`, { status });
      toast.success(`Application ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'name', label: 'Student', render: (s) => s.user?.name },
    { key: 'email', label: 'Email', render: (s) => s.user?.email },
    { key: 'enrollment', label: 'Enrollment No', render: (s) => s.enrollmentNo },
    { key: 'course', label: 'Course', render: (s) => `${s.course}${s.branch ? ` - ${s.branch}` : ''}` },
    { key: 'gender', label: 'Gender', render: (s) => s.gender },
    {
      key: 'actions', label: 'Action', render: (s) => (
        <div className="flex gap-2">
          <button onClick={() => review(s._id, 'approved')} className="btn-primary !py-1.5 !px-3 text-xs"><FiCheck size={14} /> Approve</button>
          <button onClick={() => review(s._id, 'rejected')} className="btn-outline !py-1.5 !px-3 text-xs text-red-600 border-red-200"><FiX size={14} /> Reject</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Hostel Applications" subtitle="Review and approve or reject pending hostel accommodation requests" />
      <div className="card p-5">
        <DataTable columns={columns} data={students} loading={loading} emptyTitle="No pending applications" />
      </div>
    </div>
  );
};

export default AdminApplications;
