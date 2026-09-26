import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  ArrowLeftRight, 
  Users, 
  FileSpreadsheet,
  X 
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuthStore } from '../../store/authStore';

export const ProtectedLayout: React.FC = () => {
  const { user } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const bottomNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { label: 'Purchases', path: '/purchases', icon: ShoppingCart, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { label: 'Transfers', path: '/transfers', icon: ArrowLeftRight, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { label: 'Assignments', path: '/assignments', icon: Users, roles: ['ADMIN', 'BASE_COMMANDER'] },
    { label: 'Audit Logs', path: '/audit-logs', icon: FileSpreadsheet, roles: ['ADMIN'] },
  ];

  const allowedBottomNav = bottomNavItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-[#f8f9fa] text-slate-800 font-sans selection:bg-amber-500 selection:text-white">
      {/* 1. Desktop Left Sidebar: Pinned Full Height with Independent Scroll */}
      <div className="hidden lg:flex flex-col w-64 h-screen h-[100dvh] shrink-0 overflow-hidden border-r border-[#152e22] bg-[#0b1a13] z-30">
        <Sidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-64 bg-[#0b1a13] text-slate-100 h-full overflow-hidden relative shadow-2xl flex flex-col"
          >
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-3.5 right-3 text-slate-400 hover:text-white p-1 rounded-full z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Content Container: Pinned Topbar + Independent Main Scrolling */}
      <div className="flex-1 flex flex-col h-screen h-[100dvh] overflow-hidden min-w-0 relative">
        {/* Pinned Fixed Topbar */}
        <div className="shrink-0 z-20">
          <Topbar onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        </div>
        
        {/* Main Dashboard / Page Body: Independent Vertical Scroll Container */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-7 pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* 4. Sticky Bottom Mobile Navigation Bar */}
        <nav className="lg:hidden shrink-0 fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around">
          {allowedBottomNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-all ${
                    isActive
                      ? 'text-[#123824] font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-50 text-[#123824]' : ''}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate mt-0.5">{item.label}</span>
                    {isActive && (
                      <div className="w-4 h-0.5 bg-[#123824] rounded-full mt-0.5" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
