import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');

  useEffect(() => {
    if (!token) {
      return;
    }

    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center p-6">
      <div className="bg-[#1c1b1b] rounded-2xl p-10 border border-[#3a4a44]/20 flex flex-col items-center gap-4 text-center max-w-sm w-full">
        {status === 'loading' && <><Loader2 size={40} className="text-jlearn-cyan animate-spin" /><p className="text-[#b9cbc3]">Verifying…</p></>}
        {status === 'success' && <>
          <CheckCircle2 size={48} className="text-jlearn-cyan" />
          <h2 className="text-2xl font-bold text-jlearn-primary" style={{ fontFamily: 'var(--font-display)' }}>Email Verified</h2>
          <p className="text-[#83958d]">Your account is confirmed. You're good to go.</p>
          <Link to="/dashboard" className="btn-primary px-6 py-3 font-bold mt-2">Go to Dashboard</Link>
        </>}
        {status === 'error' && <>
          <XCircle size={48} className="text-[#ffb4ab]" />
          <h2 className="text-2xl font-bold text-jlearn-primary" style={{ fontFamily: 'var(--font-display)' }}>Link Invalid</h2>
          <p className="text-[#83958d]">This link has expired or already been used.</p>
          <Link to="/login" className="text-jlearn-cyan hover:underline text-sm">Back to login</Link>
        </>}
      </div>
    </div>
  );
}
