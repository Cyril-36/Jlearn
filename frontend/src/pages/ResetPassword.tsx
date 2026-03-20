import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Code, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api';
import { getErrorMessage } from '../utils/http';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      navigate('/login');
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Reset failed. The link may have expired.'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center text-[#ffb4ab]">
      Invalid reset link. <Link to="/forgot-password" className="ml-2 text-jlearn-cyan underline">Request a new one.</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="flex justify-center">
          <div className="flex items-center gap-3 text-jlearn-cyan font-bold text-3xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <Code size={32} strokeWidth={2.5} /><span>JLearn</span>
          </div>
        </div>
        <div className="bg-[#1c1b1b] rounded-2xl p-8 border border-[#3a4a44]/20">
          <h2 className="text-2xl font-bold text-jlearn-primary mb-6" style={{ fontFamily: 'var(--font-display)' }}>Set New Password</h2>
          {error && <div className="bg-[#93000a]/10 border border-[#93000a]/30 rounded-lg p-3 mb-4 text-[#ffb4ab] text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#83958d]" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="New password (8+ chars)" required minLength={8}
                className="w-full bg-[#0e0e0e] border border-[#3a4a44]/30 rounded-xl py-3.5 pl-11 pr-12 text-[#e5e2e1] placeholder-[#3a4a44] focus:outline-none focus:border-jlearn-cyan/50 transition-all text-sm font-mono" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#83958d] hover:text-[#b9cbc3]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-3 font-bold disabled:opacity-50">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <>Update Password <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
