import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { label: 'Purchases', path: '/purchases', roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { label: 'Transfers', path: '/transfers', roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { label: 'Assignments & Expenditures', path: '/assignments', roles: ['ADMIN', 'BASE_COMMANDER'] },
    { label: 'Audit Logs', path: '/audit-logs', roles: ['ADMIN'] },
  ];

  const allowedNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800">
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-amber-500 flex items-center justify-center font-bold text-slate-950">
          M
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide">MAMS</h1>
          <p className="text-xs text-slate-400">Military Asset Management</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {allowedNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div>Logged in as:</div>
        <div className="font-semibold text-slate-200 truncate">{user?.name}</div>
        <div className="text-amber-400 font-mono text-[11px]">{user?.role}</div>
      </div>
    </aside>
  );
};
