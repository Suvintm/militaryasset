import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import type { Base } from '../../types';
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  Building2,
  Check
} from 'lucide-react';

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [baseMenuOpen, setBaseMenuOpen] = useState(false);
  const [dbBases, setDbBases] = useState<Base[]>([]);

  useEffect(() => {
    apiClient.get(ENDPOINTS.BASES)
      .then(res => setDbBases(res.data.data))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get initials from authenticated user
  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AO';

  const roleDisplay = user?.role === 'ADMIN'
    ? 'Admin • HQ'
    : user?.role === 'BASE_COMMANDER'
    ? `Cmdr • ${user.base?.name || 'Base Command'}`
    : user?.role === 'LOGISTICS_OFFICER'
    ? 'Logistics • Supply'
    : 'Authorized Personnel';

  const baseLabel = user?.role === 'ADMIN' 
    ? 'All Bases (HQ)' 
    : user?.base?.name || (user?.baseId ? 'Base Command' : 'All Bases');

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* 1. Left: Hamburger + Tricolor Divider + MAMS Title */}
      <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {/* Vertical Tricolor Capsule */}
          <div className="flex flex-col h-6 sm:h-[26px] w-1 sm:w-1.5 rounded-full overflow-hidden shrink-0 shadow-2xs">
            <div className="h-1/3 bg-[#FF9933]" />
            <div className="h-1/3 bg-white border-y border-slate-200/60" />
            <div className="h-1/3 bg-[#138808]" />
          </div>

          {/* MAMS Branding */}
          <div className="flex flex-col justify-center">
            <span className="font-black text-[16px] tracking-wide text-slate-900 leading-none">
              MAMS
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-normal mt-0.5 leading-none">
              Military Asset Management System
            </span>
          </div>
        </div>
      </div>

      {/* 2. Center: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-[420px] mx-6">
        <div className="flex items-center bg-[#f8f9fa] hover:bg-[#f1f3f5] border border-slate-200/90 rounded-xl px-3.5 py-1.5 text-xs text-slate-700 w-full focus-within:ring-2 focus-within:ring-[#123824] focus-within:border-transparent focus-within:bg-white transition-all shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            placeholder="Search assets, bases, personnel, equipment..."
            className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400 text-xs font-normal"
          />
          <kbd className="text-[10px] font-mono text-slate-400 bg-slate-200/70 rounded px-1.5 py-0.5 border border-slate-300/80 shrink-0 select-none">
            /
          </kbd>
        </div>
      </div>

      {/* 3. Right: Base Context Dropdown + Notification Bell + Profile Chip */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Base Context Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setBaseMenuOpen(!baseMenuOpen)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#edf7f1] hover:bg-[#e3f2e8] border border-[#c3e7d1] text-xs font-semibold text-[#136137] transition cursor-pointer shadow-2xs"
          >
            <Building2 className="w-4 h-4 text-[#136137] shrink-0" />
            <span className="tracking-tight">{baseLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#136137] shrink-0" />
          </button>

          {/* Dynamic Base Switcher Menu */}
          {baseMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setBaseMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Available Command Bases
              </div>
              <button
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-[#edf7f1] hover:text-[#136137] flex items-center justify-between transition cursor-pointer"
              >
                <span>All Bases (HQ)</span>
                {baseLabel === 'All Bases (HQ)' && <Check className="w-3.5 h-3.5 text-[#136137]" />}
              </button>
              {dbBases.map((b) => (
                <button
                  key={b.id}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-[#edf7f1] hover:text-[#136137] flex items-center justify-between transition cursor-pointer"
                >
                  <span className="truncate">{b.name}</span>
                  {baseLabel === b.name && <Check className="w-3.5 h-3.5 text-[#136137]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell with Red Badge Dot */}
        <button 
          className="relative p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-white" />
        </button>

        {/* User Profile Chip */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 sm:pr-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#123824] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-1 ring-[#1b4e33]">
              {initials}
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {user?.name || 'Officer In Charge'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                {roleDisplay}
              </div>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setProfileOpen(false)}
            >
              <div className="px-4 py-2.5 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{user?.name || 'Officer In Charge'}</div>
                <div className="text-[11px] text-slate-500 truncate">{user?.email || 'officer@forces.gov'}</div>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200/80">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  {user?.role || 'AUTHORIZED'} Clearance
                </div>
              </div>

              <div className="py-1">
                <div className="px-4 py-1.5 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Assigned Base</span>
                  <span className="font-semibold text-slate-800">{baseLabel}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out of MAMS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
