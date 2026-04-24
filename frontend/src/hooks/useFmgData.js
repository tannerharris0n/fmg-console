import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useTasks(opts = {}) {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks'),
    refetchInterval: opts.refetchInterval ?? 3_000,
  });
}

export function usePolicyPackages() {
  return useQuery({
    queryKey: ['policy', 'packages'],
    queryFn: () => api.get('/policy/packages'),
  });
}

export function useAnalyzer() {
  return useQuery({
    queryKey: ['analyzer'],
    queryFn: () => api.get('/analyzer'),
  });
}

export function useInstallPreview(packageId) {
  return useQuery({
    queryKey: ['install-preview', packageId],
    queryFn: () => api.get(`/install/${encodeURIComponent(packageId)}/preview`),
    enabled: Boolean(packageId),
  });
}

export function useExecuteInstall() {
  return useMutation({
    mutationFn: (packageId) => api.post(`/install/${encodeURIComponent(packageId)}/execute`),
  });
}

export function useDriftDetail(device) {
  return useQuery({
    queryKey: ['drift', device],
    queryFn: () => api.get(`/security/drift/${encodeURIComponent(device)}`),
    enabled: Boolean(device),
  });
}

export function useCves() {
  return useQuery({
    queryKey: ['cves'],
    queryFn: () => api.get('/security/cves'),
  });
}

export function useCveDetail(id) {
  return useQuery({
    queryKey: ['cve', id],
    queryFn: () => api.get(`/security/cves/${encodeURIComponent(id)}`),
    enabled: Boolean(id),
  });
}
