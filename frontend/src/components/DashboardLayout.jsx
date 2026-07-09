import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiMoon, FiSun, FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const DashboardLayout = ({ navItems, roleLabel }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    fetchNotifications();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-navy-900">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-navy-800 text-white flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="h-10 w-10 rounded-lg bg-primary-500 flex items-center justify-center font-display font-bold">CGC</div>
          <div className="leading-tight">
            <p className="font-display font-bold text-sm">CGC Hostel</p>
            <p className="text-[11px] text-white/50 capitalize">{roleLabel} Panel</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-primary-500 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full rounded-lg px-3.5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white">
            <FiLogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-navy-800/80 backdrop-blur border-b border-black/5 dark:border-white/5 px-5 py-3 flex items-center gap-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={20} />
          </button>
          <div className="flex-1" />
          <button onClick={toggleTheme} className="btn-ghost !p-2 rounded-full">
            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>
          <div className="relative">
            <button onClick={() => setNotifOpen((o) => !o)} className="btn-ghost !p-2 rounded-full relative">
              <FiBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-500" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 card p-2 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between px-2 py-1">
                  <p className="font-semibold text-sm">Notifications</p>
                  <button onClick={markAllRead} className="text-xs text-primary-500 hover:underline">Mark all read</button>
                </div>
                {notifications.length === 0 && <p className="text-xs text-gray-400 px-2 py-4 text-center">No notifications</p>}
                {notifications.map((n) => (
                  <div key={n._id} className={`px-3 py-2 rounded-lg text-sm ${!n.isRead ? 'bg-primary-50 dark:bg-white/5' : ''}`}>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2.5 pl-2 border-l border-black/5 dark:border-white/10">
            <div className="h-9 w-9 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </header>
        <main className="p-5 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
