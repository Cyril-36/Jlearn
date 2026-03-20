import { Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession, readStoredUser } from '../utils/auth';

const NOTIFICATIONS = [
  { id: 1, text: 'New problems added to Collections Framework', time: 'Just now', unread: true },
  { id: 2, text: 'You solved 2 problems today — keep it up!', time: '1h ago', unread: true },
  { id: 3, text: 'Streak reminder: don\'t break your streak!', time: '3h ago', unread: false },
];

export default function TopBar() {
  const navigate = useNavigate();
  const user = readStoredUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, unread: false })));

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  return (
    <header className="h-20 bg-[#131313]/70 backdrop-blur-[20px] flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
      <div className="font-medium text-[#b9cbc3] text-sm tracking-wide">
        Welcome back, <span className="text-jlearn-primary">{user?.name?.split(' ')[0] || 'Developer'}</span>. Let's write some Java.
      </div>

      <div className="flex items-center gap-4">

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifications(v => !v); setShowProfile(false); }}
            className="text-[#b9cbc3] hover:text-jlearn-primary transition-colors relative group p-2"
          >
            <Bell size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(0,255,209,0.3)] transition-all" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-jlearn-cyan rounded-full shadow-[0_0_6px_rgba(0,255,209,0.6)]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-[#1c1b1b] border border-[#3a4a44]/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#3a4a44]/20">
                <span className="font-bold text-jlearn-primary text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-jlearn-cyan hover:underline uppercase tracking-wider font-bold">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="flex flex-col">
                {notifications.map(n => (
                  <div key={n.id} className={`px-5 py-4 border-b border-[#3a4a44]/10 last:border-0 flex items-start gap-3 ${n.unread ? 'bg-jlearn-cyan/[0.03]' : ''}`}>
                    {n.unread && <div className="w-2 h-2 rounded-full bg-jlearn-cyan mt-1.5 shrink-0" />}
                    {!n.unread && <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" />}
                    <div>
                      <p className="text-xs text-[#e5e2e1] leading-relaxed">{n.text}</p>
                      <p className="text-[10px] text-[#83958d] mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotifications(false); }}
            className="flex items-center gap-2 h-10 px-2 bg-[#0e0e0e] border border-[#3a4a44]/30 rounded-xl hover:bg-[#201f1f] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-jlearn-cyan/10 border border-jlearn-cyan/20 flex items-center justify-center text-jlearn-cyan overflow-hidden">
              {user?.avatar_url
                ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                : <User size={14} />}
            </div>
            <span className="text-xs font-semibold text-jlearn-primary max-w-[80px] truncate hidden sm:block">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown size={12} className="text-[#83958d]" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-56 bg-[#1c1b1b] border border-[#3a4a44]/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50">
              <div className="px-4 py-4 border-b border-[#3a4a44]/20">
                <p className="text-sm font-bold text-jlearn-primary truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-[#83958d] truncate mt-0.5">{user?.email || ''}</p>
              </div>
              <div className="py-2">
                {user?.is_admin && (
                  <button
                    onClick={() => { setShowProfile(false); navigate('/admin'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#b9cbc3] hover:bg-[#201f1f] hover:text-jlearn-primary transition-colors text-left"
                  >
                    <Settings size={15} /> Admin Panel
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors text-left"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
