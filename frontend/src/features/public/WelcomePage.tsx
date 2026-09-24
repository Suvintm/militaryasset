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
  Target, 
  BarChart3, 
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 flex flex-col selection:bg-amber-500 selection:text-white">
      {/* 1. TOP UTILITY BAR (Official Government Header) */}
      <header className="bg-[#f8f9fa] border-b border-slate-200 text-[11px] py-1 px-4 sm:px-8 md:px-12 flex flex-wrap items-center justify-between text-slate-600">
        <div className="flex items-center gap-2">
          {/* Indian Tricolor Flag SVG */}
          <svg className="w-5 h-3.5 shadow-xs rounded-xs" viewBox="0 0 24 16" fill="none">
            <rect width="24" height="5.33" fill="#FF9933" />
            <rect y="5.33" width="24" height="5.34" fill="#FFFFFF" />
            <rect y="10.67" width="24" height="5.33" fill="#138808" />
            <circle cx="12" cy="8" r="2.2" stroke="#000080" strokeWidth="0.5" fill="none" />
            <circle cx="12" cy="8" r="0.6" fill="#000080" />
          </svg>
          <span className="font-semibold tracking-wide text-slate-700">
            GOVERNMENT OF INDIA
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-medium tracking-wide">
            MINISTRY OF DEFENCE
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-slate-500">
          <button className="hover:text-slate-800 transition">Skip to Main Content</button>
          <span>|</span>
          <button className="hover:text-slate-800 transition">Screen Reader Access</button>
          <span>|</span>
          <div className="flex items-center gap-1 font-semibold">
            <button className="px-1 hover:text-slate-800">A-</button>
            <button className="px-1 hover:text-slate-800">A</button>
            <button className="px-1 hover:text-slate-800">A+</button>
          </div>
          <span>|</span>
          <span className="cursor-pointer font-medium hover:text-slate-800">English ▾</span>
        </div>
      </header>

      {/* 2. MAIN NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs px-4 sm:px-8 md:px-12 py-3 flex items-center justify-between">
        {/* Left: Emblem + Titles */}
        <div className="flex items-center gap-3">
          <img
            src="/emblem.png"
            alt="National Emblem of India"
            className="h-12 w-auto object-contain"
            onError={(e) => {
              // fallback if image fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm leading-tight tracking-wide">
              रक्षा मंत्रालय
            </span>
            <span className="font-extrabold text-slate-900 text-sm leading-tight tracking-wider uppercase font-cinzel">
              MINISTRY OF DEFENCE
            </span>
            <span className="text-[10px] text-slate-500 tracking-widest font-medium uppercase">
              GOVERNMENT OF INDIA
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-[13px] font-semibold text-slate-700">
          <a href="#home" className="text-amber-700 font-bold border-b-2 border-amber-600 pb-0.5">
            Home
          </a>
          <a href="#about" className="hover:text-amber-700 transition flex items-center gap-1">
            About <span className="text-[10px]">▾</span>
          </a>
          <a href="#overview" className="hover:text-amber-700 transition">
            System Overview
          </a>
          <a href="#security" className="hover:text-amber-700 transition">
            Security
          </a>
          <a href="#resources" className="hover:text-amber-700 transition">
            Resources
          </a>
          <a href="#contact" className="hover:text-amber-700 transition">
            Contact
          </a>
        </div>

        {/* Right: Search & Action Button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-slate-100 rounded-md px-3 py-1.5 border border-slate-200 text-xs w-44">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none w-full text-slate-700 placeholder-slate-400 text-xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>

          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2 bg-[#123824] hover:bg-[#0c2718] text-white px-4 py-2 rounded text-xs font-semibold tracking-wide shadow-sm transition active:scale-95"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Login to MAMS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#faf8f5] via-[#f7f5f0] to-[#f0eee9] border-b border-slate-200">
        {/* Background Image right side */}
        <div
          className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 bg-no-repeat bg-cover bg-center pointer-events-none opacity-90 mix-blend-multiply"
          style={{ backgroundImage: `url('/hero_bg.jpg')` }}
        >
          {/* Subtle overlay gradient to seamlessly blend background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f5] via-[#faf8f5]/80 lg:via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-12 md:py-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Content */}
          <div className="lg:col-span-8 space-y-4 max-w-2xl">
            {/* Tricolor Tagline Accent */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-1.5 w-6 rounded-full overflow-hidden">
                <div className="w-1/3 bg-[#FF9933]" />
                <div className="w-1/3 bg-white border border-slate-300" />
                <div className="w-1/3 bg-[#138808]" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                A STRONGER INDIA <span className="text-slate-400 font-normal">|</span> A MORE SECURE TOMORROW
              </span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                MILITARY ASSET <br />
                <span className="text-slate-900">MANAGEMENT </span>
                <span className="text-[#d97706]">SYSTEM</span>
              </h1>
              {/* Spaced Sub-tagline */}
              <div className="mt-2 text-xs sm:text-sm font-bold tracking-[0.25em] text-slate-500 uppercase">
                TRACK &nbsp;|&nbsp; MANAGE &nbsp;|&nbsp; OPTIMISE &nbsp;|&nbsp; SECURE
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              A centralized platform to manage the movement, assignment and expenditure of critical
              military assets across all bases, ensuring transparency, accountability and operational readiness.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 bg-[#123824] hover:bg-[#0c2718] text-white px-5 py-2.5 rounded text-xs font-bold tracking-wide shadow-md transition"
              >
                <Lock className="w-4 h-4" />
                <span>Login to MAMS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('features-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-5 py-2.5 rounded text-xs font-bold tracking-wide shadow-xs transition"
              >
                <span>Explore System</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Prestigious National Quote Box */}
          <div className="hidden lg:flex lg:col-span-4 justify-end">
            <div className="bg-white/85 backdrop-blur-xs p-6 rounded-xl border border-slate-200/80 shadow-lg max-w-xs text-center space-y-3">
              <img
                src="/emblem.png"
                alt="Emblem"
                className="h-10 mx-auto opacity-80"
              />
              <blockquote className="font-quote text-base sm:text-lg font-bold text-slate-900 leading-snug">
                “राष्ट्र की सुरक्षा <br /> हमारी सर्वोच्च प्राथमिकता है”
              </blockquote>
              <div className="font-quote italic text-xs sm:text-sm text-slate-600">
                “National Security <br /> is our highest priority”
              </div>
              <div className="w-12 h-0.5 bg-amber-500 mx-auto" />
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                — Government of India
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FLOATING FEATURE CARDS (4 Modules) */}
      <section id="features-section" className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 -mt-6 sm:-mt-8 relative z-20 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Asset Tracking */}
          <div
            onClick={() => setShowLoginModal(true)}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Box className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition">
                  Asset Tracking
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Real-time tracking of opening balances, closing balances and net movements.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <div className="h-6 w-6 rounded-full bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white text-slate-400 flex items-center justify-center transition text-xs">
                →
              </div>
            </div>
          </div>

          {/* Card 2: Inter-Base Transfers */}
          <div
            onClick={() => setShowLoginModal(true)}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-700 transition">
                  Inter-Base Transfers
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Seamless transfer of assets between bases with complete history and audit trail.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <div className="h-6 w-6 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-400 flex items-center justify-center transition text-xs">
                →
              </div>
            </div>
          </div>

          {/* Card 3: Assignments & Expenditures */}
          <div
            onClick={() => setShowLoginModal(true)}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-amber-700 transition">
                  Assignments & Expenditures
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Assign assets to personnel and track expended munitions & equipment.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <div className="h-6 w-6 rounded-full bg-slate-50 group-hover:bg-amber-600 group-hover:text-white text-slate-400 flex items-center justify-center transition text-xs">
                →
              </div>
            </div>
          </div>

          {/* Card 4: Role-Based Access Control */}
          <div
            onClick={() => setShowLoginModal(true)}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-700 transition">
                  Role-Based Access Control
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Secure access for Admin, Base Commanders and Logistics Officers.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <div className="h-6 w-6 rounded-full bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 flex items-center justify-center transition text-xs">
                →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STATS & NATIONWIDE OPERATIONAL COVERAGE BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-10 w-full">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full lg:w-3/4">
            {/* Metric 1 */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">50+</div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Military Bases</div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">10+</div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Asset Categories</div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">24/7</div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operational Readiness</div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">100%</div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Audited & Secure</div>
              </div>
            </div>
          </div>

          {/* Right: India Map & Coverage Label */}
          <div className="flex items-center gap-4 lg:border-l lg:border-slate-200 lg:pl-8 shrink-0">
            {/* India Map Outline SVG */}
            <svg className="w-12 h-14 text-slate-400 stroke-current fill-none stroke-[1.2]" viewBox="0 0 100 120">
              <path d="M48,10 C52,14 58,12 60,18 C64,22 62,28 66,32 C72,36 82,34 85,42 C82,46 76,46 74,52 C70,58 74,66 68,72 C62,80 58,92 50,110 C46,98 40,82 34,70 C28,62 18,58 20,48 C22,40 32,38 36,32 C38,24 44,14 48,10 Z" />
              <circle cx="50" cy="35" r="2.5" fill="#d97706" />
              <circle cx="42" cy="55" r="2" fill="#123824" />
              <circle cx="62" cy="65" r="2" fill="#123824" />
              <circle cx="48" cy="85" r="2" fill="#123824" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                NATIONWIDE
              </div>
              <div className="text-xs font-extrabold text-slate-800 tracking-wider uppercase">
                OPERATIONAL COVERAGE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM MISSION & STRATEGIC VALUES SECTION (3 Columns) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 pb-14 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-xl overflow-hidden shadow-lg border border-slate-200">
          {/* Col 1: Mission (Dark Forest Green) */}
          <div className="lg:col-span-5 bg-[#0f2e1d] text-white p-8 flex flex-col justify-center space-y-4">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
              OUR MISSION
            </span>
            <h2 className="font-serif text-2xl font-bold text-white leading-tight">
              Enabling efficient logistics for a stronger and self-reliant India.
            </h2>
            {/* Tricolor Mini Accent Bar */}
            <div className="flex h-1 w-12 rounded-full overflow-hidden">
              <div className="w-1/3 bg-[#FF9933]" />
              <div className="w-1/3 bg-white" />
              <div className="w-1/3 bg-[#138808]" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              To provide a secure, transparent and accountable system for managing critical
              military assets, supporting operational readiness across all bases.
            </p>
          </div>

          {/* Col 2: Fighter Jet Image */}
          <div className="lg:col-span-3 min-h-[220px] bg-slate-900 relative overflow-hidden">
            <img
              src="/fighter_jet.jpg"
              alt="IAF Fighter Aircraft"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Col 3: Values & Pillars */}
          <div className="lg:col-span-4 bg-white p-8 flex flex-col justify-center space-y-5">
            {/* Pillar 1 */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">Operational Efficiency</h3>
                <p className="text-[11px] text-slate-500">Optimise resource utilisation</p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">Data-Driven Decisions</h3>
                <p className="text-[11px] text-slate-500">Real-time insights and analytics</p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">Transparency & Accountability</h3>
                <p className="text-[11px] text-slate-500">Complete audit trail and monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
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

      {/* 8. AUTHENTICATION MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md text-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 rounded-lg bg-amber-500 text-slate-950 font-black text-xl items-center justify-center mb-2">
                M
              </div>
              <h2 className="text-xl font-bold text-white">Login to MAMS Portal</h2>
              <p className="text-xs text-slate-400 mt-1">Authorized personnel only. All access is audited.</p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="user@forces.gov"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Logins */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <p className="text-[11px] text-slate-400 font-semibold mb-2">Quick Demo Access (Click to autofill):</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@forces.gov', 'Admin@123')}
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left border border-slate-700/60 transition"
                >
                  <div className="font-semibold text-amber-400">Admin</div>
                  <div className="text-[10px] text-slate-400">admin@forces.gov</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('cmdr.north@forces.gov', 'Cmdr@123')}
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left border border-slate-700/60 transition"
                >
                  <div className="font-semibold text-amber-400">Camp North Cmdr</div>
                  <div className="text-[10px] text-slate-400">cmdr.north@forces.gov</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('cmdr.south@forces.gov', 'Cmdr@123')}
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left border border-slate-700/60 transition"
                >
                  <div className="font-semibold text-amber-400">Camp South Cmdr</div>
                  <div className="text-[10px] text-slate-400">cmdr.south@forces.gov</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('logistics@forces.gov', 'Logistics@123')}
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left border border-slate-700/60 transition"
                >
                  <div className="font-semibold text-amber-400">Logistics Officer</div>
                  <div className="text-[10px] text-slate-400">logistics@forces.gov</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
