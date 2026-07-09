import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Toolbar from '../../components/Toolbar';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

const AdminFees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentIds: [], feeType: 'hostel', academicYear: '2026-27', term: 'Annual', amount: 60000, dueDate: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [f, s] = await Promise.all([
        api.get('/admin/fees', { params: search ? { search } : {} }),
        api.get('/admin/students', { params: { limit: 500 } }),
      ]);
      setFees(f.data.fees);
      setStudents(s.data.students);
    } catch { toast.error('Failed to load fee records'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const toggleStudent = (id) => {
    setForm((f) => ({
      ...f,
      studentIds: f.studentIds.includes(id) ? f.studentIds.filter((x) => x !== id) : [...f.studentIds, id],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.studentIds.length) return toast.error('Select at least one student');
    try {
      await api.post('/admin/fees/generate', form);
      toast.success('Fee generated for selected students');
      setModalOpen(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate fee'); }
  };

  const columns = [
    { key: 'student', label: 'Student', render: (f) => f.student?.user?.name },
    { key: 'enrollment', label: 'Enrollment No', render: (f) => f.student?.enrollmentNo },
    { key: 'type', label: 'Fee Type', render: (f) => f.feeType },
    { key: 'year', label: 'Academic Year', render: (f) => f.academicYear },
    { key: 'amount', label: 'Amount', render: (f) => `₹${f.amount}` },
    { key: 'paid', label: 'Paid', render: (f) => `₹${f.amountPaid}` },
    { key: 'due', label: 'Due Date', render: (f) => new Date(f.dueDate).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (f) => <StatusBadge status={f.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Fee Management" subtitle="Generate fees and track payment history across all students" />
      <div className="card p-5">
        <Toolbar search={search} onSearchChange={setSearch} onAddClick={() => setModalOpen(true)} addLabel="Generate Fee" />
        <DataTable columns={columns} data={fees} loading={loading} emptyTitle="No fee records found" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate Fee" size="lg">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Fee Type</label>
              <select className="input" value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })}>
                <option value="hostel">Hostel</option><option value="mess">Mess</option><option value="security_deposit">Security Deposit</option><option value="other">Other</option>
              </select>
            </div>
            <div><label className="label">Term</label><input className="input" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} /></div>
            <div><label className="label">Academic Year</label><input className="input" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} required /></div>
            <div><label className="label">Amount (₹)</label><input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
            <div className="col-span-2"><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required /></div>
          </div>
          <div>
            <label className="label">Select Students ({form.studentIds.length} selected)</label>
            <div className="max-h-52 overflow-y-auto border border-gray-200 dark:border-white/10 rounded-lg divide-y divide-gray-100 dark:divide-white/5">
              {students.map((s) => (
                <label key={s._id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
                  <input type="checkbox" checked={form.studentIds.includes(s._id)} onChange={() => toggleStudent(s._id)} />
                  {s.user?.name} — {s.enrollmentNo}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3"><button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary">Generate</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminFees;
