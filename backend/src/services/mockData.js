'use strict';
/**
 * Fixture data returned when USE_MOCK_DATA=true. Shape matches what the
 * real FMG client would return so the frontend doesn't care about the source.
 *
 * The data is intentionally dense so the demo deployment at
 * fmg.tannerharrison.com feels like a production environment.
 */

const now = () => new Date().toISOString();
const minsAgo = (m) => new Date(Date.now() - m * 60_000).toISOString();

const ADOMs = [
  { name: 'root',      desc: 'Root ADOM',       os_ver: 7, mr: 4, state: 1 },
  { name: 'corporate', desc: 'Corporate sites', os_ver: 7, mr: 4, state: 1 },
  { name: 'ot',        desc: 'OT environments', os_ver: 7, mr: 4, state: 1 },
  { name: 'partner',   desc: 'Partner extranet', os_ver: 7, mr: 4, state: 1 },
];

function buildFleet() {
  const hq = [
    { name: 'hq-core-01', platform: '100F', site: 'HQ-Seattle', ha: 'A/P' },
    { name: 'hq-core-02', platform: '100F', site: 'HQ-Seattle', ha: 'A/P' },
    { name: 'hq-dist-01', platform: '100F', site: 'HQ-Seattle', ha: 'A/A' },
    { name: 'hq-dist-02', platform: '100F', site: 'HQ-Seattle', ha: 'A/A' },
    { name: 'hq-dmz-01',  platform: '200F', site: 'HQ-DMZ',     ha: 'A/P' },
    { name: 'hq-dmz-02',  platform: '200F', site: 'HQ-DMZ',     ha: 'A/P' },
    { name: 'hq-ext-01',  platform: '600F', site: 'HQ-Edge',    ha: 'single' },
  ];
  const cities = ['sea','tac','spk','boi','pdx','med','eug','bza','hlv','pas','tri','wsv'];
  const branches = cities.flatMap((c) => [
    { name: `br-${c}-01`, platform: '60F', site: c.toUpperCase(), ha: 'A/P' },
    { name: `br-${c}-02`, platform: '60F', site: c.toUpperCase(), ha: 'A/P' },
  ]);
  const ot = [];
  for (let i = 1; i <= 8; i++) {
    const n = String(i).padStart(2, '0');
    ot.push({ name: `ot-plant-${n}a`, platform: '70F', site: `Plant${i}`, ha: 'A/P' });
    ot.push({ name: `ot-plant-${n}b`, platform: '70F', site: `Plant${i}`, ha: 'A/P' });
  }
  const all = [...hq, ...branches, ...ot];

  // Per-device overrides - status, firmware deviations, beta testing, etc.
  const overrides = {
    'br-sea-01':    { status: 'warning', note: 'drift',   firmware: '7.6.5' },
    'br-boi-01':    { status: 'danger',  note: 'offline', firmware: '7.4.8' },
    'br-tri-02':    { status: 'danger',  note: 'offline', firmware: '7.4.8' },
    'br-pas-01':    { status: 'warning', note: 'drift',   firmware: '7.6.6' },
    'br-hlv-02':    { status: 'warning', note: 'reboot',  firmware: '7.6.6' },
    'ot-plant-02b': { status: 'warning', note: 'pending', firmware: '7.6.5' },
    'ot-plant-05a': { status: 'warning', note: 'drift',   firmware: '7.2.11' },
    'ot-plant-07a': { status: 'danger',  note: 'offline', firmware: '7.2.11' },
    'hq-ext-01':    { firmware: '8.0.0-beta2', note: 'beta lab' },   // testing next-gen
    'hq-dist-02':   { firmware: '8.0.0-beta2', note: 'beta lab' },
  };
  const defaultFw = (p) => (p === '70F' ? '7.6.5' : '7.6.6');

  const managed = all.map((d) => {
    const o = overrides[d.name] || {};
    return {
      name: d.name,
      platform: `FortiGate-${d.platform}`,
      firmware: o.firmware || defaultFw(d.platform),
      site: d.site,
      haMode: d.ha,
      status: o.status || 'ok',
      note: o.note || null,
      managed: true,
    };
  });

  // Discovered but not yet added to FMG management
  const unmanaged = [
    { name: 'new-sf-01',    platform: 'FortiGate-60F', firmware: '7.6.4', site: 'SanFrancisco', haMode: 'standalone', status: 'warning', note: 'pending onboard', managed: false },
    { name: 'acq-portal-01', platform: 'FortiGate-90G', firmware: '7.6.6', site: 'Portland',     haMode: 'standalone', status: 'warning', note: 'new acquisition', managed: false },
  ];

  return [...managed, ...unmanaged];
}

