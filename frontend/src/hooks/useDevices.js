import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: () => api.get('/devices'),
  });
}
