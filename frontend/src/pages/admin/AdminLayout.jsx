import React from 'react';
import { FiGrid, FiUsers, FiUserCheck, FiHome, FiKey, FiFileText, FiDollarSign, FiBell, FiBarChart2 } from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/students', label: 'Students', icon: FiUsers },
  { to: '/admin/wardens', label: 'Wardens', icon: FiUserCheck },
  { to: '/admin/hostels', label: 'Hostels & Rooms', icon: FiHome },
  { to: '/admin/allocations', label: 'Allocations', icon: FiKey },
  { to: '/admin/applications', label: 'Applications', icon: FiFileText },
  { to: '/admin/fees', label: 'Fee Management', icon: FiDollarSign },
  { to: '/admin/notices', label: 'Notices', icon: FiBell },
  { to: '/admin/reports', label: 'Reports & Analytics', icon: FiBarChart2 },
];

const AdminLayout = () => <DashboardLayout navItems={navItems} roleLabel="admin" />;
export default AdminLayout;
