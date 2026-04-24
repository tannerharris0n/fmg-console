import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Wraps protected routes. Three modes:
 *   1. Supabase not configured -> pass through (dev mode).
 *   2. Supabase configured, no session -> redirect to /login.
 *   3. Session present -> render children.
 */
export function AuthGate({ children }) {
  const { hasSupabase, session, loading } = useAuth();
  const location = useLocation();

  if (!hasSupabase) return children;
  if (loading) {
    return (
      <div className="h-full grid place-items-center text-ink-400 text-sm">
        Loading session...
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
