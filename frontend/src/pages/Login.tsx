import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Code, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { persistAuthSession, type AuthSessionPayload } from '../utils/auth';
import { getErrorMessage } from '../utils/http';

export default function Login() {
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const completeAuth = (payload: AuthSessionPayload) => {
    persistAuthSession(payload);
    navigate('/dashboard');
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<AuthSessionPayload>('/auth/login', { email, password });
      completeAuth(response.data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Login failed. Please try again.'));
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post<AuthSessionPayload>('/auth/google', { credential });
      completeAuth(response.data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Google login failed.'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-jlearn-cyan/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00FFD1]/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md flex flex-col gap-8 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-jlearn-cyan font-bold text-3xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <Code size={32} strokeWidth={2.5} />
            <span>JLearn</span>
          </div>
          <p className="text-[#83958d] text-sm text-center">
            Welcome back. Continue your Java mastery.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8 border border-[#3a4a44]/20 shadow-[0px_20px_60px_rgba(0,0,0,0.5)]">
          <h2 className="text-2xl font-bold text-jlearn-primary mb-6 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Sign In
          </h2>

          {clientId ? (
            <>
              <GoogleSignInButton
                clientId={clientId}
                disabled={loading}
                onCredential={handleGoogleLogin}
                onError={setError}
              />

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[#3a4a44]/30"></div>
                <span className="text-xs text-[#83958d] uppercase tracking-widest font-bold">or</span>
                <div className="flex-1 h-px bg-[#3a4a44]/30"></div>
              </div>
            </>
          ) : null}

          {/* Error */}
          {error && (
            <div className="bg-[#93000a]/10 border border-[#93000a]/30 rounded-lg p-3 mb-4 text-[#ffb4ab] text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#83958d]">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#83958d]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#0e0e0e] border border-[#3a4a44]/30 rounded-xl py-3.5 pl-11 pr-4 text-[#e5e2e1] placeholder-[#3a4a44] focus:outline-none focus:border-jlearn-cyan/50 focus:shadow-[0_0_0_3px_rgba(0,255,209,0.05)] transition-all text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-[#83958d]">Password</label>
                <Link to="/forgot-password" className="text-xs text-jlearn-cyan hover:underline font-medium">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#83958d]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0e0e0e] border border-[#3a4a44]/30 rounded-xl py-3.5 pl-11 pr-12 text-[#e5e2e1] placeholder-[#3a4a44] focus:outline-none focus:border-jlearn-cyan/50 focus:shadow-[0_0_0_3px_rgba(0,255,209,0.05)] transition-all text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#83958d] hover:text-[#b9cbc3] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-base font-bold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Authenticating...</>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#83958d]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-jlearn-cyan font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
