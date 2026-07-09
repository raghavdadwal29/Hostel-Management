import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import ConfirmDialog from '../../components/ConfirmDialog';

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', audience: 'all', isPinned: false });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/notices'); setNotices(data.notices); }
    catch { toast.error('Failed to load notices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices', form);
      toast.success('Notice posted');
      setModalOpen(false);
      setForm({ title: '', content: '', audience: 'all', isPinned: false });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post notice'); }
  };

  const remove = async () => {
    try { await api.delete(`/notices/${deleteTarget._id}`); toast.success('Notice removed'); setDeleteTarget(null); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <PageHeader title="Notice Board" subtitle="Post announcements visible to students and/or wardens" actions={<button className="btn-primary" onClick={() => setModalOpen(true)}><FiPlus /> New Notice</button>} />

      {loading ? <Loader /> : notices.length === 0 ? <EmptyState title="No notices posted yet" /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {notices.map((n) => (
            <div key={n._id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {n.isPinned && <span className="badge bg-gold-500/15 text-gold-600">Pinned</span>}
                    <span className="badge bg-navy-100 text-navy-700 capitalize">{n.audience}</span>
                  </div>
                  <h4 className="font-display font-bold mt-2">{n.title}</h4>
                </div>
                <button onClick={() => setDeleteTarget(n)} className="btn-ghost !p-2 rounded-lg text-red-500"><FiTrash2 size={15} /></button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{n.content}</p>
              <p className="text-xs text-gray-400 mt-3">By {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post New Notice">
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><label className="label">Content</label><textarea className="input" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></div>
          <div><label className="label">Audience</label>
            <select className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="all">Everyone</option><option value="students">Students Only</option><option value="wardens">Wardens Only</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} /> Pin to top</label>
          <div className="flex justify-end gap-3"><button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary">Post Notice</button></div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={remove} title="Delete notice?" message="This notice will be removed for everyone." confirmLabel="Delete" />
    </div>
  );
};

export default AdminNotices;
