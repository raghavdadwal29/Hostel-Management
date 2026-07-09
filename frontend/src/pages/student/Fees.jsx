import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload, FiCreditCard } from 'react-icons/fi';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payTarget, setPayTarget] = useState(null);
  const [paying, setPaying] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/fees/my-fees'); setFees(data.fees); }
    catch { toast.error('Failed to load fees'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const pay = async () => {
    setPaying(true);
    try {
      const { data: orderData } = await api.post(`/fees/${payTarget._id}/pay/order`);
      const due = payTarget.amount - payTarget.amountPaid;

      if (orderData.gatewayConfigured && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: 'INR',
          name: 'CGC University Hostel',
          description: `${payTarget.feeType} fee payment`,
          order_id: orderData.order.id,
          handler: async (response) => {
            await api.post(`/fees/${payTarget._id}/pay/confirm`, {
              amount: due, method: 'razorpay', transactionId: response.razorpay_payment_id,
            });
            toast.success('Payment successful!');
            setPayTarget(null);
            load();
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Mock instant-success payment flow (no gateway keys configured)
        await api.post(`/fees/${payTarget._id}/pay/confirm`, { amount: due, method: 'mock' });
        toast.success('Payment successful (demo mode)!');
        setPayTarget(null);
        load();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const downloadReceipt = async (fee) => {
    try {
      const { data } = await api.get(`/fees/${fee._id}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${fee.receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { toast.error('Failed to download receipt'); }
  };

  const columns = [
    { key: 'type', label: 'Fee Type', render: (f) => <span className="capitalize">{f.feeType}</span> },
    { key: 'year', label: 'Academic Year' },
    { key: 'amount', label: 'Amount', render: (f) => `₹${f.amount}` },
    { key: 'paid', label: 'Paid', render: (f) => `₹${f.amountPaid}` },
    { key: 'due', label: 'Due Date', render: (f) => new Date(f.dueDate).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (f) => <StatusBadge status={f.status} /> },
    {
      key: 'actions', label: '', render: (f) => (
        <div className="flex gap-2">
          {f.status !== 'paid' && (
            <button onClick={() => setPayTarget(f)} className="btn-primary !py-1.5 !px-3 text-xs"><FiCreditCard size={13} /> Pay Now</button>
          )}
          {f.status === 'paid' && (
            <button onClick={() => downloadReceipt(f)} className="btn-outline !py-1.5 !px-3 text-xs"><FiDownload size={13} /> Receipt</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Fees & Payments" subtitle="View your fee history and make payments online" />
      <div className="card p-5">
        <DataTable columns={columns} data={fees} loading={loading} emptyTitle="No fee records found" />
      </div>

      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title="Confirm Payment" size="sm">
        {payTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-4 text-sm space-y-1">
              <p className="flex justify-between"><span className="text-gray-500">Fee Type</span><span className="font-medium capitalize">{payTarget.feeType}</span></p>
              <p className="flex justify-between"><span className="text-gray-500">Amount Due</span><span className="font-bold text-primary-600">₹{payTarget.amount - payTarget.amountPaid}</span></p>
            </div>
            <p className="text-xs text-gray-400">Payments are processed securely via Razorpay. In demo mode (no gateway keys configured), payment completes instantly.</p>
            <button className="btn-primary w-full" onClick={pay} disabled={paying}>{paying ? 'Processing...' : 'Pay Now'}</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentFees;
