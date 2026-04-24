import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: () => api.get('/preferences'),
    staleTime: 5 * 60_000,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs) => api.put('/preferences', prefs),
    onSuccess: (data) => qc.setQueryData(['preferences'], data),
  });
}
