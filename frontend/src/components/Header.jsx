import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Check, AlertCircle, Mic, Lightbulb, Cpu, X } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

const typeIcon = (type) => {
  switch (type) {
    case 'alert':  return <AlertCircle className="w-4 h-4 text-rose-500" />;
    case 'voice':  return <Mic         className="w-4 h-4 text-indigo-500" />;
    case 'tip':    return <Lightbulb   className="w-4 h-4 text-amber-500" />;
    default:       return <Cpu         className="w-4 h-4 text-slate-400" />;
  }
};

export default function Header({ searchQuery, onSearch }) {
  const { notifications, setNotifications } = useProfile();
  const [notifOpen, setNotifOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const dismiss     = (id) => setNotifications(n => n.filter(x => x.id !== id));

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 shrink-0">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search expenses, categories, notes…"
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
            placeholder:text-slate-400 transition-all"
        />
        {searchQuery && (
          <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg
              text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">Notifications</span>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">{unread}</span>
                  )}
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/40' : ''}`}>
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-slate-100 shadow-sm shrink-0 mt-0.5">
                      {typeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500">{n.body}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                    <button onClick={() => dismiss(n.id)} className="text-slate-300 hover:text-slate-500 mt-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-8">All caught up!</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
              AN
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none">Anupam</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Personal</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-11 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-50 py-1 overflow-hidden">
              {['Profile', 'Settings', 'Sign out'].map((item, i) => (
                <button
                  key={item}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors
                    ${i === 2 ? 'text-rose-600 hover:bg-rose-50 mt-1 border-t border-slate-100' : 'text-slate-700'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
