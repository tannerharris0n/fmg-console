'use strict';
/**
 * Fixture data returned when USE_MOCK_DATA=true. Shape matches what the
 * real FMG client would return so the frontend doesn't care about the source.
 */

const now = () => new Date().toISOString();
const minsAgo = (m) => new Date(Date.now() - m * 60_000).toISOString();

const ADOMs = [
  { name: 'root', desc: 'Root ADOM', os_ver: 7, mr: 4, state: 1 },
  { name: 'corporate', desc: 'Corporate sites', os_ver: 7, mr: 4, state: 1 },
  { name: 'ot', desc: 'OT environments', os_ver: 7, mr: 4, state: 1 },
];

const DEVICES = [
  { name: 'hq-core-01', ip: '10.0.0.1', platform_str: 'FortiGate-100F', os_ver: 7, mr: 4, patch: 5, conn_status: 1, ha_mode: 1, site: 'HQ' },
  { name: 'hq-dist-02', ip: '10.0.0.2', platform_str: 'FortiGate-100F', os_ver: 7, mr: 4, patch: 5, conn_status: 1, ha_mode: 1, site: 'HQ' },
  { name: 'hq-dmz-01', ip: '10.0.0.10', platform_str: 'FortiGate-200F', os_ver: 7, mr: 4, patch: 5, conn_status: 1, ha_mode: 1, site: 'HQ' },
  { name: 'br-sea-01', ip: '10.1.1.1', platform_str: 'FortiGate-60F', os_ver: 7, mr: 4, patch: 4, conn_status: 1, ha_mode: 1, site: 'Seattle', drift: 3 },
  { name: 'br-tac-01', ip: '10.1.2.1', platform_str: 'FortiGate-60F', os_ver: 7, mr: 4, patch: 5, conn_status: 1, ha_mode: 0, site: 'Tacoma' },
  { name: 'br-spk-01', ip: '10.1.3.1', platform_str: 'FortiGate-60F', os_ver: 7, mr: 4, patch: 5, conn_status: 1, ha_mode: 0, site: 'Spokane' },
  { name: 'br-boi-01', ip: '10.1.4.1', platform_str: 'FortiGate-60F', os_ver: 7, mr: 4, patch: 2, conn_status: 0, ha_mode: 0, site: 'Boise' },
  { name: 'ot-plant-01', ip: '10.2.1.1', platform_str: 'FortiGate-70F', os_ver: 7, mr: 4, patch: 5, conn_status: 1, ha_mode: 1, site: 'Plant1' },
  { name: 'ot-plant-02', ip: '10.2.2.1', platform_str: 'FortiGate-70F', os_ver: 7, mr: 4, patch: 4, conn_status: 1, ha_mode: 1, site: 'Plant2', drift: 1 },
];

function dashboardSummary() {
  const online = DEVICES.filter((d) => d.conn_status === 1).length;
  const drift = DEVICES.filter((d) => d.drift > 0).length;

  return {
    devices: { total: 47, online: 42, offline: 5 },
    installs: { pending: 3, running: 1, runningPct: 68 },
    drift: { count: drift, severity: 'danger' },
    tasks: { active: 1 },
    vpn: { up: 34, total: 36, sslActive: 127 },
    sdwan: { avgSla: 91, overlaysAtRisk: 1 },
    threats: { blocked24h: 2847, trend: 'up' },
    policies: { total: 120, dead: 18, active: 94, lowUse: 8 },
    cves: { count: 3, critical: 1 },
    updatedAt: now(),
  };
}

function sdwanOverlays() {
  return [
    { name: 'MPLS-primary',  sla: 98, latencyMs: 12, jitterMs: 2, lossPct: 0.0, status: 'ok' },
    { name: 'Broadband-1',   sla: 94, latencyMs: 28, jitterMs: 5, lossPct: 0.2, status: 'ok' },
    { name: 'Broadband-2',   sla: 76, latencyMs: 85, jitterMs: 14, lossPct: 1.8, status: 'warning' },
    { name: 'IPsec-ovl-a',   sla: 42, latencyMs: 210, jitterMs: 38, lossPct: 6.2, status: 'danger' },
    { name: 'IPsec-ovl-b',   sla: 96, latencyMs: 18, jitterMs: 3, lossPct: 0.1, status: 'ok' },
    { name: 'LTE-backup',    sla: null, latencyMs: null, jitterMs: null, lossPct: null, status: 'standby' },
  ];
}

function vpnTunnels() {
  return {
    up: 34,
    total: 36,
    sslActive: 127,
    down: [
      { name: 'br-boi-01 → hq-core', downFor: '2h' },
      { name: 'ot-plant-02 → hq-dmz', downFor: '18m' },
    ],
  };
}

function haClusters() {
  return [
    { name: 'hq-core',   mode: 'A/P', status: 'ok',      syncNote: 'sync ok' },
    { name: 'hq-dmz',    mode: 'A/A', status: 'ok',      syncNote: 'sync ok' },
    { name: 'br-sea',    mode: 'A/P', status: 'warning', syncNote: 'hb miss 3' },
    { name: 'ot-plant',  mode: 'A/P', status: 'ok',      syncNote: 'sync ok' },
  ];
}

function firmwarePosture() {
  return {
    total: 47,
    buckets: [
      { version: '7.4.5', label: 'current',  count: 29, status: 'ok' },
      { version: '7.4.4', label: '',         count: 10, status: 'ok' },
      { version: '7.4.2', label: 'behind',   count: 5,  status: 'warning' },
      { version: '7.2.x', label: 'EOL risk', count: 3,  status: 'danger' },
    ],
  };
}

