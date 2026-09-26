import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  ArrowLeftRight, 
  Users, 
  FileSpreadsheet,
  Building2,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { label: 'Purchases', path: '/purchases', icon: ShoppingCart, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { label: 'Transfers', path: '/transfers', icon: ArrowLeftRight, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { 
      label: 'Assignments &\nExpenditures', 
      isMultiLine: true,
      line1: 'Assignments &',
      line2: 'Expenditures',
      path: '/assignments', 
      icon: Users, 
      roles: ['ADMIN', 'BASE_COMMANDER'] 
    },
    { label: 'Audit Logs', path: '/audit-logs', icon: FileSpreadsheet, roles: ['ADMIN'] },
  ];

  const allowedNav = navItems.filter(item => user && item.roles.includes(user.role));

  const baseLabel = user?.role === 'ADMIN' 
    ? 'All Bases (HQ)' 
    : user?.base?.name || 'All Bases';

  return (
    <aside className="w-64 bg-[#0b1a13] text-slate-100 flex flex-col h-full shrink-0 select-none relative overflow-hidden">
      {/* 1. Official Ministry Header (Lion Capital Emblem + Hindi + English) */}
      <div className="p-4 sm:p-5 flex items-center gap-3 shrink-0">
        <img
          src="/emblem.png"
          alt="National Emblem"
          className="h-10 w-auto object-contain brightness-0 invert opacity-95 shrink-0"
        />
        <div className="flex flex-col">
          <span className="font-bold text-slate-100 text-[11px] leading-tight tracking-wide font-devanagari">
            रक्षा मंत्रालय
          </span>
          <span className="font-extrabold text-white text-[12px] leading-tight tracking-wider uppercase font-cinzel">
            MINISTRY OF DEFENCE
          </span>
          <span className="text-[8.5px] text-slate-400 tracking-[0.16em] font-semibold uppercase leading-tight mt-0.5">
            GOVERNMENT OF INDIA
          </span>
        </div>
      </div>

      {/* 2. Navigation Links */}
      <nav className="px-3 space-y-1.5 z-10">
        {allowedNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#133d26] border border-[#276442] text-white shadow-sm shadow-emerald-950/60 font-semibold'
                    : 'text-slate-300 hover:bg-[#11261c] hover:text-white font-normal'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.isMultiLine ? (
                <div className="flex flex-col leading-tight">
                  <span className="text-[13px]">{item.line1}</span>
                  <span className="text-[13px]">{item.line2}</span>
                </div>
              ) : (
                <span className="text-[13px] truncate">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* 3. Base Context Selector */}
      <div className="px-3 pt-3 pb-2 z-10">
        <div className="text-[10px] font-bold text-slate-400/90 uppercase tracking-widest px-1 mb-1.5">
          BASE CONTEXT
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0f2319] border border-[#1b3b2b] text-xs font-medium text-white shadow-xs hover:border-[#27563f] transition cursor-pointer">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 text-slate-300 shrink-0" />
            <span className="truncate font-semibold text-slate-100">{baseLabel}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* 4. Bottom Soldier Silhouette Graphic & National Slogan */}
      <div className="relative mt-auto pt-28 pb-5 px-4 flex flex-col justify-end overflow-hidden shrink-0">
        {/* Background soldier image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/mission_soldier.jpg"
            alt=""
            className="w-full h-full object-cover object-top opacity-55 brightness-75 contrast-125"
          />
          {/* Smooth gradient blend from sidebar background into the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a13] via-[#0b1a13]/70 to-[#0b1a13]/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1a13] via-transparent to-transparent" />
        </div>

        {/* Slogan & Tricolor Bar */}
        <div className="relative z-10 text-left space-y-0.5">
          <div className="text-[11px] font-bold tracking-[0.16em] text-white uppercase leading-tight font-sans">
            SECURE ASSETS
          </div>
          <div className="text-[11px] font-bold tracking-[0.16em] text-slate-200 uppercase leading-tight font-sans">
            STRONGER NATION
          </div>
          <div className="flex h-[3.5px] w-11 rounded-full overflow-hidden mt-1.5 shadow-xs">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-white" />
            <div className="w-1/3 bg-[#138808]" />
          </div>
        </div>
      </div>
    </aside>
  );
};
