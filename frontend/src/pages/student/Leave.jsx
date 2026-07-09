import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

const StudentLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ leaveType: 'home', fromDate: '', toDate: '', reason: '', contactDuringLeave: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/leaves'); setLeaves(data.leaves); }
    catch { toast.error('Failed to load leave requests'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leaves', form);
      toast.success('Leave request submitted');
      setModalOpen(false);
      setForm({ leaveType: 'home', fromDate: '', toDate: '', reason: '', contactDuringLeave: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit request'); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: 'type', label: 'Type', render: (l) => <span className="capitalize">{l.leaveType}</span> },
    { key: 'from', label: 'From', render: (l) => new Date(l.fromDate).toLocaleDateString() },
    { key: 'to', label: 'To', render: (l) => new Date(l.toDate).toLocaleDateString() },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', render: (l) => <StatusBadge status={l.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Leave Requests" subtitle="Apply for leave and track approval status" actions={<button className="btn-primary" onClick={() => setModalOpen(true)}><FiPlus /> Apply for Leave</button>} />
      <div className="card p-5">
        <DataTable columns={columns} data={leaves} loading={loading} emptyTitle="No leave requests submitted yet" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Apply for Leave">
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Leave Type</label>
            <select className="input" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
              <option value="home">Home Visit</option><option value="medical">Medical</option><option value="emergency">Emergency</option><option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">From Date</label><input type="date" className="input" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required /></div>
            <div><label className="label">To Date</label><input type="date" className="input" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required /></div>
          </div>
          <div><label className="label">Reason</label><textarea className="input" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required /></div>
          <div><label className="label">Contact During Leave</label><input className="input" value={form.contactDuringLeave} onChange={(e) => setForm({ ...form, contactDuringLeave: e.target.value })} /></div>
          <div className="flex justify-end gap-3"><button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentLeave;
