import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Library, Target, Activity, Code, LogOut, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';
import React, { useState, useEffect } from 'react';
import { clearAuthSession, readStoredUser } from '../utils/auth';
import api from '../api';

export default function Sidebar() {
  const navigate = useNavigate();
  const [user] = useState(() => readStoredUser());
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    api.get('/stats')
      .then(res => setStreak(res.data.streak ?? 0))
      .catch(() => setStreak(0));
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-[#1c1b1b] flex flex-col shrink-0 relative z-20 border-r border-[#3a4a44]/10">
      <div className="h-16 flex items-center px-8 shrink-0 mb-4 mt-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 text-jlearn-cyan font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <Code size={26} strokeWidth={2.5} />
          <span>JLearn</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
        <span className="text-[10px] uppercase tracking-widest text-[#83958d] mb-2 px-4 font-semibold">Menu</span>
        <NavItem to="/dashboard"  icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavItem to="/curriculum" icon={<Library size={18} />}         label="Curriculum" />
        <NavItem to="/review"     icon={<Target size={18} />}           label="Smart Review" />
        <NavItem to="/progress"   icon={<Activity size={18} />}         label="Analytics" />
      </nav>

      <div className="p-4 shrink-0 flex flex-col gap-4">
        {/* Streak Card */}
        <div className="bg-[#0e0e0e] p-4 rounded-xl flex flex-col gap-1 relative overflow-hidden group hover:bg-[#131313] transition-colors border border-[#3a4a44]/10">
          <div className="absolute top-0 left-0 w-1 h-full bg-jlearn-cyan opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-[10px] font-bold text-[#83958d] uppercase tracking-widest">Streak</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-jlearn-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {streak ?? '—'}
            </span>
            <span className="text-xs font-medium text-jlearn-cyan">Days 🔥</span>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="bg-[#2a2a2a]/30 rounded-xl p-3 flex items-center justify-between border border-[#3a4a44]/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-jlearn-cyan/10 flex items-center justify-center text-jlearn-cyan overflow-hidden border border-jlearn-cyan/20">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={16} />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-jlearn-primary truncate">{user?.name || 'User'}</span>
              <span className="text-[10px] text-[#83958d] truncate">{user?.email || 'Guest'}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-[#83958d] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
          isActive
            ? "bg-[#2a2a2a] text-jlearn-primary shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            : "text-[#b9cbc3] hover:bg-[#201f1f] hover:text-jlearn-primary"
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
