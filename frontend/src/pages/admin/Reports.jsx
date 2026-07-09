import React from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';

const downloadFile = async (url, filename) => {
  try {
    const { data } = await api.get(url, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    toast.error('Failed to generate report');
  }
};

const ReportCard = ({ icon: Icon, title, subtitle, onClick }) => (
  <button onClick={onClick} className="card p-5 text-left hover:shadow-panel transition flex items-start gap-4">
    <div className="h-11 w-11 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center shrink-0">
      <Icon size={20} />
    </div>
    <div>
      <p className="font-display font-bold">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    </div>
    <FiDownload className="ml-auto text-gray-300 shrink-0" size={18} />
  </button>
);

const AdminReports = () => (
  <div>
    <PageHeader title="Reports & Analytics" subtitle="Export hostel data for record-keeping and audits" />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ReportCard
        icon={FiFileText}
        title="Students Report (CSV)"
        subtitle="All registered students with course and application status"
        onClick={() => downloadFile('/reports/students/csv', 'students-report.csv')}
      />
      <ReportCard
        icon={FiFileText}
        title="Fee Collection Report (CSV)"
        subtitle="Full fee ledger including payment status and dates"
        onClick={() => downloadFile('/reports/fees/csv', 'fees-report.csv')}
      />
      <ReportCard
        icon={FiFileText}
        title="Hostel Summary (PDF)"
        subtitle="High-level PDF summary — students, complaints, fee collection"
        onClick={() => downloadFile('/reports/summary/pdf', 'hostel-summary-report.pdf')}
      />
    </div>
  </div>
);

export default AdminReports;
