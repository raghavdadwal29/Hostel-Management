import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notices').then(({ data }) => setNotices(data.notices))
      .catch(() => toast.error('Failed to load notices'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;

  return (
    <div>
      <PageHeader title="Notice Board" subtitle="Latest announcements from administration and warden" />
      {notices.length === 0 ? <EmptyState title="No notices posted yet" /> : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n._id} className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                {n.isPinned && <span className="badge bg-gold-500/15 text-gold-600">Pinned</span>}
                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="font-display font-bold">{n.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{n.content}</p>
              <p className="text-xs text-gray-400 mt-3">Posted by {n.postedBy?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotices;
