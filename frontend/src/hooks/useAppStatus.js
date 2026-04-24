import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

/**
 * Queries /api/health to discover runtime state (demo mode, mock mode,
 * environment). Cached aggressively - this doesn't change within a session.
 */
export function useAppStatus() {
  return useQuery({
    queryKey: ['app-status'],
    queryFn: () => api.get('/health'),
    staleTime: 10 * 60_000,
    retry: 0,
  });
}
