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

// ---------- Fabric ---------------------------------------------------------

export function useSdwan() {
  return useQuery({
    queryKey: ['sdwan'],
    queryFn: () => api.get('/fabric/sdwan'),
  });
}

export function useSdwanOverlay(name) {
  return useQuery({
    queryKey: ['sdwan', name],
    queryFn: () => api.get(`/fabric/sdwan/${encodeURIComponent(name)}`),
    enabled: Boolean(name),
  });
}

export function useIpsecTunnels() {
  return useQuery({
    queryKey: ['vpn', 'ipsec'],
    queryFn: () => api.get('/fabric/vpn/ipsec'),
    refetchInterval: 10_000,
  });
}

export function useSslVpnSessions() {
  return useQuery({
    queryKey: ['vpn', 'ssl'],
    queryFn: () => api.get('/fabric/vpn/ssl'),
    refetchInterval: 15_000,
  });
}

export function useHaClustersDetailed() {
  return useQuery({
    queryKey: ['ha'],
    queryFn: () => api.get('/fabric/ha'),
    refetchInterval: 15_000,
  });
}

// ---------- Security detail -----------------------------------------------

export function useThreatActivity() {
  return useQuery({
    queryKey: ['threats', 'activity'],
    queryFn: () => api.get('/security/threats'),
  });
}

export function useThreatEvents() {
  return useQuery({
    queryKey: ['threats', 'events'],
    queryFn: () => api.get('/security/threats/events'),
  });
}

export function useThreatTopSources() {
  return useQuery({
    queryKey: ['threats', 'top-sources'],
    queryFn: () => api.get('/security/threats/top-sources'),
  });
}

export function useThreatTopTargets() {
  return useQuery({
    queryKey: ['threats', 'top-targets'],
    queryFn: () => api.get('/security/threats/top-targets'),
  });
}

export function useAuditLog() {
  return useQuery({
    queryKey: ['audit', 'log'],
    queryFn: () => api.get('/security/audit/log'),
  });
}

// ---------- Policy objects & profiles -------------------------------------

export function usePolicyObjects() {
  return useQuery({
    queryKey: ['policy', 'objects'],
    queryFn: () => api.get('/objects'),
  });
}

export function usePolicyProfiles() {
  return useQuery({
    queryKey: ['policy', 'profiles'],
    queryFn: () => api.get('/policy/profiles'),
  });
}

// ---------- At Risk & Device detail ----------------------------------------

export function useAtRisk() {
  return useQuery({
    queryKey: ['dashboard', 'at-risk'],
    queryFn: () => api.get('/dashboard/at-risk'),
    refetchInterval: 30_000,
  });
}

export function useDeviceDetail(name) {
  return useQuery({
    queryKey: ['device', name],
    queryFn: () => api.get(`/devices/${encodeURIComponent(name)}/detail`),
    enabled: Boolean(name),
  });
}

// ---------- Scripts & Settings ---------------------------------------------

export function useScripts() {
  return useQuery({
    queryKey: ['scripts'],
    queryFn: () => api.get('/scripts'),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings'),
  });
}

// ---------- Policy detail hooks --------------------------------------------

export function usePackageDetail(name) {
  return useQuery({
    queryKey: ['policy', 'packages', name],
    queryFn: () => api.get(`/policy/packages/${encodeURIComponent(name)}`),
    enabled: Boolean(name),
  });
}

export function useObjectUsage(name) {
  return useQuery({
    queryKey: ['objects', 'usage', name],
    queryFn: () => api.get(`/objects/${encodeURIComponent(name)}/usage`),
    enabled: Boolean(name),
  });
}

export function useProfileDetail(type, name) {
  return useQuery({
    queryKey: ['policy', 'profile', type, name],
    queryFn: () => api.get(`/policy/profiles/${encodeURIComponent(type)}/${encodeURIComponent(name)}`),
    enabled: Boolean(type && name),
  });
}

// ---------- v0.8 hooks -----------------------------------------------------

export function useSaseOverview() {
  return useQuery({ queryKey: ['sase', 'overview'], queryFn: () => api.get('/sase/overview') });
}

export function useSaseZtnaApps() {
  return useQuery({ queryKey: ['sase', 'ztna'], queryFn: () => api.get('/sase/ztna-apps') });
}

export function useSwitches() {
  return useQuery({ queryKey: ['switches'], queryFn: () => api.get('/switches') });
}

export function useSwitchDetail(name) {
  return useQuery({
    queryKey: ['switches', name],
    queryFn: () => api.get(`/switches/${encodeURIComponent(name)}`),
    enabled: Boolean(name),
  });
}

export function useAps() {
  return useQuery({ queryKey: ['aps'], queryFn: () => api.get('/aps') });
}

export function useApSsidConfig() {
  return useQuery({ queryKey: ['aps', 'ssid'], queryFn: () => api.get('/aps/ssid-config') });
}

export function useChangeCalendar() {
  return useQuery({ queryKey: ['calendar'], queryFn: () => api.get('/calendar') });
}

export function useConfigDiff(packageName, at) {
  return useQuery({
    queryKey: ['diff', packageName, at],
    queryFn: () => api.get(`/policy/packages/${encodeURIComponent(packageName)}/diff${at ? '?at=' + encodeURIComponent(at) : ''}`),
    enabled: Boolean(packageName),
  });
}
