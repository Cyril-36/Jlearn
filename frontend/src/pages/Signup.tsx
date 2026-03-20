import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Code, User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { persistAuthSession, type AuthSessionPayload } from '../utils/auth';
import { getErrorMessage } from '../utils/http';

export default function Signup() {
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const completeAuth = (payload: AuthSessionPayload) => {
    persistAuthSession(payload);
    navigate('/dashboard');
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<AuthSessionPayload>('/auth/register', {
        name: name.trim(),
        email,
        password,
      });
      completeAuth(response.data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Signup failed. Please try again.'));
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credential: string) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post<AuthSessionPayload>('/auth/google', { credential });
      completeAuth(response.data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Google signup failed.'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-jlearn-cyan/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00FFD1]/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-8 relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-jlearn-cyan font-bold text-3xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <Code size={32} strokeWidth={2.5} />
            <span>JLearn</span>
          </div>
          <p className="text-[#83958d] text-sm text-center">Create your account and start mastering Java.</p>
        </div>

        <div className="bg-[#1c1b1b] rounded-2xl p-8 border border-[#3a4a44]/20 shadow-[0px_20px_60px_rgba(0,0,0,0.5)]">
          <h2 className="text-2xl font-bold text-jlearn-primary mb-6 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Create Account
          </h2>

          {clientId ? (
            <>
              <GoogleSignInButton
                clientId={clientId}
                disabled={loading}
                onCredential={handleGoogleSignup}
                onError={setError}
              />

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[#3a4a44]/30" />
                <span className="text-xs text-[#83958d] uppercase tracking-widest font-bold">or</span>
                <div className="flex-1 h-px bg-[#3a4a44]/30" />
              </div>
            </>
          ) : null}

          {error ? (
            <div className="bg-[#93000a]/10 border border-[#93000a]/30 rounded-lg p-3 mb-4 text-[#ffb4ab] text-sm">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#83958d]">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#83958d]" />
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full bg-[#0e0e0e] border border-[#3a4a44]/30 rounded-xl py-3.5 pl-11 pr-4 text-[#e5e2e1] placeholder-[#3a4a44] focus:outline-none focus:border-jlearn-cyan/50 focus:shadow-[0_0_0_3px_rgba(0,255,209,0.05)] transition-all text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#83958d]">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#83958d]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#0e0e0e] border border-[#3a4a44]/30 rounded-xl py-3.5 pl-11 pr-4 text-[#e5e2e1] placeholder-[#3a4a44] focus:outline-none focus:border-jlearn-cyan/50 focus:shadow-[0_0_0_3px_rgba(0,255,209,0.05)] transition-all text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#83958d]">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#83958d]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full bg-[#0e0e0e] border border-[#3a4a44]/30 rounded-xl py-3.5 pl-11 pr-12 text-[#e5e2e1] placeholder-[#3a4a44] focus:outline-none focus:border-jlearn-cyan/50 focus:shadow-[0_0_0_3px_rgba(0,255,209,0.05)] transition-all text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#83958d] hover:text-[#b9cbc3] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#83958d]">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#83958d]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                  required
                  minLength={8}
                  className="w-full bg-[#0e0e0e] border border-[#3a4a44]/30 rounded-xl py-3.5 pl-11 pr-12 text-[#e5e2e1] placeholder-[#3a4a44] focus:outline-none focus:border-jlearn-cyan/50 focus:shadow-[0_0_0_3px_rgba(0,255,209,0.05)] transition-all text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#83958d] hover:text-[#b9cbc3] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-base font-bold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#83958d]">
          Already have an account?{' '}
          <Link to="/login" className="text-jlearn-cyan font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
