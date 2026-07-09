import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiUserX } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';

const AdminAllocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: '', hostel: '', roomId: '' });
  const [deallocTarget, setDeallocTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, s, h] = await Promise.all([
        api.get('/hostel/allocations', { params: { status: 'active' } }),
        api.get('/admin/students', { params: { applicationStatus: 'approved', limit: 500 } }),
        api.get('/hostel/hostels'),
      ]);
      setAllocations(a.data.allocations);
      setStudents(s.data.students.filter((st) => !st.allocation));
      setHostels(h.data.hostels);
    } catch { toast.error('Failed to load allocations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (form.hostel) {
      api.get('/hostel/rooms', { params: { hostel: form.hostel } }).then(({ data }) => {
        setRooms(data.rooms.filter((r) => r.occupiedBeds < r.totalBeds));
      });
    } else setRooms([]);
  }, [form.hostel]);

  const openAdd = () => { setForm({ studentId: '', hostel: '', roomId: '' }); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hostel/allocations', { studentId: form.studentId, roomId: form.roomId });
      toast.success('Room allocated successfully');
      setModalOpen(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Allocation failed'); }
  };

  const deallocate = async () => {
    try {
      await api.put(`/hostel/allocations/${deallocTarget._id}/deallocate`);
      toast.success('Room deallocated');
      setDeallocTarget(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'student', label: 'Student', render: (a) => a.student?.user?.name },
    { key: 'enrollment', label: 'Enrollment No', render: (a) => a.student?.enrollmentNo },
    { key: 'hostel', label: 'Hostel', render: (a) => a.hostel?.name },
    { key: 'room', label: 'Room', render: (a) => a.room?.roomNumber },
    { key: 'bed', label: 'Bed No.', render: (a) => a.bedNumber },
    { key: 'date', label: 'Allocated On', render: (a) => new Date(a.allocatedOn).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    { key: 'actions', label: '', render: (a) => (
        <button onClick={() => setDeallocTarget(a)} className="btn-ghost !p-2 rounded-lg text-red-500" title="Deallocate"><FiUserX size={15} /></button>
      )
    },
  ];

  return (
    <div>
      <PageHeader
        title="Room Allocation"
        subtitle="Allocate approved students to vacant beds, or vacate existing allocations"
        actions={<button className="btn-primary" onClick={openAdd}><FiPlus /> Allocate Room</button>}
      />
      <div className="card p-5">
        <DataTable columns={columns} data={allocations} loading={loading} emptyTitle="No active allocations" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Allocate Room">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Approved Student (unallocated)</label>
            <select className="input" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
              <option value="">Select student</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.user?.name} — {s.enrollmentNo}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Hostel</label>
            <select className="input" value={form.hostel} onChange={(e) => setForm({ ...form, hostel: e.target.value, roomId: '' })} required>
              <option value="">Select hostel</option>
              {hostels.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Vacant Room</label>
            <select className="input" value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} required disabled={!form.hostel}>
              <option value="">Select room</option>
              {rooms.map((r) => <option key={r._id} value={r._id}>{r.roomNumber} — {r.totalBeds - r.occupiedBeds} bed(s) vacant</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3"><button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary">Allocate</button></div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deallocTarget}
        onClose={() => setDeallocTarget(null)}
        onConfirm={deallocate}
        title="Deallocate room?"
        message={`This will free up the bed occupied by ${deallocTarget?.student?.user?.name}.`}
        confirmLabel="Deallocate"
      />
    </div>
  );
};

export default AdminAllocations;
