import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ category: 'electrical', title: '', description: '', priority: 'medium' });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/complaints'); setComplaints(data.complaints); }
    catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('images', f));
      await api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Complaint submitted');
      setModalOpen(false);
      setForm({ category: 'electrical', title: '', description: '', priority: 'medium' });
      setFiles([]);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit complaint'); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category', render: (c) => <span className="capitalize">{c.category}</span> },
    { key: 'priority', label: 'Priority', render: (c) => <span className="capitalize">{c.priority}</span> },
    { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'date', label: 'Raised On', render: (c) => new Date(c.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="My Complaints" subtitle="Submit and track maintenance complaints" actions={<button className="btn-primary" onClick={() => setModalOpen(true)}><FiPlus /> New Complaint</button>} />
      <div className="card p-5">
        <DataTable columns={columns} data={complaints} loading={loading} emptyTitle="You haven't raised any complaints yet" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Raise a Complaint">
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="electrical">Electrical</option><option value="plumbing">Plumbing</option><option value="furniture">Furniture</option>
                <option value="cleanliness">Cleanliness</option><option value="internet">Internet</option><option value="food">Food</option><option value="other">Other</option>
              </select>
            </div>
            <div><label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div><label className="label">Description</label><textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
          <div><label className="label">Attach Images (optional, up to 4)</label><input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 4))} className="text-sm" /></div>
          <div className="flex justify-end gap-3"><button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentComplaints;
