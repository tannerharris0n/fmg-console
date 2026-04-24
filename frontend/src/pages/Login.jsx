import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { signIn, hasSupabase } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setErr(error.message);
    else navigate('/');
  };

  return (
    <div className="min-h-full grid place-items-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-accent text-white grid place-items-center text-[15px] font-semibold">F</div>
          <div>
            <div className="text-[15px] font-semibold leading-tight">FMG Console</div>
            <div className="text-[11px] text-ink-400">Sign in to continue</div>
          </div>
        </div>

        {!hasSupabase && (
          <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-200">
            Supabase env vars not set. The app will run without auth (dev mode).
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-[11px] text-ink-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface-900 border border-surface-600 rounded-md px-3 py-2 text-[13px] focus:border-accent outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] text-ink-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface-900 border border-surface-600 rounded-md px-3 py-2 text-[13px] focus:border-accent outline-none"
            />
          </div>

          {err && <div className="text-[12px] text-rose-400">{err}</div>}

          <button
            type="submit"
            disabled={loading || !hasSupabase}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 disabled:bg-surface-700 disabled:text-ink-400 text-white font-medium text-[13px] rounded-md px-3 py-2 transition"
          >
            <LogIn className="h-4 w-4" strokeWidth={1.8} />
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