const FLEET = buildFleet();

function dashboardSummary() {
  const managed = FLEET.filter((d) => d.managed !== false);
  const online = managed.filter((d) => d.status !== 'danger').length;
  const offline = managed.length - online;
  return {
    devices: { total: managed.length, online, offline, unmanaged: FLEET.length - managed.length },
    installs: { pending: 3, running: 1, runningPct: 68 },
    drift: { count: 4, severity: 'danger' },
    tasks: { active: 2 },
    vpn: { up: 34, total: 36, sslActive: 127 },
    sdwan: { avgSla: 91, overlaysAtRisk: 1 },
    threats: { blocked24h: 2847, trend: 'up' },
    policies: { total: 142, dead: 23, active: 108, lowUse: 11 },
    cves: { count: 5, critical: 1 },
    updatedAt: now(),
  };
}

function sdwanOverlays() {
  return [
    { name: 'MPLS-primary', sla: 98, latencyMs: 12,  jitterMs: 2,  lossPct: 0.0, status: 'ok' },
    { name: 'Broadband-1',  sla: 94, latencyMs: 28,  jitterMs: 5,  lossPct: 0.2, status: 'ok' },
    { name: 'Broadband-2',  sla: 76, latencyMs: 85,  jitterMs: 14, lossPct: 1.8, status: 'warning' },
    { name: 'IPsec-ovl-a',  sla: 42, latencyMs: 210, jitterMs: 38, lossPct: 6.2, status: 'danger' },
    { name: 'IPsec-ovl-b',  sla: 96, latencyMs: 18,  jitterMs: 3,  lossPct: 0.1, status: 'ok' },
    { name: 'LTE-backup',   sla: null, latencyMs: null, jitterMs: null, lossPct: null, status: 'standby' },
  ];
}

function vpnTunnels() {
  return {
    up: 34, total: 36, sslActive: 127,
    down: [
      { name: 'br-boi-01 → hq-core', downFor: '2h' },
      { name: 'ot-plant-07a → hq-dmz', downFor: '18m' },
    ],
  };
}

function haClusters() {
  return [
    { name: 'hq-core',     mode: 'A/P', status: 'ok',      syncNote: 'sync ok' },
    { name: 'hq-dist',     mode: 'A/A', status: 'ok',      syncNote: 'sync ok' },
    { name: 'hq-dmz',      mode: 'A/P', status: 'ok',      syncNote: 'sync ok' },
    { name: 'br-sea',      mode: 'A/P', status: 'warning', syncNote: 'hb miss 3' },
    { name: 'br-tac',      mode: 'A/P', status: 'ok',      syncNote: 'sync ok' },
    { name: 'br-spk',      mode: 'A/P', status: 'ok',      syncNote: 'sync ok' },
    { name: 'ot-plant-01', mode: 'A/P', status: 'ok',      syncNote: 'sync ok' },
    { name: 'ot-plant-05', mode: 'A/P', status: 'warning', syncNote: 'sync lag 12s' },
  ];
}

