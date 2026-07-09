import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';

const emptyHostel = { name: '', code: '', type: 'boys', totalFloors: 1, address: '', description: '' };
const emptyRoom = { hostel: '', floor: 1, roomNumber: '', roomType: 'double', totalBeds: 2, monthlyRent: 0 };

const AdminHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hostelModal, setHostelModal] = useState(false);
  const [roomModal, setRoomModal] = useState(false);
  const [hostelForm, setHostelForm] = useState(emptyHostel);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [editingHostel, setEditingHostel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteHostelTarget, setDeleteHostelTarget] = useState(null);
  const [deleteRoomTarget, setDeleteRoomTarget] = useState(null);

  const loadHostels = async () => {
    const { data } = await api.get('/hostel/hostels');
    setHostels(data.hostels);
    if (!selectedHostel && data.hostels.length) setSelectedHostel(data.hostels[0]._id);
  };

  const loadRooms = async (hostelId) => {
    if (!hostelId) return setRooms([]);
    const { data } = await api.get('/hostel/rooms', { params: { hostel: hostelId } });
    setRooms(data.rooms);
  };

  useEffect(() => { (async () => { setLoading(true); await loadHostels(); setLoading(false); })(); }, []);
  useEffect(() => { loadRooms(selectedHostel); }, [selectedHostel]);

  const openAddHostel = () => { setEditingHostel(null); setHostelForm(emptyHostel); setHostelModal(true); };
  const openEditHostel = (h) => { setEditingHostel(h); setHostelForm({ name: h.name, code: h.code, type: h.type, totalFloors: h.totalFloors, address: h.address || '', description: h.description || '' }); setHostelModal(true); };

  const submitHostel = async (e) => {
    e.preventDefault();
    try {
      if (editingHostel) {
        await api.put(`/hostel/hostels/${editingHostel._id}`, hostelForm);
        toast.success('Hostel updated');
      } else {
        await api.post('/hostel/hostels', hostelForm);
        toast.success('Hostel created');
      }
      setHostelModal(false);
      loadHostels();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving hostel'); }
  };

  const deleteHostel = async () => {
    try {
      await api.delete(`/hostel/hostels/${deleteHostelTarget._id}`);
      toast.success('Hostel removed');
      setDeleteHostelTarget(null);
      loadHostels();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const openAddRoom = () => { setEditingRoom(null); setRoomForm({ ...emptyRoom, hostel: selectedHostel }); setRoomModal(true); };
  const openEditRoom = (r) => { setEditingRoom(r); setRoomForm({ hostel: r.hostel._id || r.hostel, floor: r.floor, roomNumber: r.roomNumber, roomType: r.roomType, totalBeds: r.totalBeds, monthlyRent: r.monthlyRent }); setRoomModal(true); };

  const submitRoom = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/hostel/rooms/${editingRoom._id}`, roomForm);
        toast.success('Room updated');
      } else {
        await api.post('/hostel/rooms', roomForm);
        toast.success('Room created');
      }
      setRoomModal(false);
      loadRooms(selectedHostel);
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving room'); }
  };

  const deleteRoom = async () => {
    try {
      await api.delete(`/hostel/rooms/${deleteRoomTarget._id}`);
      toast.success('Room removed');
      setDeleteRoomTarget(null);
      loadRooms(selectedHostel);
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const roomColumns = [
    { key: 'roomNumber', label: 'Room No.' },
    { key: 'floor', label: 'Floor' },
    { key: 'roomType', label: 'Type' },
    { key: 'beds', label: 'Occupancy', render: (r) => `${r.occupiedBeds}/${r.totalBeds} beds` },
    { key: 'occ', label: '%', render: (r) => `${r.totalBeds ? Math.round((r.occupiedBeds / r.totalBeds) * 100) : 0}%` },
    { key: 'rent', label: 'Monthly Rent', render: (r) => `₹${r.monthlyRent}` },
    { key: 'status', label: 'Status' },
    {
      key: 'actions', label: '', render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => openEditRoom(r)} className="btn-ghost !p-2 rounded-lg"><FiEdit2 size={15} /></button>
          <button onClick={() => setDeleteRoomTarget(r)} className="btn-ghost !p-2 rounded-lg text-red-500"><FiTrash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Hostels & Rooms"
        subtitle="Manage hostel blocks, floors and room inventory"
        actions={<button className="btn-primary" onClick={openAddHostel}><FiPlus /> Add Hostel</button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {hostels.map((h) => (
          <button
            key={h._id}
            onClick={() => setSelectedHostel(h._id)}
            className={`card p-4 text-left transition ${selectedHostel === h._id ? 'ring-2 ring-primary-500' : ''}`}
          >
            <div className="flex items-center justify-between">
              <p className="font-display font-bold">{h.name}</p>
              <span className="badge bg-navy-100 text-navy-700">{h.code}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 capitalize">{h.type} · {h.totalFloors} floors</p>
            <p className="text-xs text-gray-400 mt-1">Warden: {h.warden?.user?.name || 'Unassigned'}</p>
            <div className="flex gap-2 mt-3">
              <span onClick={(e) => { e.stopPropagation(); openEditHostel(h); }} className="btn-ghost !p-1.5 rounded-lg"><FiEdit2 size={13} /></span>
              <span onClick={(e) => { e.stopPropagation(); setDeleteHostelTarget(h); }} className="btn-ghost !p-1.5 rounded-lg text-red-500"><FiTrash2 size={13} /></span>
            </div>
          </button>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold">Rooms {selectedHostel && `— ${hostels.find((h) => h._id === selectedHostel)?.name || ''}`}</h3>
          <button className="btn-primary" onClick={openAddRoom} disabled={!selectedHostel}><FiPlus /> Add Room</button>
        </div>
        <DataTable columns={roomColumns} data={rooms} loading={loading} emptyTitle="No rooms added to this hostel yet" />
      </div>

      <Modal open={hostelModal} onClose={() => setHostelModal(false)} title={editingHostel ? 'Edit Hostel' : 'Add Hostel'}>
        <form onSubmit={submitHostel} className="space-y-4">
          <div><label className="label">Hostel Name</label><input className="input" value={hostelForm.name} onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Code</label><input className="input" value={hostelForm.code} onChange={(e) => setHostelForm({ ...hostelForm, code: e.target.value })} required /></div>
            <div><label className="label">Type</label>
              <select className="input" value={hostelForm.type} onChange={(e) => setHostelForm({ ...hostelForm, type: e.target.value })}>
                <option value="boys">Boys</option><option value="girls">Girls</option><option value="co-ed">Co-ed</option>
              </select>
            </div>
          </div>
          <div><label className="label">Total Floors</label><input type="number" min={1} className="input" value={hostelForm.totalFloors} onChange={(e) => setHostelForm({ ...hostelForm, totalFloors: e.target.value })} /></div>
          <div><label className="label">Address</label><input className="input" value={hostelForm.address} onChange={(e) => setHostelForm({ ...hostelForm, address: e.target.value })} /></div>
          <div className="flex justify-end gap-3"><button type="button" className="btn-outline" onClick={() => setHostelModal(false)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form>
      </Modal>

      <Modal open={roomModal} onClose={() => setRoomModal(false)} title={editingRoom ? 'Edit Room' : 'Add Room'}>
        <form onSubmit={submitRoom} className="space-y-4">
          <div><label className="label">Hostel</label>
            <select className="input" value={roomForm.hostel} onChange={(e) => setRoomForm({ ...roomForm, hostel: e.target.value })} required>
              {hostels.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Floor</label><input type="number" min={0} className="input" value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })} required /></div>
            <div><label className="label">Room Number</label><input className="input" value={roomForm.roomNumber} onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Room Type</label>
              <select className="input" value={roomForm.roomType} onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}>
                <option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option><option value="dormitory">Dormitory</option>
              </select>
            </div>
            <div><label className="label">Total Beds</label><input type="number" min={1} className="input" value={roomForm.totalBeds} onChange={(e) => setRoomForm({ ...roomForm, totalBeds: e.target.value })} required /></div>
          </div>
          <div><label className="label">Monthly Rent (₹)</label><input type="number" min={0} className="input" value={roomForm.monthlyRent} onChange={(e) => setRoomForm({ ...roomForm, monthlyRent: e.target.value })} /></div>
          <div className="flex justify-end gap-3"><button type="button" className="btn-outline" onClick={() => setRoomModal(false)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteHostelTarget} onClose={() => setDeleteHostelTarget(null)} onConfirm={deleteHostel} title="Delete hostel?" message={`This will remove ${deleteHostelTarget?.name} permanently.`} confirmLabel="Delete" />
      <ConfirmDialog open={!!deleteRoomTarget} onClose={() => setDeleteRoomTarget(null)} onConfirm={deleteRoom} title="Delete room?" message={`This will remove room ${deleteRoomTarget?.roomNumber} permanently.`} confirmLabel="Delete" />
    </div>
  );
};

export default AdminHostels;
