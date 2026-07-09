import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiHome, FiUsers, FiDollarSign, FiMapPin } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const StudentRoom = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/profile').then(({ data }) => setProfile(data.student))
      .catch(() => toast.error('Failed to load room details'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;

  const allocation = profile?.allocation;

  return (
    <div>
      <PageHeader title="My Room" subtitle="Your current hostel room allocation details" />
      {!allocation ? (
        <EmptyState title="No room allocated yet" subtitle="Once your hostel application is approved and a room is allocated by the administration, details will appear here." />
      ) : (
        <div className="card p-6 max-w-lg">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-14 w-14 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center"><FiHome size={26} /></div>
            <div>
              <p className="text-2xl font-display font-bold">{allocation.room?.roomNumber}</p>
              <p className="text-sm text-gray-500">{allocation.hostel?.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-500"><FiMapPin size={15} /> Floor {allocation.room?.floor}</div>
            <div className="flex items-center gap-2 text-gray-500"><FiUsers size={15} /> Bed No. {allocation.bedNumber}</div>
            <div className="flex items-center gap-2 text-gray-500 capitalize"><FiHome size={15} /> {allocation.room?.roomType} Room</div>
            <div className="flex items-center gap-2 text-gray-500"><FiDollarSign size={15} /> ₹{allocation.room?.monthlyRent} / month</div>
          </div>
          {allocation.room?.amenities?.length > 0 && (
            <div className="mt-5">
              <p className="label mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {allocation.room.amenities.map((a) => <span key={a} className="badge bg-navy-100 text-navy-700">{a}</span>)}
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-5">Allocated on {new Date(allocation.allocatedOn).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};

export default StudentRoom;
