import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Toolbar from '../../components/Toolbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = { name: '', email: '', password: '', phone: '', enrollmentNo: '', course: '', branch: '', year: 1, semester: 1, gender: 'male' };

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/students', { params: search ? { search } : {} });
      setStudents(data.students);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.user?.name || '', email: s.user?.email || '', password: '',
      phone: s.user?.phone || '', enrollmentNo: s.enrollmentNo, course: s.course,
      branch: s.branch, year: s.year || 1, semester: s.semester || 1, gender: s.gender,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/students/${editing._id}`, form);
        toast.success('Student updated');
      } else {
        await api.post('/admin/students', form);
        toast.success('Student created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/students/${deleteTarget._id}`);
      toast.success('Student removed');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (s) => s.user?.name },
    { key: 'enrollmentNo', label: 'Enrollment No' },
    { key: 'course', label: 'Course', render: (s) => `${s.course}${s.branch ? ` - ${s.branch}` : ''}` },
    { key: 'email', label: 'Email', render: (s) => s.user?.email },
    { key: 'room', label: 'Room', render: (s) => s.allocation?.room ? `${s.allocation.room.roomNumber} (Bed ${s.allocation.bedNumber})` : '—' },
    { key: 'status', label: 'Application', render: (s) => <StatusBadge status={s.applicationStatus} /> },
    {
      key: 'actions', label: '', render: (s) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(s)} className="btn-ghost !p-2 rounded-lg"><FiEdit2 size={15} /></button>
          <button onClick={() => setDeleteTarget(s)} className="btn-ghost !p-2 rounded-lg text-red-500"><FiTrash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Manage Students" subtitle="Add, edit, search and manage all registered students" />
      <div className="card p-5">
        <Toolbar search={search} onSearchChange={setSearch} onAddClick={openAdd} addLabel="Add Student" />
        <DataTable columns={columns} data={students} loading={loading} emptyTitle="No students found" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Student' : 'Add Student'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editing} /></div>
          {!editing && <div><label className="label">Password</label><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>}
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Enrollment No</label><input className="input" value={form.enrollmentNo} onChange={(e) => setForm({ ...form, enrollmentNo: e.target.value })} required disabled={!!editing} /></div>
          <div><label className="label">Gender</label>
            <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </div>
          <div><label className="label">Course</label><input className="input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required /></div>
          <div><label className="label">Branch</label><input className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></div>
          <div><label className="label">Year</label><input className="input" type="number" min={1} max={5} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
          <div><label className="label">Semester</label><input className="input" type="number" min={1} max={10} value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></div>
          <div className="col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Create Student'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove student?"
        message={`This will permanently remove ${deleteTarget?.user?.name}'s account and student record.`}
        confirmLabel="Remove"
      />
    </div>
  );
};

export default AdminStudents;
