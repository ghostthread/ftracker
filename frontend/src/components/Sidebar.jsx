import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Receipt, Settings,
  ChevronLeft, Mic, BarChart3, CreditCard, HelpCircle, PiggyBank
} from 'lucide-react';

const bottomNavItems = [
  { icon: Settings,   label: 'Settings',  to: '/settings' },
  { icon: HelpCircle, label: 'Help & Docs', to: '/help' },
];

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    to: '/' },
  { icon: TrendingUp,      label: 'Analytics',    to: '/analytics' },
  { icon: Receipt,         label: 'Transactions', to: '/transactions' },
  { icon: CreditCard,      label: 'Expenses',     to: '/expenses' },
  { icon: BarChart3,       label: 'Reports',      to: '/reports' },
  { icon: PiggyBank,       label: 'Budgets',      to: '/budgets' },
];


export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-slate-100 shadow-sm
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-slate-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0">
          <Mic className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-900 truncate">North Star</p>
            <p className="text-xs text-slate-400 truncate">Finance Tracker</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-150
              ${isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-indigo-600' : ''}`} />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-slate-100 pt-3">
        {bottomNavItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-150
              ${isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-indigo-600' : ''}`} />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={onToggle}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronLeft className={`w-4 h-4 shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span className="truncate">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
