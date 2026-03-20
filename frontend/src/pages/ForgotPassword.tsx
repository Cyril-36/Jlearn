import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-jlearn-cyan font-bold text-3xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <Code size={32} strokeWidth={2.5} />
            <span>JLearn</span>
          </div>
        </div>

        <div className="bg-[#1c1b1b] rounded-2xl p-8 border border-[#3a4a44]/20">
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 size={48} className="text-jlearn-cyan" />
              <h2 className="text-2xl font-bold text-jlearn-primary" style={{ fontFamily: 'var(--font-display)' }}>Check your email</h2>
              <p className="text-[#83958d]">If that address is registered, a reset link is on its way.</p>
              <Link to="/login" className="text-jlearn-cyan font-semibold hover:underline text-sm">Back to login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-jlearn-primary mb-2" style={{ fontFamily: 'var(--font-display)' }}>Reset Password</h2>
              <p className="text-[#83958d] text-sm mb-6">Enter your email and we'll send a reset link.</p>
              {error && <div className="bg-[#93000a]/10 border border-[#93000a]/30 rounded-lg p-3 mb-4 text-[#ffb4ab] text-sm">{error}</div>}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#83958d]" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full bg-[#0e0e0e] border border-[#3a4a44]/30 rounded-xl py-3.5 pl-11 pr-4 text-[#e5e2e1] placeholder-[#3a4a44] focus:outline-none focus:border-jlearn-cyan/50 transition-all text-sm font-mono" />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-3 font-bold disabled:opacity-50">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <>Send Reset Link <ArrowRight size={18} /></>}
                </button>
              </form>
              <p className="text-center text-sm text-[#83958d] mt-4">
                <Link to="/login" className="text-jlearn-cyan hover:underline">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