function firmwarePosture() {
  const managed = FLEET.filter((d) => d.managed !== false);
  const v = {};
  managed.forEach((d) => { v[d.firmware] = (v[d.firmware] || 0) + 1; });
  return {
    total: managed.length,
    buckets: [
      { version: '7.6.6',         label: 'current',   count: v['7.6.6'] || 0,         status: 'ok' },
      { version: '7.6.5',         label: '',          count: v['7.6.5'] || 0,         status: 'ok' },
      { version: '7.4.8',         label: 'behind',    count: v['7.4.8'] || 0,         status: 'warning' },
      { version: '7.2.11',        label: 'EOL risk',  count: v['7.2.11'] || 0,        status: 'danger' },
      { version: '8.0.0-beta2',   label: 'beta lab',  count: v['8.0.0-beta2'] || 0,   status: 'info' },
    ],
  };
}

function deviceFleet() { return FLEET; }

function policyHeatmap() {
  const rules = [];
  const rand = (n) => { const x = Math.sin(42 + n) * 10000; return x - Math.floor(x); };
  for (let i = 0; i < 142; i++) {
    const r = rand(i);
    let bucket;
    if (r < 0.04) bucket = 'dead';
    else if (r < 0.11) bucket = 'low';
    else if (r < 0.4) bucket = 'moderate';
    else if (r < 0.72) bucket = 'active';
    else bucket = 'heavy';
    rules.push({ id: i + 1, name: `rule-${i + 1}`, bucket, hits: Math.floor(rand(i + 7) * 10000) });
  }
  return {
    rules,
    summary: {
      total: rules.length,
      heavy:    rules.filter((r) => r.bucket === 'heavy').length,
      active:   rules.filter((r) => r.bucket === 'active').length,
      moderate: rules.filter((r) => r.bucket === 'moderate').length,
      low:      rules.filter((r) => r.bucket === 'low').length,
      dead:     rules.filter((r) => r.bucket === 'dead').length,
    },
  };
}

function threatActivity() {
  const points = [];
  for (let i = 0; i < 24; i++) {
    const base = 60 + i * 8;
    const jitter = Math.floor(Math.sin(i * 1.3) * 20);
    points.push({ hour: i, count: Math.max(10, base + jitter) });
  }
  return {
    total24h: 2847,
    points,
    top: [
      { name: 'Log4j.RCE',     category: 'IPS',       count: 1204 },
      { name: 'Agent.Tesla',   category: 'AV',        count: 892 },
      { name: 'Malicious URL', category: 'WebFilter', count: 751 },
      { name: 'Emotet.C2',     category: 'IPS',       count: 318 },
      { name: 'Cobalt.Strike', category: 'IPS',       count: 205 },
    ],
  };
}

function cveWatchlist() {
  return [
    { id: 'CVE-2026-0142', severity: 'critical', score: 9.8, title: 'SSL-VPN heap overflow',          detail: 'Pre-auth remote code execution via crafted SSL-VPN request',            affectedDevices: 3,  fixedIn: '7.6.6' },
    { id: 'CVE-2026-0098', severity: 'high',     score: 7.5, title: 'Admin auth bypass',              detail: 'Weak session token enables privilege escalation under specific timing', affectedDevices: 5,  fixedIn: '7.6.6' },
    { id: 'CVE-2025-9821', severity: 'high',     score: 7.2, title: 'SSH CLI escape',                 detail: 'Privileged-only escape from restricted CLI shell',                       affectedDevices: 10, fixedIn: '7.6.5' },
    { id: 'CVE-2025-9704', severity: 'medium',   score: 6.1, title: 'CSRF in web UI dashboard',       detail: 'Missing CSRF tokens on specific dashboard endpoints',                    affectedDevices: 14, fixedIn: '7.6.4' },
    { id: 'CVE-2025-9512', severity: 'medium',   score: 5.4, title: 'Info disclosure via diag debug', detail: 'Diagnostic output exposes configuration snippets to low-priv admins',   affectedDevices: 22, fixedIn: '7.6.3' },
  ];
}

