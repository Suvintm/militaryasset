import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
          Base: {user?.base?.name || (user?.role === 'ADMIN' ? 'All Bases (HQ)' : 'Unassigned')}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium text-slate-800">{user?.name}</div>
          <div className="text-xs text-slate-500">{user?.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs px-3 py-1.5 rounded bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-medium border border-slate-200 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};
