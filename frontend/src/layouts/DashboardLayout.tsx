import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon, UserIcon, TrophyIcon, ChartBarIcon,
  TableCellsIcon, ArrowRightOnRectangleIcon,
  Bars3Icon, XMarkIcon, UserGroupIcon,
  AcademicCapIcon, DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

const navItemsStudent = [
  { to: '/student/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/student/profile', label: 'My Profile', icon: UserIcon },
  { to: '/opportunities', label: 'Opportunities', icon: AcademicCapIcon },
  { to: '/competitions', label: 'Competitions', icon: TrophyIcon },
  { to: '/student/registrations', label: 'My Registrations', icon: TableCellsIcon },
];

const navItemsCoach = [
  { to: '/coach/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/coach/profile', label: 'My Profile', icon: UserIcon },
  { to: '/coach/training', label: 'My Training', icon: AcademicCapIcon },
  { to: '/coach/attendance', label: 'Attendance', icon: TableCellsIcon },
  { to: '/coach/performance', label: 'Performance', icon: ChartBarIcon },
];

const navItemsAdmin = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/admin/students', label: 'Students', icon: UserGroupIcon },
  { to: '/admin/coaches', label: 'Coaches', icon: UserIcon },
  { to: '/admin/opportunities', label: 'Opportunities', icon: AcademicCapIcon },
  { to: '/admin/competitions', label: 'Competitions', icon: TrophyIcon },
  { to: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
  { to: '/admin/excel', label: 'Data Management', icon: DocumentArrowUpIcon },
  { to: '/admin/players-csv', label: 'Player CSV', icon: TableCellsIcon },
  { to: '/admin/competitions-csv', label: 'Competition CSV', icon: TrophyIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user?.role === 'STUDENT' ? navItemsStudent
    : user?.role === 'COACH' ? navItemsCoach
    : navItemsAdmin;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = user?.role === 'ADMIN' ? 'bg-red-600'
    : user?.role === 'COACH' ? 'bg-emerald-600'
    : 'bg-blue-600';

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-800 border-r border-slate-700 
                         flex flex-col transform transition-transform duration-300
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">HockeyConnect</div>
              <div className="text-slate-400 text-xs mt-0.5">Connect. Train. Compete. Grow.</div>
            </div>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${roleColor} rounded-full flex items-center justify-center`}>
              <span className="text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-medium text-sm truncate">{user?.name}</div>
              <div className="text-slate-400 text-xs">{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={isActive ? 'nav-link-active' : 'nav-link'}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="text-slate-400 text-sm">
            {location.pathname.split('/').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' › ')}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
