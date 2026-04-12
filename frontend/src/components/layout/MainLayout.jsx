import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, ShieldAlert, BadgeDollarSign, LogOut,
  BellRing, Settings, Moon, Sun, FileText,
  ClipboardList, HelpCircle, Download, Menu, ChevronRight,
  Monitor, Crown, Users
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const mainNav = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Fraud Detection', path: '/predict-fraud', icon: ShieldAlert },
    { name: 'Premium Estimator', path: '/predict-premium', icon: BadgeDollarSign },
    { name: 'Claims History', path: '/claims', icon: ClipboardList },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  const settingsNav = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Center', path: null, icon: HelpCircle, disabled: true },
  ];

  const pageTitles = {
    '/dashboard': 'Overview',
    '/predict-fraud': 'Fraud Detection',
    '/predict-premium': 'Premium Estimator',
    '/claims': 'Claims History',
    '/reports': 'Reports',
    '/settings': 'Settings',
  };

  const today = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  const NavLink = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.disabled ? '#' : item.path}
        onClick={e => {
          if (item.disabled) e.preventDefault();
          setSidebarOpen(false);
        }}
        className={`nav-item ${isActive ? 'nav-item-active' : ''} ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        style={{ color: isActive ? 'var(--primary)' : '' }}
      >
        <item.icon className="h-[17px] w-[17px] flex-shrink-0" />
        <span className="flex-1">{item.name}</span>
        {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <ShieldAlert className="h-4.5 w-4.5 text-white h-[18px] w-[18px]" />
          </div>
          <span className="text-[15px] font-bold" style={{ color: 'var(--text-1)' }}>
            Insure<span style={{ color: 'var(--primary)' }}>Guard</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-3">
        <p className="section-label">Menu</p>
        {mainNav.map(item => <NavLink key={item.path} item={item} />)}

        {/* Admin-only section */}
        {user?.role === 'admin' && (
          <>
            <p className="section-label" style={{ color: 'var(--warning)' }}>Admin</p>
            <NavLink item={{ name: 'User Management', path: '/settings', icon: Users }} />
          </>
        )}

        <p className="section-label">Help & Settings</p>
        {settingsNav.map((item, i) => <NavLink key={i} item={item} />)}
      </div>

      {/* Bottom: dark mode toggle + user */}
      <div className="px-3 pb-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="nav-item w-full text-left"
          style={{ marginBottom: '8px' }}
        >
          {isDark
            ? <Sun className="h-[17px] w-[17px] flex-shrink-0" style={{ color: 'var(--warning)' }} />
            : <Moon className="h-[17px] w-[17px] flex-shrink-0" style={{ color: 'var(--text-2)' }} />
          }
          <span style={{ color: 'var(--text-2)' }}>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          {/* Toggle pill */}
          <div
            className="ml-auto relative flex-shrink-0"
            style={{
              width: 36, height: 20, borderRadius: 99,
              background: isDark ? 'var(--primary)' : 'var(--border-strong)',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 2, left: isDark ? 16 : 2,
              width: 16, height: 16,
              background: 'white',
              borderRadius: 99,
              transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </div>
        </button>

        {/* User profile */}
        {user && (
          <div
            className="flex items-center gap-3 p-2.5 rounded-xl cursor-default group"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative"
              style={{ background: 'var(--primary)' }}
            >
              {user.username?.charAt(0).toUpperCase()}
              {/* Admin crown badge */}
              {user.role === 'admin' && (
                <Crown
                  className="absolute -top-1.5 -right-1.5 h-3 w-3"
                  style={{ color: '#FCD34D', filter: 'drop-shadow(0 0 4px rgba(252,211,77,0.8))' }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-1)' }}>{user.username}</p>
                {user.role === 'admin' && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: 'rgba(252,211,77,0.15)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.3)' }}>ADMIN</span>
                )}
              </div>
              <p className="text-[10px] capitalize" style={{ color: 'var(--text-3)' }}>{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[220px] flex-col flex-shrink-0" style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--border)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 h-full w-[220px] z-10"
            style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header
          className="h-16 flex items-center justify-between px-6 flex-shrink-0"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl transition-all"
              style={{ color: 'var(--text-2)' }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-1)' }}>
                Welcome back, {user?.username || 'User'} 🔥
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {pageTitles[location.pathname] || 'Dashboard'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Date badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {today}
            </div>

            {/* Notification bell */}
            <button
              className="relative p-2 rounded-xl transition-all"
              style={{ color: 'var(--text-2)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-soft)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <BellRing className="h-5 w-5" />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                style={{ background: 'var(--primary)', borderColor: 'var(--surface)' }}
              />
            </button>

            {/* Export button */}
            <button
              className="hidden sm:flex btn-primary"
              onClick={() => window.print()}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
