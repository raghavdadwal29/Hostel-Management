import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminWardens from './pages/admin/Wardens';
import AdminHostels from './pages/admin/Hostels';
import AdminAllocations from './pages/admin/Allocations';
import AdminApplications from './pages/admin/Applications';
import AdminFees from './pages/admin/Fees';
import AdminNotices from './pages/admin/Notices';
import AdminReports from './pages/admin/Reports';

import WardenLayout from './pages/warden/WardenLayout';
import WardenDashboard from './pages/warden/Dashboard';
import WardenComplaints from './pages/warden/Complaints';
import WardenLeaves from './pages/warden/Leaves';
import WardenAttendance from './pages/warden/Attendance';
import WardenVisitors from './pages/warden/Visitors';
import WardenNotices from './pages/warden/Notices';
import WardenOccupancy from './pages/warden/Occupancy';

import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import StudentApply from './pages/student/Apply';
import StudentRoom from './pages/student/Room';
import StudentComplaints from './pages/student/Complaints';
import StudentLeave from './pages/student/Leave';
import StudentAttendance from './pages/student/Attendance';
import StudentNotices from './pages/student/Notices';
import StudentFees from './pages/student/Fees';
import StudentProfile from './pages/student/Profile';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
};

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: '14px' } }} />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="wardens" element={<AdminWardens />} />
          <Route path="hostels" element={<AdminHostels />} />
          <Route path="allocations" element={<AdminAllocations />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="fees" element={<AdminFees />} />
          <Route path="notices" element={<AdminNotices />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        <Route
          path="/warden"
          element={
            <ProtectedRoute roles={['warden']}>
              <WardenLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WardenDashboard />} />
          <Route path="complaints" element={<WardenComplaints />} />
          <Route path="leaves" element={<WardenLeaves />} />
          <Route path="attendance" element={<WardenAttendance />} />
          <Route path="visitors" element={<WardenVisitors />} />
          <Route path="notices" element={<WardenNotices />} />
          <Route path="occupancy" element={<WardenOccupancy />} />
        </Route>

        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="apply" element={<StudentApply />} />
          <Route path="room" element={<StudentRoom />} />
          <Route path="complaints" element={<StudentComplaints />} />
          <Route path="leave" element={<StudentLeave />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="notices" element={<StudentNotices />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