function driftAlerts() {
  return [
    { device: 'br-sea-01',    severity: 'danger',  diffCount: 3, note: 'policy edited out-of-band',                  detectedAt: minsAgo(18) },
    { device: 'ot-plant-02b', severity: 'warning', diffCount: 1, note: 'DNS server changed on device',               detectedAt: minsAgo(42) },
    { device: 'br-pas-01',    severity: 'warning', diffCount: 2, note: 'syslog target removed, IPS profile changed', detectedAt: minsAgo(105) },
    { device: 'ot-plant-05a', severity: 'danger',  diffCount: 4, note: 'interface ip changed, route added manually', detectedAt: minsAgo(220) },
  ];
}

function adminAudit() {
  return {
    successful24h: 42, failed24h: 3, changes24h: 18,
    byAdmin: [
      { name: 'tanner',  changes: 12, failed: 0 },
      { name: 'tiffany', changes: 4,  failed: 0 },
      { name: 'mike',    changes: 2,  failed: 0 },
    ],
    suspicious: [
      { ip: '203.0.113.9',   attempts: 3, lastAttemptAt: minsAgo(23) },
      { ip: '198.51.100.42', attempts: 2, lastAttemptAt: minsAgo(180) },
    ],
  };
}

function activityFeed() {
  return [
    { actor: 'tanner',  action: 'install',    target: 'BranchPolicy v14', detail: '6 devices',                  at: minsAgo(2),    type: 'info' },
    { actor: 'system',  action: 'drift',      target: 'br-sea-01',         detail: '3 settings diverged',        at: minsAgo(18),   type: 'warning' },
    { actor: 'system',  action: 'login-fail', target: '203.0.113.9',       detail: '3 failed admin attempts',    at: minsAgo(23),   type: 'danger' },
    { actor: 'tiffany', action: 'edit',       target: 'CORP-VLANS',        detail: 'address group',              at: minsAgo(60),   type: 'info' },
    { actor: 'system',  action: 'ha-hb',      target: 'br-sea',            detail: '3 heartbeats missed',        at: minsAgo(90),   type: 'warning' },
    { actor: 'system',  action: 'offline',    target: 'br-boi-01',         detail: 'connectivity lost',          at: minsAgo(120),  type: 'danger' },
    { actor: 'system',  action: 'drift',      target: 'ot-plant-05a',      detail: '4 settings diverged',        at: minsAgo(220),  type: 'warning' },
    { actor: 'tanner',  action: 'script',     target: 'hardening-v2',      detail: '12 devices',                 at: minsAgo(240),  type: 'info' },
    { actor: 'mike',    action: 'edit',       target: 'OT-Baseline',       detail: 'added rule 22',              at: minsAgo(310),  type: 'info' },
    { actor: 'system',  action: 'CVE',        target: 'CVE-2026-0142',     detail: 'advisory published',         at: minsAgo(480),  type: 'warning' },
    { actor: 'tanner',  action: 'install',    target: 'HQ-Core v32',       detail: '4 devices',                  at: minsAgo(580),  type: 'info' },
    { actor: 'tiffany', action: 'create',     target: 'PRINTERS',          detail: 'address group · 8 members',  at: minsAgo(720),  type: 'info' },
  ];
}

