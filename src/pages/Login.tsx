import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authApi } from '../lib/api';
import { Store, Eye, EyeOff, Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@billing.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authApi.login({ email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-600/5 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md px-6 z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 shadow-xl shadow-brand-500/20 mb-4">
            <Store size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">BillPro</h1>
          <p className="text-slate-500 mt-2 text-sm">Billing & Inventory Management</p>
        </div>

        {/* Form */}
        <div className="card p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Sign in to your account</h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
              {loading ? (
                <span className="spinner w-5 h-5" />
              ) : (
                <><Zap size={16} /> Sign In</>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-3 font-medium">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setEmail('admin@billing.com'); setPassword('Admin@123'); }}
                className="text-left p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-colors"
              >
                <p className="text-xs font-semibold text-slate-800">Admin</p>
                <p className="text-xs text-slate-500 mt-0.5">admin@billing.com</p>
              </button>
              <button
                onClick={() => { setEmail('cashier@billing.com'); setPassword('Cashier@123'); }}
                className="text-left p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-colors"
              >
                <p className="text-xs font-semibold text-slate-800">Cashier</p>
                <p className="text-xs text-slate-500 mt-0.5">cashier@billing.com</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