function deviceFleet() {
  return DEVICES.map((d) => ({
    name: d.name,
    platform: d.platform_str,
    firmware: `${d.os_ver}.${d.mr}.${d.patch}`,
    site: d.site,
    status: d.conn_status === 0 ? 'offline' : d.drift ? 'warning' : 'ok',
    note: d.conn_status === 0 ? 'offline' : d.drift ? 'drift' : null,
  }));
}

function policyHeatmap() {
  // 120 rules worth, random-ish hit distribution per category.
  const rules = [];
  const seed = 42;
  const rand = (n) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 120; i++) {
    const r = rand(i);
    let bucket;
    if (r < 0.04) bucket = 'dead';
    else if (r < 0.1) bucket = 'low';
    else if (r < 0.4) bucket = 'moderate';
    else if (r < 0.7) bucket = 'active';
    else bucket = 'heavy';
    rules.push({ id: i + 1, name: `rule-${i + 1}`, bucket, hits: Math.floor(rand(i + 7) * 10000) });
  }
  return {
    rules,
    summary: {
      total: rules.length,
      heavy: rules.filter((r) => r.bucket === 'heavy').length,
      active: rules.filter((r) => r.bucket === 'active').length,
      moderate: rules.filter((r) => r.bucket === 'moderate').length,
      low: rules.filter((r) => r.bucket === 'low').length,
      dead: rules.filter((r) => r.bucket === 'dead').length,
    },
  };
}

function threatActivity() {
  // 24 hourly buckets, trending upward.
  const points = [];
  for (let i = 0; i < 24; i++) {
    const base = 60 + i * 8;
    const jitter = Math.floor(Math.sin(i) * 20);
    points.push({ hour: i, count: Math.max(10, base + jitter) });
  }
  return {
    total24h: 2847,
    points,
    top: [
      { name: 'Log4j.RCE', category: 'IPS', count: 1204 },
      { name: 'Agent.Tesla', category: 'AV', count: 892 },
      { name: 'Malicious URL', category: 'WebFilter', count: 751 },
    ],
  };
}

function cveWatchlist() {
  return [
    {
      id: 'CVE-2026-0142',
      severity: 'critical',
      score: 9.8,
      title: 'SSL-VPN heap overflow',
      detail: 'Pre-auth remote code execution via crafted SSL-VPN request',
      affectedDevices: 3,
      fixedIn: '7.4.5',
    },
    {
      id: 'CVE-2026-0098',
      severity: 'high',
      score: 7.5,
      title: 'Admin auth bypass',
      detail: 'Weak session token enables privilege escalation under specific timing',
      affectedDevices: 5,
      fixedIn: '7.4.5',
    },
    {
      id: 'CVE-2025-9821',
      severity: 'high',
      score: 7.2,
      title: 'SSH CLI escape',
      detail: 'Privileged-only escape from restricted CLI shell',
      affectedDevices: 10,
      fixedIn: '7.4.4',
    },
  ];
}

function driftAlerts() {
  return [
    {
      device: 'br-sea-01',
      severity: 'danger',
      diffCount: 3,
      note: 'policy edited out-of-band',
      detectedAt: minsAgo(18),
    },
    {
      device: 'ot-plant-02',
      severity: 'warning',
      diffCount: 1,
      note: 'DNS server changed on device',
      detectedAt: minsAgo(42),
    },
  ];
}

function adminAudit() {
  return {
    successful24h: 42,
    failed24h: 3,
    changes24h: 11,
    byAdmin: [
      { name: 'tanner',  changes: 12, failed: 0 },
      { name: 'tiffany', changes: 4,  failed: 0 },
    ],
    suspicious: [
      { ip: '203.0.113.9', attempts: 3, lastAttemptAt: minsAgo(23) },
    ],
  };
}

function activityFeed() {
  return [
    { actor: 'tanner',  action: 'install',    target: 'BranchPolicy v14', detail: '6 devices', at: minsAgo(2),   type: 'info' },
    { actor: 'system',  action: 'drift',      target: 'br-sea-01',         detail: '3 settings diverged', at: minsAgo(18), type: 'warning' },
    { actor: 'tiffany', action: 'edit',       target: 'CORP-VLANS',        detail: 'address group', at: minsAgo(60), type: 'info' },
    { actor: 'system',  action: 'offline',    target: 'br-boi-01',         detail: 'connectivity lost', at: minsAgo(120), type: 'danger' },
    { actor: 'tanner',  action: 'script',     target: 'hardening-v2',      detail: '12 devices', at: minsAgo(240), type: 'info' },
  ];
}

function policyPackages() {
  return [
    { name: 'HQ-Core',        devices: 2, lastModified: minsAgo(30),   rules: 84 },
    { name: 'BranchPolicy',   devices: 4, lastModified: minsAgo(120),  rules: 52 },
    { name: 'OT-Baseline',    devices: 2, lastModified: minsAgo(1440), rules: 38 },
    { name: 'DMZ-Outbound',   devices: 1, lastModified: minsAgo(720),  rules: 21 },
  ];
}

function tasks() {
  return [
    { id: 1024, name: 'Install BranchPolicy v14', state: 'running', percent: 68, startedAt: minsAgo(5) },
    { id: 1023, name: 'Install HQ-Core v32',      state: 'done',    percent: 100, startedAt: minsAgo(45), endedAt: minsAgo(38) },
    { id: 1022, name: 'Script: hardening-v2',     state: 'done',    percent: 100, startedAt: minsAgo(245), endedAt: minsAgo(240) },
  ];
}

module.exports = {
  adoms: () => ADOMs,
  dashboardSummary,
  sdwanOverlays,
  vpnTunnels,
  haClusters,
  firmwarePosture,
  deviceFleet,
  policyHeatmap,
  threatActivity,
  cveWatchlist,
  driftAlerts,
  adminAudit,
  activityFeed,
  policyPackages,
  tasks,
};