function policyPackages() {
  return [
    { id: 'HQ-Core',          name: 'HQ-Core',          devices: ['hq-core-01','hq-core-02','hq-dist-01','hq-dist-02'], rules: 84, lastModified: minsAgo(30),   lastInstalled: minsAgo(45),   modifiedBy: 'tanner' },
    { id: 'BranchPolicy',     name: 'BranchPolicy',     devices: ['br-sea-01','br-tac-01','br-spk-01','br-boi-01','br-pdx-01','br-eug-01'], rules: 52, lastModified: minsAgo(120), lastInstalled: minsAgo(720), modifiedBy: 'tanner' },
    { id: 'BranchPolicy-Std', name: 'BranchPolicy-Std', devices: ['br-med-01','br-bza-01','br-hlv-01','br-pas-01','br-tri-01','br-wsv-01'], rules: 48, lastModified: minsAgo(1440), lastInstalled: minsAgo(1440), modifiedBy: 'tiffany' },
    { id: 'OT-Baseline',      name: 'OT-Baseline',      devices: ['ot-plant-01a','ot-plant-01b','ot-plant-02a','ot-plant-02b','ot-plant-03a','ot-plant-03b','ot-plant-04a','ot-plant-04b'], rules: 38, lastModified: minsAgo(310), lastInstalled: minsAgo(2880), modifiedBy: 'mike' },
    { id: 'OT-HighRisk',      name: 'OT-HighRisk',      devices: ['ot-plant-05a','ot-plant-05b','ot-plant-06a','ot-plant-06b','ot-plant-07a','ot-plant-07b','ot-plant-08a','ot-plant-08b'], rules: 44, lastModified: minsAgo(2880), lastInstalled: minsAgo(2880), modifiedBy: 'mike' },
    { id: 'DMZ-Outbound',     name: 'DMZ-Outbound',     devices: ['hq-dmz-01','hq-dmz-02'], rules: 21, lastModified: minsAgo(720),  lastInstalled: minsAgo(720),  modifiedBy: 'tanner' },
    { id: 'Partner-Extranet', name: 'Partner-Extranet', devices: ['hq-ext-01'],              rules: 19, lastModified: minsAgo(4320), lastInstalled: minsAgo(4320), modifiedBy: 'tanner' },
  ];
}

function tasks() {
  return [
    { id: 1024, name: 'Install BranchPolicy v14',    type: 'install',  state: 'running', percent: 68,  startedAt: minsAgo(5),    targets: 6,  user: 'tanner' },
    { id: 1023, name: 'Install HQ-Core v32',         type: 'install',  state: 'done',    percent: 100, startedAt: minsAgo(45),   endedAt: minsAgo(38),   targets: 4,  user: 'tanner' },
    { id: 1022, name: 'Script: hardening-v2',        type: 'script',   state: 'done',    percent: 100, startedAt: minsAgo(245),  endedAt: minsAgo(240),  targets: 12, user: 'tanner' },
    { id: 1021, name: 'Firmware: 7.4.5 upgrade',     type: 'firmware', state: 'queued',  percent: 0,   startedAt: null,          targets: 5,  user: 'tanner' },
    { id: 1020, name: 'Install OT-Baseline v8',      type: 'install',  state: 'failed',  percent: 42,  startedAt: minsAgo(360),  endedAt: minsAgo(355),  targets: 8,  user: 'tiffany', error: 'Device ot-plant-02b refused connection' },
    { id: 1019, name: 'Script: disable-smbv1',       type: 'script',   state: 'done',    percent: 100, startedAt: minsAgo(1440), endedAt: minsAgo(1435), targets: 47, user: 'tanner' },
    { id: 1018, name: 'Install Partner-Extranet v3', type: 'install',  state: 'done',    percent: 100, startedAt: minsAgo(4320), endedAt: minsAgo(4315), targets: 1,  user: 'tanner' },
  ];
}

