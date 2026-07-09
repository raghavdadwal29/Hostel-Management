import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Toolbar from '../../components/Toolbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';

const emptyForm = { name: '', email: '', password: '', phone: '', empCode: '', assignedHostel: '', designation: 'Warden' };

const AdminWardens = () => {
  const [wardens, setWardens] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [w, h] = await Promise.all([api.get('/admin/wardens'), api.get('/hostel/hostels')]);
      setWardens(w.data.wardens);
      setHostels(h.data.hostels);
    } catch {
      toast.error('Failed to load wardens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = wardens.filter((w) =>
    (w.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    w.empCode.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (w) => {
    setEditing(w);
    setForm({
      name: w.user?.name || '', email: w.user?.email || '', password: '', phone: w.user?.phone || '',
      empCode: w.empCode, assignedHostel: w.assignedHostel?._id || '', designation: w.designation,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/wardens/${editing._id}`, form);
        toast.success('Warden updated');
      } else {
        await api.post('/admin/wardens', form);
        toast.success('Warden created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/wardens/${deleteTarget._id}`);
      toast.success('Warden removed');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (w) => w.user?.name },
    { key: 'empCode', label: 'EMP Code' },
    { key: 'designation', label: 'Designation' },
    { key: 'hostel', label: 'Assigned Hostel', render: (w) => w.assignedHostel?.name || '—' },
    { key: 'email', label: 'Email', render: (w) => w.user?.email },
    {
      key: 'actions', label: '', render: (w) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(w)} className="btn-ghost !p-2 rounded-lg"><FiEdit2 size={15} /></button>
          <button onClick={() => setDeleteTarget(w)} className="btn-ghost !p-2 rounded-lg text-red-500"><FiTrash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Manage Wardens" subtitle="Add and assign wardens to hostel blocks" />
      <div className="card p-5">
        <Toolbar search={search} onSearchChange={setSearch} onAddClick={openAdd} addLabel="Add Warden" />
        <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="No wardens found" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Warden' : 'Add Warden'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editing} /></div>
          {!editing && <div><label className="label">Password</label><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>}
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">EMP Code</label><input className="input" value={form.empCode} onChange={(e) => setForm({ ...form, empCode: e.target.value })} required disabled={!!editing} /></div>
          <div><label className="label">Designation</label><input className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
          <div className="col-span-2">
            <label className="label">Assigned Hostel</label>
            <select className="input" value={form.assignedHostel} onChange={(e) => setForm({ ...form, assignedHostel: e.target.value })}>
              <option value="">— None —</option>
              {hostels.map((h) => <option key={h._id} value={h._id}>{h.name} ({h.code})</option>)}
            </select>
          </div>
          <div className="col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Create Warden'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove warden?"
        message={`This will permanently remove ${deleteTarget?.user?.name}'s account.`}
        confirmLabel="Remove"
      />
    </div>
  );
};

export default AdminWardens;
