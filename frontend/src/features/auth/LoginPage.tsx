import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-lg bg-amber-500 text-slate-950 font-black text-xl items-center justify-center mb-3">
            M
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Military Asset Management</h2>
          <p className="text-sm text-slate-400 mt-1">Authorized personnel only. All access is audited.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              placeholder="user@forces.gov"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-md transition-colors text-sm shadow"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400 font-medium mb-2">Quick Demo Access (Click to autofill):</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@forces.gov', 'Admin@123')}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left border border-slate-700/60 transition"
            >
              <div className="font-semibold text-amber-400">Admin</div>
              <div className="text-[11px] text-slate-400">admin@forces.gov</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('cmdr.north@forces.gov', 'Cmdr@123')}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left border border-slate-700/60 transition"
            >
              <div className="font-semibold text-amber-400">Camp North Cmdr</div>
              <div className="text-[11px] text-slate-400">cmdr.north@forces.gov</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('cmdr.south@forces.gov', 'Cmdr@123')}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left border border-slate-700/60 transition"
            >
              <div className="font-semibold text-amber-400">Camp South Cmdr</div>
              <div className="text-[11px] text-slate-400">cmdr.south@forces.gov</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('logistics@forces.gov', 'Logistics@123')}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left border border-slate-700/60 transition"
            >
              <div className="font-semibold text-amber-400">Logistics Officer</div>
              <div className="text-[11px] text-slate-400">logistics@forces.gov</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