function analyzerFindings() {
  return {
    summary: { dead: 23, shadow: 11, redundant: 6, overlyPermissive: 4, overrides: 3 },
    findings: [
      { id: 'f-001', severity: 'danger',  type: 'dead',              rule: 'allow-legacy-printer-port-9100', package: 'BranchPolicy',     note: 'No hits in 30 days. Safe to remove.',                    suggestion: 'disable' },
      { id: 'f-002', severity: 'danger',  type: 'dead',              rule: 'allow-deprecated-smb-v1',        package: 'HQ-Core',          note: 'No hits in 30 days. Known security risk.',               suggestion: 'delete' },
      { id: 'f-003', severity: 'danger',  type: 'dead',              rule: 'allow-fax-tcp-7777',             package: 'BranchPolicy-Std', note: 'No hits in 45 days. Device retired.',                    suggestion: 'delete' },
      { id: 'f-004', severity: 'warning', type: 'shadow',            rule: 'allow-web-servers-80',           package: 'DMZ-Outbound',     note: 'Shadowed by broader rule 4 (any/any/any-web).',          suggestion: 'move above rule 4 or delete' },
      { id: 'f-005', severity: 'warning', type: 'shadow',            rule: 'allow-jumphost-ssh',             package: 'HQ-Core',          note: 'Shadowed by rule 2 (admin-to-everywhere).',              suggestion: 'narrow rule 2 first' },
      { id: 'f-006', severity: 'warning', type: 'overly-permissive', rule: 'admin-to-everywhere',            package: 'HQ-Core',          note: 'Source any, destination any, service any.',              suggestion: 'narrow to mgmt subnet + SSH/HTTPS only' },
      { id: 'f-007', severity: 'warning', type: 'overly-permissive', rule: 'ot-broad-outbound',              package: 'OT-Baseline',      note: 'OT segment allowed outbound any - violates zero trust.', suggestion: 'restrict to update servers only' },
      { id: 'f-008', severity: 'warning', type: 'redundant',         rule: 'block-tor-exits-dup',            package: 'BranchPolicy',     note: 'Identical action to rule 12. Merge recommended.',        suggestion: 'merge with rule 12' },
      { id: 'f-009', severity: 'warning', type: 'redundant',         rule: 'block-social-dup',               package: 'BranchPolicy-Std', note: 'Overlaps with WebFilter profile. Redundant.',            suggestion: 'remove rule, rely on profile' },
      { id: 'f-010', severity: 'info',    type: 'override',          rule: 'local-exception-br-boi',         package: 'BranchPolicy',     note: 'Device-level override on br-boi-01 diverges from package.', suggestion: 'review with device owner' },
      { id: 'f-011', severity: 'info',    type: 'override',          rule: 'local-exception-ot-plant-05a',   package: 'OT-HighRisk',      note: 'Device-level override adds manual route.',               suggestion: 'move to package or remove' },
    ],
  };
}

function installPreview(packageId = 'BranchPolicy') {
  return {
    packageId, packageName: packageId, version: 14, previousVersion: 13,
    generatedAt: new Date().toISOString(),
    targets: [
      { device: 'br-sea-01', added: 3, modified: 1, removed: 0, status: 'ok' },
      { device: 'br-tac-01', added: 3, modified: 1, removed: 0, status: 'ok' },
      { device: 'br-spk-01', added: 3, modified: 1, removed: 0, status: 'ok' },
      { device: 'br-pdx-01', added: 3, modified: 1, removed: 0, status: 'ok' },
      { device: 'br-eug-01', added: 3, modified: 1, removed: 0, status: 'ok' },
      { device: 'br-boi-01', added: 3, modified: 1, removed: 0, status: 'warning', note: 'offline - will queue' },
    ],
    changes: [
      { kind: 'add',    section: 'Policy',  detail: 'Added rule 47: allow-guest-wifi-to-internet (Any → WAN1, :443/:80)' },
      { kind: 'add',    section: 'Policy',  detail: 'Added rule 48: block-printer-to-internet (PRINTERS → WAN1, any)' },
      { kind: 'add',    section: 'Address', detail: 'Created object PRINTERS (group of 8 addresses)' },
      { kind: 'modify', section: 'Policy',  detail: 'Rule 12: changed action from "accept" to "accept with IPS profile corp-ips"' },
    ],
    impact: { newRules: 2, modifiedRules: 1, newObjects: 1, estimatedDowntimeSeconds: 0 },
  };
}

