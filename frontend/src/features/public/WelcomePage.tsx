import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  ArrowRight, 
  Search, 
  Box, 
  ArrowLeftRight, 
  Users, 
  ShieldCheck, 
  Building2, 
  Zap, 
  BarChart3, 
  X,
  ShieldAlert,
  ChevronRight,
  Truck,
  Award,
  ArrowLeft,
  Eye,
  EyeOff,
  Menu,
  FileText,
  Share2,
  Layers,
  LayoutGrid,
  Clock,
  Compass,
  BarChart2,
  MapPin,
  User,
  ShoppingCart,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';

type RoleType = 'ADMIN' | 'BASE_COMMANDER' | 'LOGISTICS_OFFICER';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  // Modal & Login States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [commanderBase, setCommanderBase] = useState<'north' | 'south'>('north');
  
  // Mobile Navigation States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbBases, setDbBases] = useState<any[]>([]);

  React.useEffect(() => {
    apiClient.get(ENDPOINTS.BASES)
      .then(res => setDbBases(res.data.data))
      .catch(() => {});
  }, []);

  // Helper to open modal directly to a role
  const handleSelectRole = (role: RoleType, base: 'north' | 'south' = 'north') => {
    setSelectedRole(role);
    setCommanderBase(base);
    setError(null);

    if (role === 'ADMIN') {
      setEmail('admin@forces.gov');
      setPassword('Admin@123');
    } else if (role === 'BASE_COMMANDER') {
      if (base === 'north') {
        setEmail('cmdr.north@forces.gov');
        setPassword('Cmdr@123');
      } else {
        setEmail('cmdr.south@forces.gov');
        setPassword('Cmdr@123');
      }
    } else if (role === 'LOGISTICS_OFFICER') {
      setEmail('logistics@forces.gov');
      setPassword('Logistics@123');
    }

    setShowLoginModal(true);
  };

  const handleCommanderBaseToggle = (base: 'north' | 'south') => {
    setCommanderBase(base);
    if (base === 'north') {
      setEmail('cmdr.north@forces.gov');
      setPassword('Cmdr@123');
    } else {
      setEmail('cmdr.south@forces.gov');
      setPassword('Cmdr@123');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      setShowLoginModal(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials and database status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 flex flex-col selection:bg-amber-500 selection:text-white">
      {/* 1. TOP UTILITY BAR (Official Government Header) */}
      <header className="bg-[#192229] border-b border-slate-700/60 text-[11px] py-1.5 px-4 sm:px-8 md:px-12 flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          {/* Indian Tricolor Flag SVG */}
          <svg className="w-5 h-3.5 shadow-2xs rounded-2xs" viewBox="0 0 24 16" fill="none">
            <rect width="24" height="5.33" fill="#FF9933" />
            <rect y="5.33" width="24" height="5.34" fill="#FFFFFF" />
            <rect y="10.67" width="24" height="5.33" fill="#138808" />
            <circle cx="12" cy="8" r="2.2" stroke="#000080" strokeWidth="0.5" fill="none" />
            <circle cx="12" cy="8" r="0.6" fill="#000080" />
          </svg>
          <span className="font-semibold tracking-wide text-slate-200 text-[10px] sm:text-[11px]">
            GOVERNMENT OF INDIA
          </span>
          <span className="text-slate-500">|</span>
          <span className="font-medium tracking-wide text-slate-300 text-[10px] sm:text-[11px]">
            MINISTRY OF DEFENCE
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-slate-300">
          <button className="hover:text-white transition cursor-pointer">Skip to Main Content</button>
          <span className="text-slate-600">|</span>
          <button className="hover:text-white transition cursor-pointer">Screen Reader Access</button>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-semibold">
            <button className="px-1 hover:text-white cursor-pointer">A-</button>
            <button className="px-1 hover:text-white cursor-pointer">A</button>
            <button className="px-1 hover:text-white cursor-pointer">A+</button>
          </div>
          <span className="text-slate-600">|</span>
          <span className="cursor-pointer font-medium hover:text-white">English ▾</span>
        </div>
      </header>

      {/* 2. MAIN NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-2xs px-4 sm:px-8 md:px-12 py-2.5 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Left: Emblem + Titles */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src="/emblem.png"
              alt="National Emblem of India"
              className="h-10 sm:h-12 w-auto object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-xs sm:text-sm leading-tight tracking-wide">
                रक्षा मंत्रालय
              </span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight tracking-wider uppercase font-cinzel">
                MINISTRY OF DEFENCE
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 tracking-widest font-medium uppercase">
                GOVERNMENT OF INDIA
              </span>
            </div>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-[13px] font-semibold text-slate-700">
            <a href="#home" className="text-[#b45309] font-bold border-b-2 border-[#b45309] pb-0.5">
              Home
            </a>
            <a href="#roles" className="hover:text-[#b45309] transition">
              Role Portals
            </a>
            <a href="#features" className="hover:text-[#b45309] transition">
              System Modules
            </a>
            <a href="#logic" className="hover:text-[#b45309] transition">
              Ledger Logic
            </a>
            <a href="#bases" className="hover:text-[#b45309] transition">
              Bases Network
            </a>
            <a href="#mission" className="hover:text-[#b45309] transition">
              Resources
            </a>
            <a href="#contact" className="hover:text-[#b45309] transition">
              Contact
            </a>
          </div>

          {/* Right: Search & Action Button (Desktop & Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search input */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3.5 py-1.5 border border-slate-200 text-xs w-52 lg:w-60">
              <input
                type="text"
                placeholder="Search assets, bases, modules..."
                className="bg-transparent border-none outline-none w-full text-slate-700 placeholder-slate-400 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>

            {/* Desktop Login Button */}
            <button
              onClick={() => {
                setSelectedRole(null);
                setShowLoginModal(true);
              }}
              className="hidden sm:flex items-center gap-2 bg-[#123824] hover:bg-[#0c2718] text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login to MAMS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Controls */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {mobileSearchOpen && (
          <div className="md:hidden pt-2.5 pb-1">
            <div className="flex items-center bg-slate-100 rounded-full px-3.5 py-2 border border-slate-200 text-xs w-full">
              <input
                type="text"
                placeholder="Search assets, bases, modules..."
                className="bg-transparent border-none outline-none w-full text-slate-700 placeholder-slate-400 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-3 pb-2 border-t border-slate-100 mt-2 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl bg-amber-50 text-amber-900 font-bold">Home</a>
              <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">Role Portals</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">System Modules</a>
              <a href="#logic" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">Ledger Logic</a>
              <a href="#bases" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">Bases Network</a>
              <a href="#mission" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">Our Mission</a>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSelectedRole(null);
                setShowLoginModal(true);
              }}
              className="w-full mt-2 py-2.5 bg-[#123824] hover:bg-[#0c2718] text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login to MAMS Gateway</span>
            </button>
          </div>
        )}
      </nav>

      {/* 3. HERO SECTION */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-r from-[#faf8f5] via-[#f7f5f0] to-[#f2efe9] border-b border-slate-200">
        {/* Desktop Background Image (India Gate with convoy and IAF tricolor smoke) */}
        <div
          className="hidden lg:block absolute right-0 top-0 bottom-0 w-7/12 bg-no-repeat bg-cover bg-center pointer-events-none mix-blend-multiply opacity-95"
          style={{ backgroundImage: `url('/hero_desktop_gate.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f5] via-[#faf8f5]/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Column: Headlines & Action */}
            <div className="lg:col-span-6 space-y-3 sm:space-y-4">
              {/* Tricolor Tagline Accent */}
              <div className="flex items-center gap-2">
                <div className="flex h-1.5 w-6 rounded-full overflow-hidden shadow-2xs">
                  <div className="w-1/3 bg-[#FF9933]" />
                  <div className="w-1/3 bg-white border border-slate-300" />
                  <div className="w-1/3 bg-[#138808]" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                  A STRONGER INDIA <span className="text-slate-300">|</span> A MORE SECURE TOMORROW
                </span>
              </div>

              {/* Main Headline */}
              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-slate-950 leading-[1.08]">
                  MILITARY ASSET <br />
                  <span className="text-[#123824]">MANAGEMENT </span>
                  <span className="text-[#d97706]">SYSTEM</span>
                </h1>
                {/* Spaced Sub-tagline */}
                <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs font-bold tracking-[0.22em] text-slate-500 uppercase">
                  TRACK &nbsp;|&nbsp; MANAGE &nbsp;|&nbsp; OPTIMISE &nbsp;|&nbsp; SECURE
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                A centralized defence logistics platform to manage the movement, custody assignment and operational expenditure 
                of critical military assets across all bases, ensuring transparency, accountability and operational readiness.
              </p>

              {/* Desktop Action Buttons */}
              <div className="hidden lg:flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setShowLoginModal(true);
                  }}
                  className="flex items-center gap-2 bg-[#123824] hover:bg-[#0c2718] text-white px-6 py-3 rounded-full text-xs font-bold tracking-wide shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login to MAMS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href="#features"
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-6 py-3 rounded-full text-xs font-bold tracking-wide shadow-2xs transition cursor-pointer"
                >
                  <span>Explore System</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Desktop Center Pillar: 4 Floating Operational Badges */}
            <div className="hidden xl:flex xl:col-span-3 flex-col justify-center space-y-3.5 pl-6 border-l border-slate-200/90 py-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-900 leading-tight">
                    Secure Operations
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">Encrypted & Audited</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-900 leading-tight">
                    Real-Time Visibility
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">Instant Inventory State</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Share2 className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-900 leading-tight">
                    Nationwide Integration
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">Cross-Base Movement</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-900 leading-tight">
                    Audit Ready & Transparent
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">Tamper-Proof History</div>
                </div>
              </div>
            </div>

            {/* Desktop Right Column: Prestigious National Quote Box */}
            <div className="hidden lg:flex lg:col-span-3 justify-end">
              <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-md max-w-xs text-center space-y-2">
                <blockquote className="font-quote text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  “राष्ट्र की सुरक्षा <br /> हमारी सर्वोच्च प्राथमिकता है”
                </blockquote>
                <div className="font-quote italic text-xs text-slate-600">
                  “National Security <br /> is our highest priority”
                </div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  — Government of India
                </div>
                <div className="flex h-0.5 w-12 rounded-full overflow-hidden mx-auto mt-1">
                  <div className="w-1/2 bg-[#FF9933]" />
                  <div className="w-1/2 bg-[#138808]" />
                </div>
              </div>
            </div>

            {/* Mobile View: Quote & India Gate Banner & Buttons */}
            <div className="lg:hidden space-y-3">
              {/* Quote on Mobile */}
              <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-1">
                <div className="font-quote text-xs font-bold text-slate-900 leading-snug">
                  “राष्ट्र की सुरक्षा हमारी सर्वोच्च प्राथमिकता है”
                </div>
                <div className="font-quote italic text-[11px] text-slate-600">
                  “National Security is our highest priority”
                </div>
                <div className="text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider">
                  — Government of India
                </div>
              </div>

              {/* India Gate Image Banner on Mobile */}
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 h-44 sm:h-52 w-full">
                <img
                  src="/hero_desktop_gate.jpg"
                  alt="Military Parade India Gate"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Stacked Action Buttons on Mobile */}
              <div className="pt-2 flex flex-col gap-2.5 w-full">
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setShowLoginModal(true);
                  }}
                  className="w-full py-3 bg-[#123824] hover:bg-[#0c2718] text-white rounded-full text-xs font-bold shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login to MAMS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setShowLoginModal(true);
                  }}
                  className="w-full py-3 bg-white text-slate-800 border border-slate-200 rounded-full text-xs font-bold shadow-xs flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
                  <span>Select Role Portal</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Mobile KPI Strip (Compact, clean, responsive) */}
              <div className="grid grid-cols-4 gap-2 bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs mt-3">
                <div className="text-center">
                  <Building2 className="w-4 h-4 mx-auto text-emerald-700" />
                  <div className="text-sm font-black text-slate-900 mt-1">50+</div>
                  <div className="text-[9px] font-semibold text-slate-500 uppercase leading-tight mt-0.5">Military Bases</div>
                </div>
                <div className="text-center border-l border-slate-100">
                  <Layers className="w-4 h-4 mx-auto text-blue-700" />
                  <div className="text-sm font-black text-slate-900 mt-1">10+</div>
                  <div className="text-[9px] font-semibold text-slate-500 uppercase leading-tight mt-0.5">Asset Categories</div>
                </div>
                <div className="text-center border-l border-slate-100">
                  <ShieldCheck className="w-4 h-4 mx-auto text-emerald-700" />
                  <div className="text-sm font-black text-slate-900 mt-1">24/7</div>
                  <div className="text-[9px] font-semibold text-slate-500 uppercase leading-tight mt-0.5">Readiness</div>
                </div>
                <div className="text-center border-l border-slate-100">
                  <BarChart3 className="w-4 h-4 mx-auto text-blue-700" />
                  <div className="text-sm font-black text-slate-900 mt-1">100%</div>
                  <div className="text-[9px] font-semibold text-slate-500 uppercase leading-tight mt-0.5">Audited</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY CAPABILITIES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8 w-full">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-1.5 w-6 rounded-full overflow-hidden shadow-2xs">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-white border border-slate-300" />
            <div className="w-1/3 bg-[#138808]" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-600 uppercase">
            KEY CAPABILITIES
          </span>
        </div>

        {/* Desktop View: 4 Split Cards with real photographic thumbnail on left */}
        <div className="hidden lg:grid grid-cols-4 gap-4">
          {/* Card 1: Asset Tracking */}
          <div
            onClick={() => handleSelectRole('LOGISTICS_OFFICER')}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-200 flex overflow-hidden cursor-pointer group"
          >
            <div className="w-20 shrink-0 bg-slate-100 overflow-hidden">
              <img
                src="/thumb_tank.jpg"
                alt="Tank"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 border border-slate-200 rounded-full px-1.5 py-0.2">
                    01
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-[#123824] group-hover:text-white text-slate-400 flex items-center justify-center transition text-xs">
                    →
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Box className="w-4 h-4 text-emerald-700 shrink-0" />
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition">
                    Asset Tracking
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-3">
                  Real-time tracking of opening balances, closing balances and net movements across all bases.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Inter-Base Transfers */}
          <div
            onClick={() => handleSelectRole('LOGISTICS_OFFICER')}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-200 flex overflow-hidden cursor-pointer group"
          >
            <div className="w-20 shrink-0 bg-slate-100 overflow-hidden">
              <img
                src="/thumb_chopper.jpg"
                alt="Helicopter"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 border border-slate-200 rounded-full px-1.5 py-0.2">
                    02
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-[#123824] group-hover:text-white text-slate-400 flex items-center justify-center transition text-xs">
                    →
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowLeftRight className="w-4 h-4 text-blue-700 shrink-0" />
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-700 transition">
                    Inter-Base Transfers
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-3">
                  Seamless transfer of assets between bases with complete history and audit trail.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Assignments & Expenditures */}
          <div
            onClick={() => handleSelectRole('BASE_COMMANDER', 'north')}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-200 flex overflow-hidden cursor-pointer group"
          >
            <div className="w-20 shrink-0 bg-slate-100 overflow-hidden">
              <img
                src="/thumb_soldier.jpg"
                alt="Soldier"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 border border-slate-200 rounded-full px-1.5 py-0.2">
                    03
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-[#123824] group-hover:text-white text-slate-400 flex items-center justify-center transition text-xs">
                    →
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-4 h-4 text-amber-700 shrink-0" />
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-amber-700 transition">
                    Assignments & Expenditures
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-3">
                  Assign assets to personnel and track consumed/expended assets with full control.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Role-Based Access Control */}
          <div
            onClick={() => handleSelectRole('ADMIN')}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-200 flex overflow-hidden cursor-pointer group"
          >
            <div className="w-20 shrink-0 bg-slate-100 overflow-hidden">
              <img
                src="/thumb_uniform.jpg"
                alt="Uniform"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 border border-slate-200 rounded-full px-1.5 py-0.2">
                    04
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-[#123824] group-hover:text-white text-slate-400 flex items-center justify-center transition text-xs">
                    →
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-700 transition">
                    Role-Based Access Control
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-3">
                  Secure and segregated access for Admin, Base Commanders and Logistics Officers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View: 2x2 Grid (Exact match to media_1790317822673.jpg) */}
        <div className="lg:hidden grid grid-cols-2 gap-2.5">
          {/* Card 1 */}
          <div
            onClick={() => handleSelectRole('LOGISTICS_OFFICER')}
            className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between cursor-pointer active:scale-98"
          >
            <div>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                <Box className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs leading-tight">
                Asset Tracking
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                Real-time tracking of opening balances, closing balances and net movements.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px]">
                →
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => handleSelectRole('LOGISTICS_OFFICER')}
            className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between cursor-pointer active:scale-98"
          >
            <div>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs leading-tight">
                Inter-Base Transfers
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                Seamless transfer of assets between bases with complete history and audit trail.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px]">
                →
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => handleSelectRole('BASE_COMMANDER', 'north')}
            className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between cursor-pointer active:scale-98"
          >
            <div>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs leading-tight">
                Assignments & Expenditures
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                Assign assets to personnel and track consumed/expended assets with full control.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px]">
                →
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => handleSelectRole('ADMIN')}
            className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between cursor-pointer active:scale-98"
          >
            <div>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs leading-tight">
                Role-Based Access Control
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                Secure and segregated access for Admin, Base Commanders and Logistics Officers.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px]">
                →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEDICATED ROLE-BASED PORTALS ACCESS SECTION (Matches exact official design) */}
      <section id="roles" className="relative py-16 sm:py-20 px-4 sm:px-8 md:px-12 w-full overflow-hidden bg-[#faf9f6]/70 border-y border-slate-200/60">
        {/* Background Ambient Silhouettes */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-48 sm:w-64 opacity-[0.06] pointer-events-none select-none">
          <img src="/bg_dome_watermark.png" alt="" className="w-full h-auto object-contain" />
        </div>
        <div className="absolute right-4 top-12 w-56 sm:w-72 opacity-[0.08] pointer-events-none select-none">
          <img src="/bg_fighter_jets.png" alt="" className="w-full h-auto object-contain" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            {/* Top Tagline with Mini Tricolor Flag */}
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="flex h-1.5 w-6 rounded-full overflow-hidden shadow-2xs">
                <div className="w-1/3 bg-[#FF9933]" />
                <div className="w-1/3 bg-white border border-slate-300" />
                <div className="w-1/3 bg-[#138808]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 tracking-[0.2em] uppercase">
                AUTHENTICATED ACCESS PORTALS
              </span>
            </div>

            {/* Main Heading with Symmetrical Saffron-Green Lines */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 my-2">
              <div className="hidden sm:block w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-[#FF9933] to-[#138808] rounded-full" />
              <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-slate-950 tracking-tight text-center leading-tight">
                Choose Your <span className="text-[#c25e00]">Operational Role</span>
              </h2>
              <div className="hidden sm:block w-12 sm:w-16 h-0.5 bg-gradient-to-r from-[#FF9933] via-[#138808] to-transparent rounded-full" />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
              Access role-based portals with secure, streamlined and mission-ready tools designed for defence asset management and logistics operations.
            </p>
          </div>

          {/* 3 Role Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch pt-2">
            
            {/* CARD 1: SYSTEM ADMINISTRATOR */}
            <div className="group relative rounded-[28px] bg-gradient-to-b from-[#f0f4f9] via-[#edf2f7] to-[#e8edf4] border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden p-6 sm:p-7">
              {/* Top-Right Background Artwork: Rashtrapati Bhavan & Indian Flag */}
              <div className="absolute top-0 right-0 w-44 sm:w-48 h-38 pointer-events-none overflow-hidden select-none z-0">
                <img 
                  src="/card_admin_art.png" 
                  alt="Strategic Command HQ" 
                  className="w-full h-full object-contain object-top-right opacity-90 transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
              
              {/* Card Content Top */}
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#1e2a3a] text-white flex items-center justify-center shadow-md">
                    <Award className="w-5 h-5 text-indigo-200" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full bg-blue-100/90 text-blue-900 border border-blue-200/80 shadow-2xs">
                    GLOBAL JURISDICTION
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    System Administrator
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Headquarters Strategic Command
                  </p>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed mt-3 min-h-[44px]">
                    Full nationwide visibility, user & base provisioning, and complete audit oversight across all defence assets.
                  </p>
                </div>

                {/* Features List Box */}
                <div className="bg-white/85 backdrop-blur-xs rounded-xl border border-slate-200/80 p-3.5 mt-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 font-medium">
                    <BarChart2 className="w-4 h-4 text-slate-700 shrink-0" />
                    <span>Full nationwide data visibility & all bases</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 font-medium">
                    <Users className="w-4 h-4 text-slate-700 shrink-0" />
                    <span>Master user & base provisioning</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 font-medium">
                    <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
                    <span>Immutable audit log inspection</span>
                  </div>
                </div>

                {/* Credentials Box */}
                <div className="bg-[#edf2f7]/90 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-3 mt-3 relative overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-[#27384a] text-white flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-slate-200" />
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 leading-tight">
                    <div><span className="text-slate-400">User:</span> &nbsp;admin@forces.gov</div>
                    <div className="mt-0.5"><span className="text-slate-400">Pass:</span> &nbsp;Admin@123</div>
                  </div>
                  <img src="/emblem.png" alt="" className="absolute -right-2 -bottom-2 w-14 h-14 opacity-10 pointer-events-none" />
                </div>
              </div>

              {/* Bottom Button */}
              <div className="relative z-10 mt-5 pt-1">
                <button
                  onClick={() => handleSelectRole('ADMIN')}
                  className="w-full py-3 px-6 bg-[#101b2b] hover:bg-[#1a2c42] text-white rounded-full font-bold text-xs shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Launch Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CARD 2: BASE COMMANDER (PRIMARY FIELD ROLE) */}
            <div className="group relative rounded-[28px] bg-gradient-to-b from-[#fdfbf7] via-[#fbf8f1] to-[#f7f2e7] border-2 border-[#f59e0b] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-visible p-6 sm:p-7">
              {/* Overhanging Badge at Top Center */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#d97706] text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-md z-20">
                PRIMARY FIELD ROLE
              </div>

              {/* Top-Right Background Artwork: Mountain, Combat Vehicle, Soldiers, Flag */}
              <div className="absolute top-0 right-0 w-44 sm:w-48 h-38 pointer-events-none overflow-hidden select-none z-0">
                <img 
                  src="/card_cmdr_art.png" 
                  alt="Field Command" 
                  className="w-full h-full object-contain object-top-right opacity-90 transition-transform duration-500 group-hover:scale-105" 
                />
              </div>

              {/* Card Content Top */}
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#5b4018] text-white flex items-center justify-center shadow-md">
                    <Shield className="w-5 h-5 text-amber-200" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#faebd7]/95 text-[#92400e] border border-amber-200/80 shadow-2xs">
                    BASE-SCOPED ACCESS
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    Base Commander
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Camp North & Camp South Command
                  </p>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed mt-3 min-h-[44px]">
                    Approve transfers, assign equipment, manage expenditures and maintain operational readiness for your base.
                  </p>
                </div>

                {/* Features List Box */}
                <div className="bg-[#fbf7f0]/95 backdrop-blur-xs rounded-xl border border-amber-200/70 p-3.5 mt-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 font-medium">
                    <ArrowLeftRight className="w-4 h-4 text-[#854d0e] shrink-0" />
                    <span>Approve & reject inter-base transfers</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 font-medium">
                    <Users className="w-4 h-4 text-[#854d0e] shrink-0" />
                    <span>Assign equipment to soldier service badges</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 font-medium">
                    <FileText className="w-4 h-4 text-[#854d0e] shrink-0" />
                    <span>Record expended ammunition & training costs</span>
                  </div>
                </div>

                {/* Credentials Box */}
                <div className="bg-[#f8f3ea]/90 rounded-xl p-2.5 border border-amber-200/70 flex items-center gap-3 mt-3 relative overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-[#6d4c1b] text-amber-200 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="font-mono text-[10.5px] text-slate-700 leading-tight">
                    <div><span className="text-slate-400">Cmdr North:</span> &nbsp;cmdr.north@forces.gov</div>
                    <div className="mt-0.5"><span className="text-slate-400">Cmdr South:</span> &nbsp;cmdr.south@forces.gov</div>
                  </div>
                  <img src="/emblem.png" alt="" className="absolute -right-2 -bottom-2 w-14 h-14 opacity-10 pointer-events-none" />
                </div>
              </div>

              {/* Bottom Buttons: Two Buttons for Camp North and Camp South */}
              <div className="relative z-10 mt-5 space-y-2 pt-1">
                <button
                  onClick={() => handleSelectRole('BASE_COMMANDER', 'north')}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#c26200] via-[#b45309] to-[#92400e] hover:brightness-105 text-white rounded-full font-bold text-xs shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Launch Camp North Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleSelectRole('BASE_COMMANDER', 'south')}
                  className="w-full py-2.5 px-6 bg-[#fcfaf7] hover:bg-white text-[#92400e] border border-amber-300 rounded-full font-bold text-xs shadow-2xs transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Launch Camp South Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CARD 3: LOGISTICS OFFICER */}
            <div className="group relative rounded-[28px] bg-gradient-to-b from-[#f2f7f3] via-[#ecf4ee] to-[#e4ede7] border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden p-6 sm:p-7">
              {/* Top-Right Background Artwork: Mountain & Supply Truck Convoy */}
              <div className="absolute top-0 right-0 w-44 sm:w-48 h-38 pointer-events-none overflow-hidden select-none z-0">
                <img 
                  src="/card_logistics_art.png" 
                  alt="Supply Convoy" 
                  className="w-full h-full object-contain object-top-right opacity-90 transition-transform duration-500 group-hover:scale-105" 
                />
              </div>

              {/* Card Content Top */}
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#163a26] text-white flex items-center justify-center shadow-md">
                    <Truck className="w-5 h-5 text-emerald-200" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-200/80 shadow-2xs">
                    SUPPLY & MOVEMENTS
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    Logistics Officer
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Army Ordnance & Supply Corps
                  </p>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed mt-3 min-h-[44px]">
                    Record purchases, initiate transfers and execute transport deliveries between military bases.
                  </p>
                </div>

                {/* Features List Box */}
                <div className="bg-white/85 backdrop-blur-xs rounded-xl border border-emerald-200/70 p-3.5 mt-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 font-medium">
                    <ShoppingCart className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>Record new asset & munition purchases</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 font-medium">
                    <ArrowLeftRight className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>Initiate transfers between military bases</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 font-medium">
                    <Box className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>Execute completed transport deliveries</span>
                  </div>
                </div>

                {/* Credentials Box */}
                <div className="bg-[#ecf4ee]/90 rounded-xl p-2.5 border border-emerald-200/70 flex items-center gap-3 mt-3 relative overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-[#1a442c] text-emerald-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 leading-tight">
                    <div><span className="text-slate-400">User:</span> &nbsp;logistics@forces.gov</div>
                    <div className="mt-0.5"><span className="text-slate-400">Pass:</span> &nbsp;Logistics@123</div>
                  </div>
                  <img src="/emblem.png" alt="" className="absolute -right-2 -bottom-2 w-14 h-14 opacity-10 pointer-events-none" />
                </div>
              </div>

              {/* Bottom Button */}
              <div className="relative z-10 mt-5 pt-1">
                <button
                  onClick={() => handleSelectRole('LOGISTICS_OFFICER')}
                  className="w-full py-3 px-6 bg-[#123824] hover:bg-[#0c2718] text-white rounded-full font-bold text-xs shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Launch Logistics Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CORE MATHEMATICAL LOGIC & INVENTORY LEDGER FORMULA */}
      <section id="logic" className="bg-slate-900 text-white py-14 px-4 sm:px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-950/80 border border-amber-800/80 px-3 py-1 rounded-full">
              AUDIT-PROOF ACCOUNTING
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              The Military Asset Balance Equation
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              How MAMS guarantees absolute inventory accountability across periods, bases, and asset classifications.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center items-center">
              {/* Box 1: Opening */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700">
                <div className="text-xs text-slate-400 uppercase font-semibold">Opening Balance</div>
                <div className="text-lg font-bold text-white mt-1">Starting Stock</div>
                <div className="text-[11px] text-slate-500 mt-1">Baseline inventory at period start</div>
              </div>

              <div className="text-xl font-black text-amber-400">+</div>

              {/* Box 2: Net Movement */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60">
                <div className="text-xs text-amber-400 uppercase font-semibold">Net Movement</div>
                <div className="text-lg font-bold text-amber-300 mt-1">Purchases + Transfers</div>
                <div className="text-[11px] text-amber-200/70 mt-1">(Purchases + In) − Transfers Out</div>
              </div>

              <div className="text-xl font-black text-amber-400">=</div>

              {/* Box 3: Closing */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/60">
                <div className="text-xs text-emerald-400 uppercase font-semibold">Closing Balance</div>
                <div className="text-lg font-bold text-emerald-300 mt-1">Current On-Hand</div>
                <div className="text-[11px] text-emerald-200/70 mt-1">Live physical stock at each base</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">Active Custody (Assigned)</div>
                  <div className="text-slate-400 text-[11px]">Tracked separately by personnel badge number without deducting base inventory.</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                <div className="h-8 w-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">Operational Expenditure (Expended)</div>
                  <div className="text-slate-400 text-[11px]">Munitions and consumables expended in drills or defense actions permanently recorded.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. STRATEGIC BASES NETWORK */}
      <section id="bases" className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-14 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            NETWORK TOPOLOGY
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Multi-Base Command Deployment
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Interconnected military bases operating on atomic ledger transfers to prevent supply chain discrepancies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dbBases.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              No command bases registered in database yet.
            </div>
          ) : (
            dbBases.map((b, idx) => {
              const colors = [
                { bg: 'bg-amber-100', text: 'text-amber-800' },
                { bg: 'bg-blue-100', text: 'text-blue-800' },
                { bg: 'bg-indigo-100', text: 'text-indigo-800' },
                { bg: 'bg-purple-100', text: 'text-purple-800' },
              ];
              const color = colors[idx % colors.length];
              const initials = b.name
                .split(' ')
                .map((w: string) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div key={b.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <div className={`h-10 w-10 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center font-bold text-xs mb-3`}>
                    {initials}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                  <p className="text-xs text-slate-500">{b.location || 'Operational Base'}</p>
                  <div className="mt-3 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full inline-block">
                    ● Active Command Base
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 8. OUR MISSION & NATIONWIDE OPERATIONAL COVERAGE (Exact Match to Mockups) */}
      <section id="mission" className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-10 sm:py-14 w-full">
        {/* DESKTOP VIEW: Dark Forest Green Unified Banner (media_1790317591270.png) */}
        <div className="hidden lg:block bg-[#0a1811] text-white rounded-3xl p-8 lg:p-10 border border-emerald-950/80 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-12 gap-8 items-center relative z-10">
            {/* Left: Mission Statement (Col 1-4) */}
            <div className="col-span-4 space-y-3.5 pr-4 border-r border-emerald-900/50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  OUR MISSION
                </span>
                <div className="h-0.5 w-8 bg-amber-400 rounded-full" />
              </div>

              <h2 className="font-serif text-xl lg:text-2xl font-bold text-white leading-tight">
                Enabling efficient logistics for a stronger and self-reliant India.
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                To provide a secure, transparent and accountable system for managing critical military assets, supporting operational readiness across all bases.
              </p>
            </div>

            {/* Center: 4 Key Metrics (Col 5-8) */}
            <div className="col-span-5 grid grid-cols-2 gap-y-6 gap-x-4 px-4 border-r border-emerald-900/50">
              {/* Metric 1 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-black text-white leading-tight">50+</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">Military Bases</div>
                  <div className="text-[10px] text-slate-400">Nationwide Coverage</div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-900/40 text-blue-400 border border-blue-800/50 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-black text-white leading-tight">10+</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">Asset Categories</div>
                  <div className="text-[10px] text-slate-400">Weapons, Vehicles & Munitions</div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-900/40 text-amber-400 border border-amber-800/50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-black text-white leading-tight">24/7</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">Operational Readiness</div>
                  <div className="text-[10px] text-slate-400">Real-time Monitoring</div>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-black text-white leading-tight">100%</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">Audited & Secure</div>
                  <div className="text-[10px] text-slate-400">Data Integrity & Ledger</div>
                </div>
              </div>
            </div>

            {/* Right: Glowing India Network Map (Col 9-12) */}
            <div className="col-span-3 pl-4 flex flex-col justify-between space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-900/60 shadow-inner bg-[#0d2218] p-2 text-center">
                <img
                  src="/map_network.jpg"
                  alt="India Defense Network Map"
                  className="w-full h-24 object-contain mx-auto opacity-90 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    NATIONWIDE
                  </div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-400">
                    OPERATIONAL COVERAGE
                  </div>
                </div>

                <a
                  href="#bases"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-700 hover:border-emerald-500 bg-slate-900/60 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer"
                >
                  <span>View Base Network</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE VIEW: Multi-Card Stack (Exact match to media_1790317822673.jpg screen 2) */}
        <div className="lg:hidden space-y-4">
          {/* Mobile Card 1: Our Mission with Mountain Soldier photo */}
          <div className="bg-[#0a1811] text-white rounded-2xl p-4 border border-emerald-950/80 shadow-md relative overflow-hidden flex items-center justify-between">
            <div className="space-y-2 max-w-[65%] z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  OUR MISSION
                </span>
                <div className="h-0.5 w-6 bg-amber-400 rounded-full" />
              </div>
              <h2 className="font-serif text-sm font-bold text-white leading-tight">
                Enabling efficient logistics for a stronger and self-reliant India.
              </h2>
              <p className="text-[10px] text-slate-300 leading-snug">
                To provide a secure, transparent and accountable system for managing critical military assets.
              </p>
            </div>
            <div className="w-24 h-28 shrink-0 rounded-xl overflow-hidden border border-emerald-900/40">
              <img
                src="/mission_soldier.jpg"
                alt="Soldier facing mountains"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Mobile Card 2: Nationwide Operational Coverage Card with glowing map */}
          <div className="bg-[#0a1811] text-white rounded-2xl p-4 border border-emerald-950/80 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-1.5 w-6 rounded-full overflow-hidden">
                <div className="w-1/3 bg-[#FF9933]" />
                <div className="w-1/3 bg-white" />
                <div className="w-1/3 bg-[#138808]" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">
                NATIONWIDE OPERATIONAL COVERAGE
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-28 h-20 rounded-xl bg-[#0e2419] p-1 border border-emerald-900/50 shrink-0">
                <img
                  src="/map_network.jpg"
                  alt="India Base Map"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-sm font-black text-white leading-tight">50+</div>
                    <div className="text-[10px] text-slate-300">Military Bases</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">Pan-India</div>
                    <div className="text-[10px] text-slate-300">Coverage Network</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Card 3: Trust | Security | Accountability Strip */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-1.5 w-6 rounded-full overflow-hidden">
                <div className="w-1/3 bg-[#FF9933]" />
                <div className="w-1/3 bg-white border border-slate-300" />
                <div className="w-1/3 bg-[#138808]" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-slate-700 uppercase">
                TRUST &nbsp;|&nbsp; SECURITY &nbsp;|&nbsp; ACCOUNTABILITY
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-[9px] font-bold text-slate-800 leading-tight">Secure Operations</div>
              </div>

              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-[9px] font-bold text-slate-800 leading-tight">Real-time Visibility</div>
              </div>

              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
                  <Share2 className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-[9px] font-bold text-slate-800 leading-tight">Multi-Base Integration</div>
              </div>

              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-[9px] font-bold text-slate-800 leading-tight">Audit Ready & Transparent</div>
              </div>
            </div>
          </div>

          {/* Mobile Card 4: Modern Logistics Banner */}
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 h-28 sm:h-32 w-full">
            <img
              src="/banner_convoy.jpg"
              alt="Military Convoy Mountain Banner"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-end p-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-slate-950/80 border border-slate-700/80 px-3 py-1 rounded-full backdrop-blur-xs">
                MODERN LOGISTICS FOR A SAFER NATION
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. OFFICIAL FOOTER */}
      <footer className="mt-auto bg-[#1b251e] text-slate-300 text-xs border-t border-slate-800 py-8 px-4 sm:px-8 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img src="/emblem.png" alt="Emblem" className="h-8 w-auto brightness-0 invert opacity-80" />
            <div>
              <p className="font-bold text-white tracking-wide">MILITARY ASSET MANAGEMENT SYSTEM (MAMS)</p>
              <p className="text-[11px] text-slate-400">Department of Defence Production | Ministry of Defence | Government of India</p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Designed for secure multi-base operational logistics & accountability.
          </div>
        </div>
      </footer>

      {/* 11. DYNAMIC TWO-STAGE AUTHENTICATION MODAL (Choose Role -> In-Place Role Login Form) */}
      {showLoginModal && (
        <div 
          onClick={() => {
            setShowLoginModal(false);
            setSelectedRole(null);
          }}
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 cursor-pointer overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#fafaf9] border border-slate-200/90 rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 max-w-2xl sm:max-w-3xl w-full shadow-2xl relative transition-all cursor-default overflow-hidden my-auto"
          >
            {/* Circular Close Button at Top Right */}
            <button
              onClick={() => {
                setShowLoginModal(false);
                setSelectedRole(null);
              }}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors shadow-xs cursor-pointer z-30"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* STAGE 1: ROLE SELECTION (Exact match to uploaded reference mockup) */}
            {!selectedRole ? (
              <div className="relative">
                {/* Top Ministry Header */}
                <div className="text-center">
                  <img
                    src="/emblem.png"
                    alt="National Emblem of India"
                    className="h-11 sm:h-12 w-auto object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="mt-1 space-y-0.5">
                    <div className="text-[12px] font-bold text-slate-800 tracking-wide leading-tight">
                      रक्षा मंत्रालय
                    </div>
                    <div className="text-[13px] font-black text-slate-900 tracking-wider uppercase leading-tight font-cinzel">
                      MINISTRY OF DEFENCE
                    </div>
                    <div className="text-[9.5px] font-semibold text-slate-500 tracking-widest uppercase">
                      GOVERNMENT OF INDIA
                    </div>
                  </div>

                  {/* Tricolor Accent Mini Bar */}
                  <div className="flex h-1 w-14 rounded-full overflow-hidden mx-auto my-2 shadow-2xs">
                    <div className="w-1/3 bg-[#FF9933]" />
                    <div className="w-1/3 bg-white border-y border-slate-200" />
                    <div className="w-1/3 bg-[#138808]" />
                  </div>

                  {/* System Subtitle */}
                  <div className="text-[10px] font-bold text-slate-400 tracking-[0.22em] uppercase">
                    MILITARY ASSET MANAGEMENT SYSTEM
                  </div>

                  {/* Headline */}
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Select Your Operational Role
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-snug">
                    Choose your credentialed role to access the appropriate portal and functionalities.
                  </p>
                </div>

                {/* The 3 Role Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 mt-5 relative z-10">
                  {/* Card 1: System Administrator */}
                  <div
                    onClick={() => handleSelectRole('ADMIN')}
                    className="group rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col text-left cursor-pointer"
                  >
                    <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-100">
                      <img
                        src="/role_admin.jpg"
                        alt="System Administrator"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="-mt-5 mx-auto relative z-10 w-10 h-10 rounded-full bg-[#1e2a1b] border-2 border-white shadow-md flex items-center justify-center text-amber-400">
                      <Award className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="px-3.5 pt-1.5 pb-3.5 text-center flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                          System Administrator
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          HQ Directorate General
                        </p>
                        <p className="text-[11px] text-slate-600 leading-snug mt-1.5 min-h-[30px]">
                          Full nationwide access & audit logs
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 pt-3 mt-auto justify-start px-1">
                        <div className="w-7 h-7 rounded-full bg-[#354032] group-hover:bg-[#1a2318] text-white flex items-center justify-center text-xs transition shadow-xs">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                        <div className="h-1 w-12 rounded-full bg-[#9e7d3b]" />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Base Commander */}
                  <div
                    onClick={() => handleSelectRole('BASE_COMMANDER', 'north')}
                    className="group rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col text-left cursor-pointer"
                  >
                    <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-100">
                      <img
                        src="/role_cmdr.jpg"
                        alt="Base Commander"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="-mt-5 mx-auto relative z-10 w-10 h-10 rounded-full bg-[#273a26] border-2 border-white shadow-md flex items-center justify-center text-emerald-300">
                      <ShieldAlert className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div className="px-3.5 pt-1.5 pb-3.5 text-center flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                          Base Commander
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          Camp North / Camp South
                        </p>
                        <p className="text-[11px] text-slate-600 leading-snug mt-1.5 min-h-[30px]">
                          Transfer approvals & custody management
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 pt-3 mt-auto justify-start px-1">
                        <div className="w-7 h-7 rounded-full bg-[#415542] group-hover:bg-[#253626] text-white flex items-center justify-center text-xs transition shadow-xs">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                        <div className="h-1 w-12 rounded-full bg-[#5d735e]" />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Logistics Officer */}
                  <div
                    onClick={() => handleSelectRole('LOGISTICS_OFFICER')}
                    className="group rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col text-left cursor-pointer"
                  >
                    <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-100">
                      <img
                        src="/role_logistics.jpg"
                        alt="Logistics Officer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="-mt-5 mx-auto relative z-10 w-10 h-10 rounded-full bg-[#4f3d27] border-2 border-white shadow-md flex items-center justify-center text-amber-200">
                      <Truck className="w-5 h-5 text-amber-200" />
                    </div>
                    <div className="px-3.5 pt-1.5 pb-3.5 text-center flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                          Logistics Officer
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          Ordnance Corps
                        </p>
                        <p className="text-[11px] text-slate-600 leading-snug mt-1.5 min-h-[30px]">
                          Record purchases & asset transfers
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 pt-3 mt-auto justify-start px-1">
                        <div className="w-7 h-7 rounded-full bg-[#6d5940] group-hover:bg-[#453624] text-white flex items-center justify-center text-xs transition shadow-xs">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                        <div className="h-1 w-12 rounded-full bg-[#aa8a5a]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Security Pill */}
                <div className="text-center mt-5 relative z-10">
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-700 bg-white/95 border border-slate-200 px-4 py-1.5 rounded-full shadow-xs backdrop-blur-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Secure Access</span>
                    <span className="text-slate-300 font-light">|</span>
                    <span>Role-Based Permissions</span>
                    <span className="text-slate-300 font-light">|</span>
                    <span>Audited Operations</span>
                  </span>
                </div>

                {/* Troops Silhouette Pinned at Bottom of Modal */}
                <div className="relative mt-2 -mb-5 -mx-5 sm:-mx-7 overflow-hidden pointer-events-none opacity-85">
                  <img
                    src="/modal_silhouette.png"
                    alt="Military silhouette"
                    className="w-full h-14 sm:h-16 object-cover object-top"
                  />
                </div>
              </div>
            ) : (
              /* STAGE 2: IN-MODAL ROLE LOGIN FORM */
              <div className="space-y-4 relative">
                {/* Back to Role Selection Button */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <button
                    onClick={() => {
                      setSelectedRole(null);
                      setError(null);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>← Back to Role Selection</span>
                  </button>

                  <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {selectedRole === 'ADMIN' ? 'HQ Clearance' : selectedRole === 'BASE_COMMANDER' ? 'Base Clearance' : 'Ordnance Clearance'}
                  </span>
                </div>

                {/* Role Header Banner */}
                <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-300 shadow-xs">
                    <img
                      src={
                        selectedRole === 'ADMIN'
                          ? '/role_admin.jpg'
                          : selectedRole === 'BASE_COMMANDER'
                          ? '/role_cmdr.jpg'
                          : '/role_logistics.jpg'
                      }
                      alt="Role"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {selectedRole === 'ADMIN' && 'System Administrator Portal'}
                      {selectedRole === 'BASE_COMMANDER' && 'Base Commander Portal'}
                      {selectedRole === 'LOGISTICS_OFFICER' && 'Logistics Officer Portal'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedRole === 'ADMIN' && 'Full nationwide asset control, system ledger and audit logs.'}
                      {selectedRole === 'BASE_COMMANDER' && 'Camp custody control, inter-base transfer approvals & personnel assignments.'}
                      {selectedRole === 'LOGISTICS_OFFICER' && 'Asset procurement recording, stock receipts & transit dispatches.'}
                    </p>
                  </div>
                </div>

                {/* Base Commander Toggle (Camp North vs Camp South) */}
                {selectedRole === 'BASE_COMMANDER' && (
                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      Select Base Jurisdiction:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleCommanderBaseToggle('north')}
                        className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          commanderBase === 'north'
                            ? 'bg-[#123824] text-white shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span>Camp North (Northern Sector)</span>
                        {commanderBase === 'north' && '✓'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCommanderBaseToggle('south')}
                        className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          commanderBase === 'south'
                            ? 'bg-[#123824] text-white shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span>Camp South (Deccan Logistics)</span>
                        {commanderBase === 'south' && '✓'}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {error}
                  </div>
                )}

                {/* In-Modal Credentials Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Personnel ID / Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-full text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123824] focus:border-transparent transition"
                      placeholder="user@forces.gov"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Security Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-300 rounded-full text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123824] focus:border-transparent transition"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Demo Credential Quick Fill Tag */}
                  <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 flex items-center justify-between">
                    <span>
                      Demo credentials: <strong className="text-slate-700">{email}</strong>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Auto-filled
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#123824] hover:bg-[#0c2718] text-white font-bold rounded-full text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {loading
                        ? 'Authenticating...'
                        : `Sign In as ${
                            selectedRole === 'ADMIN'
                              ? 'System Administrator'
                              : selectedRole === 'BASE_COMMANDER'
                              ? `Commander (${commanderBase === 'north' ? 'Camp North' : 'Camp South'})`
                              : 'Logistics Officer'
                          }`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Bottom Troops Silhouette Graphic */}
                <div className="relative mt-2 -mb-5 -mx-5 sm:-mx-7 overflow-hidden pointer-events-none opacity-60">
                  <img
                    src="/modal_silhouette.png"
                    alt="Military silhouette"
                    className="w-full h-10 sm:h-12 object-cover object-top"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