function driftDetail(device = 'br-sea-01') {
  const all = {
    'br-sea-01': { device: 'br-sea-01', detectedAt: minsAgo(18), severity: 'danger', diffs: [
      { path: 'firewall.policy.12.action',  package: 'accept',           live: 'accept + ips-sensor=off', note: 'IPS profile disabled on device.' },
      { path: 'system.dns.primary',         package: '10.0.0.53',        live: '8.8.8.8',                  note: 'DNS manually changed.' },
      { path: 'log.syslogd.server',         package: 'siem-01.internal', live: '',                          note: 'Syslog target removed.' },
    ]},
    'ot-plant-02b': { device: 'ot-plant-02b', detectedAt: minsAgo(42), severity: 'warning', diffs: [
      { path: 'system.dns.primary', package: '10.2.0.53', live: '10.2.0.99', note: 'DNS pointing at non-standard resolver.' },
    ]},
    'br-pas-01': { device: 'br-pas-01', detectedAt: minsAgo(105), severity: 'warning', diffs: [
      { path: 'log.syslogd.server',          package: 'siem-01.internal', live: '',        note: 'Syslog removed.' },
      { path: 'firewall.policy.8.ips-sensor', package: 'corp-ips',         live: 'default', note: 'IPS profile swapped to default.' },
    ]},
    'ot-plant-05a': { device: 'ot-plant-05a', detectedAt: minsAgo(220), severity: 'danger', diffs: [
      { path: 'system.interface.port1.ip', package: '10.5.1.1/24', live: '10.5.1.2/24',           note: 'Interface IP changed.' },
      { path: 'router.static.5',            package: '(absent)',   live: '10.5.99.0/24 via 10.5.1.254', note: 'Manual static route added.' },
      { path: 'system.ntp.server',          package: 'ntp.internal', live: 'pool.ntp.org',          note: 'NTP pointing at public pool.' },
      { path: 'firewall.policy.14.action',  package: 'deny',         live: 'accept',                  note: 'Rule action flipped.' },
    ]},
  };
  return all[device] || all['br-sea-01'];
}

function cveDetail(cveId = 'CVE-2026-0142') {
  const all = {
    'CVE-2026-0142': {
      id: 'CVE-2026-0142', severity: 'critical', score: 9.8, title: 'SSL-VPN heap overflow',
      description: 'Pre-authentication remote code execution via crafted SSL-VPN request. Allows unauthenticated attacker to execute arbitrary code as root.',
      affectedVersions: ['7.2.0 - 7.2.10', '7.4.0 - 7.4.7', '7.6.0 - 7.6.5'],
      fixedIn: '7.6.6',
      affectedDevices: ['br-sea-01', 'br-boi-01', 'ot-plant-07a'],
      remediation: [
        'Upgrade affected devices to 7.6.6 or later',
        'If upgrade is not immediately possible, disable SSL-VPN service',
        'Restrict SSL-VPN portal to trusted source IPs via local-in policy',
      ],
      references: ['https://www.fortiguard.com/psirt/FG-IR-26-01', 'https://nvd.nist.gov/vuln/detail/CVE-2026-0142'],
    },
    'CVE-2026-0098': {
      id: 'CVE-2026-0098', severity: 'high', score: 7.5, title: 'Admin auth bypass',
      description: 'A race condition in session token validation allows a low-privilege admin to escalate to super_admin under specific timing conditions.',
      affectedVersions: ['7.6.0 - 7.6.5'],
      fixedIn: '7.6.6',
      affectedDevices: ['br-sea-01', 'br-boi-01', 'br-pas-01', 'ot-plant-02b', 'ot-plant-05a'],
      remediation: [
        'Upgrade to 7.6.6 or later',
        'Review admin account privileges and disable unused accounts',
        'Enable MFA for all administrative access',
      ],
      references: ['https://www.fortiguard.com/psirt/FG-IR-26-02'],
    },
  };
  return all[cveId] || all['CVE-2026-0142'];
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
  analyzerFindings,
  installPreview,
  driftDetail,
  cveDetail,
};
