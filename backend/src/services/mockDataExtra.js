'use strict';
/**
 * Extended fixtures for the v0.4 / v1.1 pages: SD-WAN detail, VPN tunnels,
 * HA clusters, threat events, admin audit log. Pure data - no deps.
 *
 * Shared between the main project and the demo. Use require('./mockDataExtra')
 * alongside the core mockData module.
 */

const minsAgo = (m) => new Date(Date.now() - m * 60_000).toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3_600_000).toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 86_400_000).toISOString();

// ---------- SD-WAN ---------------------------------------------------------

function sdwanOverlayDetail(name) {
  const base = {
    'MPLS-primary':  { sla: 98, latencyMs: 12,  jitterMs: 2,  lossPct: 0.0, status: 'ok',      peer: 'pop-sea-01',  providerNet: '203.0.113.0/30', bandwidth: '500 Mbps' },
    'Broadband-1':   { sla: 94, latencyMs: 28,  jitterMs: 5,  lossPct: 0.2, status: 'ok',      peer: 'pop-sea-02',  providerNet: 'Comcast DIA',    bandwidth: '1 Gbps / 200 Mbps' },
    'Broadband-2':   { sla: 76, latencyMs: 85,  jitterMs: 14, lossPct: 1.8, status: 'warning', peer: 'pop-sea-02',  providerNet: 'Ziply DIA',      bandwidth: '500 / 100 Mbps' },
    'IPsec-ovl-a':   { sla: 42, latencyMs: 210, jitterMs: 38, lossPct: 6.2, status: 'danger',  peer: 'azure-wus-2', providerNet: 'Azure VPN GW',   bandwidth: '200 Mbps' },
    'IPsec-ovl-b':   { sla: 96, latencyMs: 18,  jitterMs: 3,  lossPct: 0.1, status: 'ok',      peer: 'aws-us-w-2',  providerNet: 'AWS TGW',        bandwidth: '1 Gbps' },
    'LTE-backup':    { sla: null, latencyMs: null, jitterMs: null, lossPct: null, status: 'standby', peer: 'verizon-lte', providerNet: 'Verizon LTE', bandwidth: '50 Mbps' },
  };
  const meta = base[name] || base['MPLS-primary'];

  // 24h of hourly points, deterministic jitter per overlay.
  const rand = (n) => { const x = Math.sin(name.length * 10 + n) * 10000; return x - Math.floor(x); };
  const points = [];
  for (let i = 0; i < 24; i++) {
    const factor = 1 + (rand(i) - 0.5) * 0.35;
    points.push({
      hour: i,
      latency: meta.latencyMs == null ? null : Math.max(1, Math.round(meta.latencyMs * factor)),
      jitter:  meta.jitterMs  == null ? null : Math.max(0, Math.round(meta.jitterMs * factor)),
      loss:    meta.lossPct   == null ? null : Number((meta.lossPct * factor).toFixed(2)),
      sla:     meta.sla       == null ? null : Math.min(100, Math.max(0, Math.round(meta.sla * (1 + (rand(i + 100) - 0.5) * 0.1)))),
    });
  }

  return {
    name,
    ...meta,
    points,
    slaTargets: [
      { id: 'voice',   name: 'Voice',   maxLatency: 80,  maxJitter: 15, maxLoss: 1.0, met: meta.latencyMs != null && meta.latencyMs < 80  && meta.jitterMs < 15 && meta.lossPct < 1.0 },
      { id: 'video',   name: 'Video',   maxLatency: 120, maxJitter: 25, maxLoss: 2.0, met: meta.latencyMs != null && meta.latencyMs < 120 && meta.jitterMs < 25 && meta.lossPct < 2.0 },
      { id: 'bulk',    name: 'Bulk',    maxLatency: 300, maxJitter: 50, maxLoss: 5.0, met: meta.latencyMs != null && meta.latencyMs < 300 && meta.jitterMs < 50 && meta.lossPct < 5.0 },
    ],
    members: [
      { device: 'hq-core-01',  iface: 'wan1',  state: meta.status === 'danger' ? 'down' : 'up',    txMbps: 218, rxMbps: 412 },
      { device: 'hq-core-02',  iface: 'wan1',  state: meta.status === 'danger' ? 'down' : 'up',    txMbps: 210, rxMbps: 398 },
      { device: 'br-sea-01',   iface: 'wan1',  state: 'up',    txMbps: 38,  rxMbps: 74 },
      { device: 'br-tac-01',   iface: 'wan1',  state: 'up',    txMbps: 21,  rxMbps: 55 },
    ],
    rules: [
      { id: 1, name: 'Voice-RealTime',  matches: 184_210, lastSteer: meta.status === 'ok' ? name : 'MPLS-primary' },
      { id: 2, name: 'Video-Interactive', matches: 92_884, lastSteer: meta.status === 'ok' ? name : 'Broadband-1' },
      { id: 3, name: 'Web-General',     matches: 418_902, lastSteer: 'Broadband-1' },
      { id: 4, name: 'Backup-Bulk',     matches: 12_041,  lastSteer: 'Broadband-2' },
    ],
  };
}

// ---------- VPN ------------------------------------------------------------

function vpnIpsecTunnels() {
  return [
    { id: 'br-sea-to-hq',   name: 'br-sea-to-hq',   localGw: '10.1.1.1',  remoteGw: '203.0.113.10', peer: 'hq-core',     status: 'up',   phase1: 'ok', phase2: 'ok',   uptimeSec: 1_204_800, bytesIn: 38_402_914_210, bytesOut: 21_018_204_330 },
    { id: 'br-tac-to-hq',   name: 'br-tac-to-hq',   localGw: '10.1.2.1',  remoteGw: '203.0.113.10', peer: 'hq-core',     status: 'up',   phase1: 'ok', phase2: 'ok',   uptimeSec: 950_400,   bytesIn: 12_894_220_110, bytesOut: 8_204_410_220 },
    { id: 'br-spk-to-hq',   name: 'br-spk-to-hq',   localGw: '10.1.3.1',  remoteGw: '203.0.113.10', peer: 'hq-core',     status: 'up',   phase1: 'ok', phase2: 'ok',   uptimeSec: 1_382_400, bytesIn: 20_204_118_330, bytesOut: 14_108_220_420 },
    { id: 'br-boi-to-hq',   name: 'br-boi-to-hq',   localGw: '10.1.4.1',  remoteGw: '203.0.113.10', peer: 'hq-core',     status: 'down', phase1: 'fail', phase2: '—',  uptimeSec: 0,         bytesIn: 0, bytesOut: 0, downSince: minsAgo(120), note: 'Peer unreachable - device offline' },
    { id: 'br-pdx-to-hq',   name: 'br-pdx-to-hq',   localGw: '10.1.5.1',  remoteGw: '203.0.113.10', peer: 'hq-core',     status: 'up',   phase1: 'ok', phase2: 'ok',   uptimeSec: 604_800,   bytesIn: 18_204_110_220, bytesOut: 9_204_210_330 },
    { id: 'ot-plant-01-to-dmz', name: 'ot-plant-01-to-dmz', localGw: '10.2.1.1', remoteGw: '203.0.113.20', peer: 'hq-dmz',  status: 'up',   phase1: 'ok', phase2: 'ok',   uptimeSec: 1_728_000, bytesIn: 4_118_204_210, bytesOut: 2_810_124_330 },
    { id: 'ot-plant-07a-to-dmz', name: 'ot-plant-07a-to-dmz', localGw: '10.2.7.1', remoteGw: '203.0.113.20', peer: 'hq-dmz', status: 'down', phase1: 'fail', phase2: '—',  uptimeSec: 0,         bytesIn: 0, bytesOut: 0, downSince: minsAgo(18), note: 'Peer IKE negotiation failed' },
    { id: 'azure-wus2',     name: 'azure-wus2',     localGw: '10.0.0.10', remoteGw: '40.91.42.18',  peer: 'azure-gw',    status: 'up',   phase1: 'ok', phase2: 'ok',   uptimeSec: 2_419_200, bytesIn: 102_404_220_110, bytesOut: 58_204_110_220 },
  ];
}

function sslVpnSessions() {
  const users = ['tharris','tgage','mstevens','kwatson','jlee','pnguyen','rwhite','areed','bstone','cbrown','dmorris','eharper','fgarcia'];
  const sessions = [];
  users.forEach((user, i) => {
    sessions.push({
      id: 1000 + i,
      user,
      group: user.startsWith('t') ? 'admins' : user.startsWith('m') ? 'engineers' : 'employees',
      sourceIp: `72.${120 + (i % 40)}.${10 + i * 3}.${20 + i * 7 % 200}`,
      assignedIp: `10.200.0.${10 + i}`,
      connectedAt: minsAgo(15 + i * 32),
      bytesIn:  Math.floor(10_000_000 + Math.random() * 500_000_000),
      bytesOut: Math.floor( 5_000_000 + Math.random() * 200_000_000),
      mfa: true,
    });
  });
  return { active: sessions.length, sessions };
}

// ---------- HA clusters ----------------------------------------------------

function haClustersDetailed() {
  return [
    { name: 'hq-core',     mode: 'A/P', status: 'ok',      primary: 'hq-core-01',  secondary: 'hq-core-02',  heartbeatAgeMs: 812,  syncState: 'in-sync', uptimeSec: 8_294_400, lastFailover: daysAgo(47), override: false, primarySerial: 'FGT100FTK20001234', secondarySerial: 'FGT100FTK20001235' },
    { name: 'hq-dist',     mode: 'A/A', status: 'ok',      primary: 'hq-dist-01',  secondary: 'hq-dist-02',  heartbeatAgeMs: 720,  syncState: 'in-sync', uptimeSec: 8_294_400, lastFailover: daysAgo(112), override: false, primarySerial: 'FGT100FTK20002234', secondarySerial: 'FGT100FTK20002235' },
    { name: 'hq-dmz',      mode: 'A/P', status: 'ok',      primary: 'hq-dmz-01',   secondary: 'hq-dmz-02',   heartbeatAgeMs: 680,  syncState: 'in-sync', uptimeSec: 5_184_000, lastFailover: daysAgo(203), override: false, primarySerial: 'FGT200FTK20003234', secondarySerial: 'FGT200FTK20003235' },
    { name: 'br-sea',      mode: 'A/P', status: 'warning', primary: 'br-sea-01',   secondary: 'br-sea-02',   heartbeatAgeMs: 4820, syncState: 'lag',     uptimeSec: 1_296_000, lastFailover: daysAgo(18),  override: false, primarySerial: 'FGT60FTK21004234',  secondarySerial: 'FGT60FTK21004235',  note: '3 heartbeats missed - hb link unstable' },
    { name: 'br-tac',      mode: 'A/P', status: 'ok',      primary: 'br-tac-01',   secondary: 'br-tac-02',   heartbeatAgeMs: 820,  syncState: 'in-sync', uptimeSec: 2_592_000, lastFailover: daysAgo(74),  override: false, primarySerial: 'FGT60FTK21005234',  secondarySerial: 'FGT60FTK21005235' },
    { name: 'br-spk',      mode: 'A/P', status: 'ok',      primary: 'br-spk-01',   secondary: 'br-spk-02',   heartbeatAgeMs: 912,  syncState: 'in-sync', uptimeSec: 2_592_000, lastFailover: daysAgo(89),  override: false, primarySerial: 'FGT60FTK21006234',  secondarySerial: 'FGT60FTK21006235' },
    { name: 'ot-plant-01', mode: 'A/P', status: 'ok',      primary: 'ot-plant-01a', secondary: 'ot-plant-01b', heartbeatAgeMs: 720,  syncState: 'in-sync', uptimeSec: 4_320_000, lastFailover: daysAgo(221), override: false, primarySerial: 'FGT70FTK22001234', secondarySerial: 'FGT70FTK22001235' },
    { name: 'ot-plant-05', mode: 'A/P', status: 'warning', primary: 'ot-plant-05a', secondary: 'ot-plant-05b', heartbeatAgeMs: 12800, syncState: 'lag',     uptimeSec: 2_160_000, lastFailover: daysAgo(4),   override: true,  primarySerial: 'FGT70FTK22005234', secondarySerial: 'FGT70FTK22005235', note: 'Override enabled after manual failover' },
  ];
}

// ---------- Threats --------------------------------------------------------

function threatEvents() {
  // Realistic event log. ~40 rows across categories / severities.
  const sigs = [
    { name: 'Log4j.RCE',          cat: 'IPS',       sev: 'critical', proto: 'tcp', port: 443 },
    { name: 'Agent.Tesla',        cat: 'AV',        sev: 'high',     proto: 'tcp', port: 587 },
    { name: 'Malicious.URL',      cat: 'WebFilter', sev: 'medium',   proto: 'tcp', port: 443 },
    { name: 'Emotet.C2',          cat: 'IPS',       sev: 'high',     proto: 'tcp', port: 8443 },
    { name: 'Cobalt.Strike',      cat: 'IPS',       sev: 'critical', proto: 'tcp', port: 50050 },
    { name: 'SQLi.Attempt',       cat: 'IPS',       sev: 'high',     proto: 'tcp', port: 80 },
    { name: 'Phishing.Kit',       cat: 'WebFilter', sev: 'medium',   proto: 'tcp', port: 443 },
    { name: 'CryptoMiner.Pool',   cat: 'AppCtrl',   sev: 'medium',   proto: 'tcp', port: 3333 },
    { name: 'Tor.Exit',           cat: 'WebFilter', sev: 'low',      proto: 'tcp', port: 9001 },
    { name: 'RDP.Bruteforce',     cat: 'IPS',       sev: 'high',     proto: 'tcp', port: 3389 },
  ];
  const srcs = ['91.204.10.42','203.0.113.77','198.51.100.12','45.142.214.33','192.0.2.88','185.244.25.19','5.188.206.140','94.102.49.193','62.171.183.41','146.19.24.8'];
  const dsts = ['hq-core-01','hq-dmz-01','br-sea-01','br-tac-01','ot-plant-01a','hq-ext-01','br-pdx-01'];
  const events = [];
  for (let i = 0; i < 40; i++) {
    const s = sigs[i % sigs.length];
    const src = srcs[i % srcs.length];
    const dst = dsts[i % dsts.length];
    events.push({
      id: 2000 + i,
      at: minsAgo(i * 3 + 1),
      action: 'block',
      signature: s.name,
      category: s.cat,
      severity: s.sev,
      sourceIp: src,
      sourceCountry: ['RU','NL','US','BR','CN','UA','DE','SG','VN','IN'][i % 10],
      destIp: `10.0.${10 + (i % 4)}.${10 + (i % 8)}`,
      destHost: dst,
      protocol: s.proto,
      port: s.port,
    });
  }
  return events;
}

function threatTopSources() {
  return [
    { ip: '91.204.10.42',   country: 'RU', count: 284, uniqueTargets: 12 },
    { ip: '203.0.113.77',   country: 'NL', count: 192, uniqueTargets: 8 },
    { ip: '45.142.214.33',  country: 'BR', count: 148, uniqueTargets: 5 },
    { ip: '185.244.25.19',  country: 'UA', count: 121, uniqueTargets: 4 },
    { ip: '5.188.206.140',  country: 'RU', count: 98,  uniqueTargets: 6 },
    { ip: '94.102.49.193',  country: 'NL', count: 84,  uniqueTargets: 3 },
    { ip: '62.171.183.41',  country: 'DE', count: 71,  uniqueTargets: 2 },
    { ip: '146.19.24.8',    country: 'SG', count: 58,  uniqueTargets: 2 },
  ];
}

function threatTopTargets() {
  return [
    { host: 'hq-ext-01',    ip: '10.0.0.5',   count: 412, categories: ['IPS','WebFilter'] },
    { host: 'hq-core-01',   ip: '10.0.0.1',   count: 298, categories: ['IPS','AV'] },
    { host: 'hq-dmz-01',    ip: '10.0.10.1',  count: 214, categories: ['IPS','WebFilter'] },
    { host: 'br-sea-01',    ip: '10.1.1.1',   count: 182, categories: ['IPS'] },
    { host: 'br-pdx-01',    ip: '10.1.5.1',   count: 108, categories: ['AV','WebFilter'] },
    { host: 'ot-plant-01a', ip: '10.2.1.1',   count: 84,  categories: ['IPS'] },
    { host: 'br-tac-01',    ip: '10.1.2.1',   count: 52,  categories: ['WebFilter'] },
  ];
}

// ---------- Admin audit ----------------------------------------------------

function adminAuditLog() {
  const ACTIONS = ['login','logout','login-fail','policy-edit','object-create','install','script-run','config-export','password-change','mfa-challenge'];
  const ADMINS = ['tanner','tiffany','mike','system','tanner','tiffany'];
  const RESULTS = ['success','success','success','success','success','fail'];
  const TARGETS = ['fmg-web-ui','BranchPolicy','CORP-VLANS','HQ-Core','hardening-v2','OT-Baseline','PRINTERS','br-sea-01','DMZ-Outbound'];
  const IPS = ['10.0.10.50','10.0.10.51','10.0.10.52','-','10.0.10.50','10.0.10.53'];

  const rows = [];
  for (let i = 0; i < 60; i++) {
    const action = ACTIONS[i % ACTIONS.length];
    const admin = action === 'login-fail' ? 'unknown' : ADMINS[i % ADMINS.length];
    const result = action === 'login-fail' ? 'fail' : RESULTS[i % RESULTS.length];
    rows.push({
      id: 5000 + i,
      at: minsAgo(i * 14 + 2),
      admin,
      ip: action === 'login-fail' ? ['203.0.113.9','198.51.100.42'][i % 2] : IPS[i % IPS.length],
      action,
      target: action.startsWith('login') ? 'fmg-web-ui' : TARGETS[i % TARGETS.length],
      result,
      detail: action === 'policy-edit' ? 'added rule 47' :
              action === 'install' ? 'deployed to 6 devices' :
              action === 'login-fail' ? 'bad password · admin user' :
              action === 'config-export' ? 'exported device config' :
              null,
    });
  }
  return rows;
}

module.exports = {
  sdwanOverlayDetail,
  vpnIpsecTunnels,
  sslVpnSessions,
  haClustersDetailed,
  threatEvents,
  threatTopSources,
  threatTopTargets,
  adminAuditLog,
  policyObjects,
  policyProfiles,
  atRisk,
  deviceDetail,
  scriptLibrary,
  scriptRuns,
  settings,
  policyPackageDetail,
  policyObjectDetail,
  policyProfileDetail,
};

// ---------- Policy package detail ------------------------------------------

const PACKAGE_RULE_LIBRARY = {
  HQ: [
    { id: 1,  name: 'Allow-HTTPS-Out',         src: 'CORP-VLANS',     dst: 'all',              service: 'HTTPS',   action: 'accept', hits: 1_240_821, enabled: true,  profiles: ['strict-corp','corp-ips','corp-wf'] },
    { id: 2,  name: 'Allow-DNS-Out',           src: 'CORP-VLANS',     dst: 'all',              service: 'DNS',     action: 'accept', hits: 890_012,   enabled: true,  profiles: ['default'] },
    { id: 3,  name: 'Allow-Office365',         src: 'CORP-VLANS',     dst: 'EXT-MICROSOFT365', service: 'HTTPS',   action: 'accept', hits: 2_104_444, enabled: true,  profiles: ['strict-corp','corp-ips'] },
    { id: 4,  name: 'Block-Tor-Outbound',      src: 'CORP-VLANS',     dst: 'BLACKLIST-TOR',    service: 'all',     action: 'deny',   hits: 482,       enabled: true },
    { id: 5,  name: 'Allow-Github',            src: 'CORP-VLANS',     dst: 'EXT-GITHUB',       service: 'HTTPS',   action: 'accept', hits: 184_201,   enabled: true,  profiles: ['strict-corp'] },
    { id: 12, name: 'SSL-VPN-Portal',          src: 'all',            dst: 'VIP-SSL-VPN',      service: 'HTTPS',   action: 'accept', hits: 48_210,    enabled: true,  profiles: ['ssl-vpn-policy'] },
    { id: 18, name: 'Admin-Management',        src: 'MGMT-JUMPHOST',  dst: 'all',              service: 'SSH',     action: 'accept', hits: 1_202,     enabled: true },
    { id: 23, name: 'Block-P2P',               src: 'CORP-VLANS',     dst: 'all',              service: 'all',     action: 'deny',   hits: 88_401,    enabled: true,  profiles: ['corp-apps'] },
    { id: 24, name: 'OT-Corp-Exception',       src: 'CORP-VLANS',     dst: 'OT-HISTORIAN',     service: 'HTTPS',   action: 'accept', hits: 12_048,    enabled: true },
    { id: 32, name: 'Deny-Legacy-SMB',         src: 'all',            dst: 'all',              service: 'SMB',     action: 'deny',   hits: 2_104,     enabled: true },
    { id: 45, name: 'Log-Everything-Default',  src: 'all',            dst: 'all',              service: 'all',     action: 'deny',   hits: 18_402,    enabled: true },
  ],
  Branch: [
    { id: 1,  name: 'LocalPrintServer',        src: 'CORP-VLAN-30-PRINTERS', dst: 'all',         service: 'all',   action: 'accept', hits: 98_421,  enabled: true },
    { id: 2,  name: 'Block-Cross-Branch',      src: 'all',                   dst: 'all',         service: 'all',   action: 'deny',   hits: 4_820,   enabled: true },
    { id: 3,  name: 'Allow-HTTPS-Out',         src: 'CORP-VLANS',            dst: 'all',         service: 'HTTPS', action: 'accept', hits: 484_210, enabled: true,  profiles: ['corp-wf','corp-ips'] },
    { id: 4,  name: 'Allow-DNS-Out',           src: 'CORP-VLANS',            dst: 'all',         service: 'DNS',   action: 'accept', hits: 210_040, enabled: true },
    { id: 8,  name: 'Allow-VoIP-Out',          src: 'CORP-VLAN-20-VOICE',    dst: 'all',         service: 'all',   action: 'accept', hits: 48_210,  enabled: true,  profiles: ['default'] },
    { id: 12, name: 'Guest-WiFi-Isolation',    src: 'GUEST-WIFI',            dst: 'CORP-VLANS',  service: 'all',   action: 'deny',   hits: 840,     enabled: true },
    { id: 18, name: 'Block-Tor-Outbound',      src: 'CORP-VLANS',            dst: 'BLACKLIST-TOR', service: 'all', action: 'deny',   hits: 120,     enabled: true },
  ],
  OT: [
    { id: 1,  name: 'Corp-to-L3-Historian',    src: 'CORP-VLANS',   dst: 'OT-HISTORIAN', service: 'HTTPS',  action: 'accept', hits: 12_048,  enabled: true, profiles: ['ot-ips'] },
    { id: 2,  name: 'L3-to-L2-Modbus',         src: 'OT-HISTORIAN', dst: 'OT-SCADA-ALL', service: 'MODBUS', action: 'accept', hits: 8_204,   enabled: true, profiles: ['ot-ips'] },
    { id: 3,  name: 'Deny-Corp-to-SCADA',      src: 'CORP-VLANS',   dst: 'OT-SCADA-ALL', service: 'all',    action: 'deny',   hits: 421,     enabled: true },
    { id: 8,  name: 'Block-Internet-from-OT',  src: 'OT-SCADA-ALL', dst: 'all',          service: 'all',    action: 'deny',   hits: 12,      enabled: true },
    { id: 12, name: 'Scada-to-PLC',            src: 'OT-SCADA-ALL', dst: 'OT-PLC-ALL',   service: 'MODBUS', action: 'accept', hits: 240_018, enabled: true, profiles: ['ot-ips'] },
  ],
  DMZ: [
    { id: 1, name: 'Inbound-Web',              src: 'all',             dst: 'DMZ-WEB-SERVERS', service: 'HTTPS', action: 'accept', hits: 840_201, enabled: true, profiles: ['dmz-ips','waf'] },
    { id: 2, name: 'DMZ-to-Corp-DB',           src: 'DMZ-WEB-SERVERS', dst: 'CORP-DB',         service: 'MSSQL', action: 'accept', hits: 120_420, enabled: true, profiles: ['dmz-ips'] },
    { id: 3, name: 'Block-DMZ-Outbound',       src: 'DMZ-WEB-SERVERS', dst: 'all',             service: 'all',   action: 'deny',   hits: 18_402,  enabled: true },
  ],
  Partner: [
    { id: 1, name: 'Partner-Access-ACME',      src: 'PARTNER-ACME',   dst: 'DMZ-WEB-SERVERS', service: 'HTTPS', action: 'accept', hits: 4_820, enabled: true, profiles: ['dmz-ips'] },
    { id: 2, name: 'Partner-Access-Globex',    src: 'PARTNER-GLOBEX', dst: 'DMZ-WEB-SERVERS', service: 'HTTPS', action: 'accept', hits: 2_104, enabled: true, profiles: ['dmz-ips'] },
    { id: 3, name: 'Deny-Partner-Cross-Corp',  src: 'PARTNER-ALL',    dst: 'CORP-VLANS',      service: 'all',   action: 'deny',   hits: 120,   enabled: true },
  ],
};

const PACKAGE_DESCRIPTIONS = {
  'HQ-Core':          { desc: 'Baseline firewall policy for HQ core and distribution',                         bucket: 'HQ' },
  'BranchPolicy':     { desc: 'Standard branch policy - PNW and Intermountain sites',                          bucket: 'Branch' },
  'BranchPolicy-Std': { desc: 'Branch policy for smaller sites - lighter ruleset with stricter defaults',      bucket: 'Branch' },
  'OT-Baseline':      { desc: 'Segmented OT policy - Purdue Model enforcement, MODBUS/DNP3 monitoring',        bucket: 'OT' },
  'OT-HighRisk':      { desc: 'High-risk OT plants with stricter segmentation - block-all-else baseline',      bucket: 'OT' },
  'DMZ-Outbound':     { desc: 'DMZ perimeter policy - inbound web + DB egress with WAF profiles attached',     bucket: 'DMZ' },
  'Partner-Extranet': { desc: 'Partner extranet policy - explicit-only access from partner VLANs',             bucket: 'Partner' },
};

function policyPackageDetail(packageName) {
  const list = require('./mockData').policyPackages();
  const listEntry = list.find((p) => p.name === packageName);
  if (!listEntry) return null;
  const meta = PACKAGE_DESCRIPTIONS[packageName] || { desc: `Policy package - ${listEntry.rules} rules`, bucket: 'Branch' };
  const rules = PACKAGE_RULE_LIBRARY[meta.bucket] || PACKAGE_RULE_LIBRARY.Branch;
  const nameHash = packageName.length;
  const installHistory = [
    { at: listEntry.lastInstalled,           result: 'success', devices: listEntry.devices.length,          duration: 35 + (nameHash % 20), by: listEntry.modifiedBy },
    { at: daysAgo(3 + (nameHash % 5)),       result: 'success', devices: listEntry.devices.length,          duration: 38 + (nameHash % 12), by: listEntry.modifiedBy },
    { at: daysAgo(12 + (nameHash % 7)),      result: 'success', devices: listEntry.devices.length,          duration: 44, by: 'tiffany' },
    { at: daysAgo(28 + (nameHash % 9)),      result: 'partial', devices: listEntry.devices.length,          duration: 68, by: 'tanner', note: '1 device skipped: offline at install time' },
    { at: daysAgo(52),                       result: 'success', devices: Math.max(1, listEntry.devices.length - 1), duration: 33, by: 'tanner' },
  ];
  return {
    name: listEntry.name,
    description: meta.desc,
    assignedDevices: listEntry.devices,
    lastInstall: listEntry.lastInstalled,
    ruleCount: listEntry.rules,
    rules,
    installHistory,
  };
}

// ---------- Policy object detail (usedBy) ---------------------------------

function policyObjectDetail(objectName) {
  // Return a usedBy list showing which policies/rules reference this object
  const USED_BY = {
    'CORP-VLANS': [
      { pkg: 'HQ-Core', ruleId: 1,  ruleName: 'Allow-HTTPS-Out',           role: 'src' },
      { pkg: 'HQ-Core', ruleId: 2,  ruleName: 'Allow-DNS-Out',             role: 'src' },
      { pkg: 'HQ-Core', ruleId: 3,  ruleName: 'Allow-Office365',           role: 'src' },
      { pkg: 'HQ-Core', ruleId: 4,  ruleName: 'Block-Tor-Outbound',        role: 'src' },
      { pkg: 'HQ-Core', ruleId: 5,  ruleName: 'Allow-Github',              role: 'src' },
      { pkg: 'HQ-Core', ruleId: 23, ruleName: 'Block-P2P',                 role: 'src' },
      { pkg: 'HQ-Core', ruleId: 24, ruleName: 'OT-Corp-Exception',         role: 'src' },
      { pkg: 'OT-Baseline',     ruleId: 1,  ruleName: 'Corp-to-L3-Historian',      role: 'src' },
      { pkg: 'OT-Baseline',     ruleId: 3,  ruleName: 'Deny-Corp-to-SCADA',        role: 'src' },
    ],
    'OT-HISTORIAN': [
      { pkg: 'HQ-Core', ruleId: 24, ruleName: 'OT-Corp-Exception',    role: 'dst' },
      { pkg: 'OT-Baseline',     ruleId: 1,  ruleName: 'Corp-to-L3-Historian', role: 'dst' },
      { pkg: 'OT-Baseline',     ruleId: 2,  ruleName: 'L3-to-L2-Modbus',      role: 'src' },
    ],
    'MODBUS': [
      { pkg: 'OT-Baseline', ruleId: 2,  ruleName: 'L3-to-L2-Modbus',    role: 'service' },
      { pkg: 'OT-Baseline', ruleId: 12, ruleName: 'Scada-to-PLC',       role: 'service' },
    ],
    'HTTPS': [
      { pkg: 'HQ-Core', ruleId: 1,  ruleName: 'Allow-HTTPS-Out',    role: 'service' },
      { pkg: 'HQ-Core', ruleId: 3,  ruleName: 'Allow-Office365',    role: 'service' },
      { pkg: 'HQ-Core', ruleId: 5,  ruleName: 'Allow-Github',       role: 'service' },
      { pkg: 'HQ-Core', ruleId: 12, ruleName: 'SSL-VPN-Portal',     role: 'service' },
      { pkg: 'HQ-Core', ruleId: 28, ruleName: 'Partner-Access-ACME', role: 'service' },
    ],
    'VIP-WEB': [
      { pkg: 'HQ-Core', ruleId: 28, ruleName: 'Partner-Access-ACME', role: 'dst' },
      { pkg: 'DMZ-Outbound',       ruleId: 2,  ruleName: 'Web-Inbound',         role: 'dst' },
    ],
    'EXT-MICROSOFT365': [
      { pkg: 'HQ-Core', ruleId: 3, ruleName: 'Allow-Office365', role: 'dst' },
    ],
  };

  // Generic fallback: return empty list
  return USED_BY[objectName] || [];
}

// ---------- Policy profile detail -----------------------------------------

function policyProfileDetail(profileType, profileName) {
  // For IPS profiles return signature categories
  // For AV return engine details
  // For web filter return category list

  const IPS_SIGNATURES = {
    'default-ips': [
      { id: 'sig-12480', name: 'SSLVPN.Authentication.Bypass',     severity: 'critical', action: 'block',   status: 'enabled' },
      { id: 'sig-14012', name: 'Log4j.Log4Shell.RCE',              severity: 'critical', action: 'block',   status: 'enabled' },
      { id: 'sig-14420', name: 'Fortinet.FortiOS.Admin.Bypass',    severity: 'critical', action: 'block',   status: 'enabled' },
      { id: 'sig-08201', name: 'SQL.Injection.Generic',            severity: 'high',     action: 'block',   status: 'enabled' },
      { id: 'sig-08345', name: 'XSS.Reflected.Generic',            severity: 'high',     action: 'monitor', status: 'enabled' },
      { id: 'sig-09102', name: 'RDP.Bruteforce',                   severity: 'high',     action: 'block',   status: 'enabled' },
      { id: 'sig-09412', name: 'SSH.Bruteforce',                   severity: 'medium',   action: 'block',   status: 'enabled' },
      { id: 'sig-10012', name: 'Scanner.Nmap.SYN',                 severity: 'low',      action: 'monitor', status: 'enabled' },
    ],
    'ot-ips': [
      { id: 'sig-20140', name: 'Modbus.Unauthorized.Write.Coil',    severity: 'critical', action: 'block',    status: 'enabled' },
      { id: 'sig-20141', name: 'Modbus.Unauthorized.Write.Register', severity: 'critical', action: 'block',   status: 'enabled' },
      { id: 'sig-20142', name: 'Modbus.Function.Code.Anomaly',     severity: 'high',     action: 'monitor', status: 'enabled' },
      { id: 'sig-20240', name: 'DNP3.Unauthorized.Control',        severity: 'critical', action: 'block',   status: 'enabled' },
      { id: 'sig-20340', name: 'BACnet.Write.Property',            severity: 'high',     action: 'monitor', status: 'enabled' },
      { id: 'sig-20440', name: 'OPC-UA.Discovery.Scan',            severity: 'medium',   action: 'monitor', status: 'enabled' },
      { id: 'sig-20540', name: 'S7Comm.Stop.CPU',                  severity: 'critical', action: 'block',   status: 'enabled' },
    ],
    'corp-ips': [
      { id: 'sig-12480', name: 'SSLVPN.Authentication.Bypass',     severity: 'critical', action: 'block',    status: 'enabled' },
      { id: 'sig-14012', name: 'Log4j.Log4Shell.RCE',              severity: 'critical', action: 'block',    status: 'enabled' },
      { id: 'sig-08201', name: 'SQL.Injection.Generic',            severity: 'high',     action: 'block',    status: 'enabled' },
      { id: 'sig-15201', name: 'Cobalt.Strike.Beacon',             severity: 'critical', action: 'block',    status: 'enabled' },
      { id: 'sig-15202', name: 'Emotet.Trojan.C2',                 severity: 'high',     action: 'block',    status: 'enabled' },
      { id: 'sig-15203', name: 'Agent.Tesla.Infostealer',          severity: 'high',     action: 'block',    status: 'enabled' },
      { id: 'sig-10012', name: 'Scanner.Nmap.SYN',                 severity: 'low',      action: 'block',    status: 'enabled' },
    ],
  };

  const WEB_CATEGORIES = {
    'corp-wf': [
      { name: 'Adult / Mature',       action: 'block',   count: 14 },
      { name: 'Malicious Websites',   action: 'block',   count: 8 },
      { name: 'Phishing',             action: 'block',   count: 4 },
      { name: 'Botnet C&C',           action: 'block',   count: 3 },
      { name: 'Proxy Avoidance',      action: 'block',   count: 6 },
      { name: 'Social Networking',    action: 'allow',   count: 12 },
      { name: 'Streaming Media',      action: 'warn',    count: 9 },
      { name: 'News & Media',         action: 'allow',   count: 18 },
    ],
    'strict-wf': [
      { name: 'Adult / Mature',       action: 'block',   count: 14 },
      { name: 'Malicious Websites',   action: 'block',   count: 8 },
      { name: 'Phishing',             action: 'block',   count: 4 },
      { name: 'Botnet C&C',           action: 'block',   count: 3 },
      { name: 'Proxy Avoidance',      action: 'block',   count: 6 },
      { name: 'Social Networking',    action: 'block',   count: 12 },
      { name: 'Streaming Media',      action: 'block',   count: 9 },
      { name: 'Gaming',               action: 'block',   count: 8 },
      { name: 'Shopping',             action: 'warn',    count: 14 },
    ],
  };

  // Return what makes sense for the profile type
  if (profileType === 'ips') {
    return { signatures: IPS_SIGNATURES[profileName] || IPS_SIGNATURES['default-ips'] };
  }
  if (profileType === 'webFilter') {
    return { categories: WEB_CATEGORIES[profileName] || WEB_CATEGORIES['corp-wf'] };
  }
  if (profileType === 'antivirus') {
    return {
      engineStats: { patternVersion: '12.0.458', lastUpdated: hoursAgo(1), vendor: 'FortiGuard' },
      protocols: [
        { name: 'HTTP',  scan: 'enabled',  action: 'block' },
        { name: 'HTTPS', scan: 'enabled',  action: 'block' },
        { name: 'SMTP',  scan: 'enabled',  action: 'block' },
        { name: 'IMAP',  scan: 'enabled',  action: 'block' },
        { name: 'POP3',  scan: 'enabled',  action: 'block' },
        { name: 'FTP',   scan: 'enabled',  action: 'block' },
        { name: 'CIFS',  scan: 'disabled', action: 'none' },
      ],
    };
  }
  if (profileType === 'appControl') {
    return {
      categories: [
        { name: 'P2P / File Sharing',  action: 'block',   count: 24 },
        { name: 'Games',                action: 'block',   count: 12 },
        { name: 'Remote Access Tools',  action: 'block',   count: 18 },
        { name: 'Proxy',                action: 'block',   count: 8 },
        { name: 'Social',               action: 'monitor', count: 15 },
        { name: 'Business Apps',        action: 'allow',   count: 42 },
      ],
    };
  }
  if (profileType === 'sslInspect') {
    return {
      mode: 'deep-inspection',
      certAuthority: 'corp-ca',
      exemptCategories: ['Finance and Banking', 'Health and Medicine', 'Personal Privacy'],
    };
  }
  if (profileType === 'dlp') {
    return {
      patterns: [
        { name: 'US Social Security Number', pattern: '\\d{3}-\\d{2}-\\d{4}',    action: 'block' },
        { name: 'Credit Card (Luhn)',         pattern: 'luhn-match',              action: 'block' },
        { name: 'US Passport',                pattern: '[A-Z][0-9]{8}',           action: 'block' },
        { name: 'Driver License',             pattern: '[A-Z]\\d{7}',             action: 'monitor' },
      ],
    };
  }
  return {};
}

// ---------- Scripts -------------------------------------------------------

function scriptLibrary() {
  return [
    {
      id: 'scr-001',
      name: 'enable-ssh-syslog',
      type: 'CLI',
      description: 'Enables central SSH logging to syslog server on all selected devices',
      body: [
        'config log syslogd setting',
        '    set status enable',
        '    set server "10.0.10.50"',
        '    set mode reliable',
        '    set port 514',
        '    set facility local7',
        'end',
      ].join('\n'),
      lastRun: daysAgo(3),
      runCount: 47,
      tags: ['logging','compliance'],
    },
    {
      id: 'scr-002',
      name: 'disable-admin-telnet',
      type: 'CLI',
      description: 'Hardens admin access: disables Telnet and HTTP, enforces HTTPS + SSH only',
      body: [
        'config system global',
        '    set admin-telnet disable',
        '    set admin-http disable',
        '    set admintimeout 10',
        'end',
        'config system interface',
        '    edit "mgmt"',
        '        set allowaccess ping ssh https',
        '    next',
        'end',
      ].join('\n'),
      lastRun: daysAgo(12),
      runCount: 82,
      tags: ['hardening','baseline'],
    },
    {
      id: 'scr-003',
      name: 'update-dns-servers',
      type: 'CLI',
      description: 'Sets primary + secondary DNS to corporate resolvers',
      body: [
        'config system dns',
        '    set primary 10.0.10.53',
        '    set secondary 10.0.10.54',
        '    set domain "corp.local"',
        'end',
      ].join('\n'),
      lastRun: daysAgo(45),
      runCount: 47,
      tags: ['network'],
    },
    {
      id: 'scr-004',
      name: 'ot-baseline-hardening',
      type: 'CLI',
      description: 'OT-specific baseline: disables FortiCare upload, FortiGuard, and IPsec IKE v1',
      body: [
        'config system central-management',
        '    set include-default-servers disable',
        'end',
        'config system global',
        '    set fortitoken-cloud disable',
        '    set ike-policy-route disable',
        'end',
      ].join('\n'),
      lastRun: daysAgo(7),
      runCount: 16,
      tags: ['ot','hardening','compliance'],
    },
    {
      id: 'scr-005',
      name: 'diag-tech-support',
      type: 'TCL',
      description: 'Gathers diag logs, sessions, routing table, and interface stats into a single archive',
      body: [
        '#!/bin/tcl',
        'puts "=== Gathering diagnostic info ==="',
        'exec "diagnose sys top 1 1"',
        'exec "get system performance status"',
        'exec "diagnose netlink interface list"',
        'exec "get router info routing-table all"',
        'exec "diagnose sys session list"',
        'puts "=== Done - upload archive manually ==="',
      ].join('\n'),
      lastRun: hoursAgo(2),
      runCount: 214,
      tags: ['diagnostic','support'],
    },
    {
      id: 'scr-006',
      name: 'block-tor-exit-nodes',
      type: 'CLI',
      description: 'Creates address group from FortiGuard Tor feed and applies to outbound deny',
      body: [
        'config firewall address',
        '    edit "Tor-Exits"',
        '        set type dynamic',
        '        set sub-type fortiguard',
        '        set fsso-group "tor-exit-nodes"',
        '    next',
        'end',
      ].join('\n'),
      lastRun: daysAgo(21),
      runCount: 47,
      tags: ['security','threat-blocking'],
    },
  ];
}

function scriptRuns() {
  return [
    { id: 'run-901', scriptId: 'scr-005', script: 'diag-tech-support',        device: 'ot-plant-05a', startedAt: hoursAgo(2),  duration: 14, result: 'success' },
    { id: 'run-900', scriptId: 'scr-001', script: 'enable-ssh-syslog',        device: 'br-sea-01',    startedAt: daysAgo(3),   duration: 4,  result: 'success' },
    { id: 'run-899', scriptId: 'scr-001', script: 'enable-ssh-syslog',        device: 'br-tac-01',    startedAt: daysAgo(3),   duration: 3,  result: 'success' },
    { id: 'run-898', scriptId: 'scr-004', script: 'ot-baseline-hardening',    device: 'ot-plant-03a', startedAt: daysAgo(7),   duration: 8,  result: 'success' },
    { id: 'run-897', scriptId: 'scr-004', script: 'ot-baseline-hardening',    device: 'ot-plant-07a', startedAt: daysAgo(7),   duration: 0,  result: 'fail', error: 'Device offline, no response to connect' },
    { id: 'run-896', scriptId: 'scr-002', script: 'disable-admin-telnet',     device: 'br-pdx-01',    startedAt: daysAgo(12),  duration: 2,  result: 'success' },
    { id: 'run-895', scriptId: 'scr-003', script: 'update-dns-servers',       device: 'hq-core-01',   startedAt: daysAgo(45),  duration: 1,  result: 'success' },
    { id: 'run-894', scriptId: 'scr-006', script: 'block-tor-exit-nodes',     device: 'hq-ext-01',    startedAt: daysAgo(21),  duration: 5,  result: 'success' },
  ];
}

// ---------- Settings -------------------------------------------------------

function settings() {
  return {
    fmg: {
      hostname: 'fmg-prod.corp.local',
      ipAddress: '10.0.10.100',
      version: '7.6.6-build0458 GA',
      serial: 'FMG-VMTM24001234',
      uptime: '47d 12h',
      mode: 'Standalone',
      timezone: 'America/Los_Angeles',
      ntp: ['time.cloudflare.com','pool.ntp.org'],
    },
    adoms: [
      { name: 'root',       devices: 49, pkgs: 8, status: 'active' },
      { name: 'Fabric',     devices: 47, pkgs: 6, status: 'active' },
      { name: 'OT-Isolated', devices: 16, pkgs: 3, status: 'active' },
    ],
    about: {
      product: 'FMG Console',
      version: '0.6.0',
      channel: 'dev',
      commit: 'abc1234',
      apiBase: '/api',
      docs: 'https://docs.fortinet.com/document/fortimanager/8.0.0/api-best-practices',
    },
  };
}

// ---------- At Risk panel --------------------------------------------------

function atRisk() {
  return [
    {
      id: 'ar-1',
      severity: 'critical',
      title: 'CVE-2026-0142 unpatched — SSL-VPN heap overflow',
      context: 'Affects br-sea-01, br-boi-01, ot-plant-07a · pre-auth RCE · fixed in 7.6.6',
      action: { label: 'Plan upgrade', to: '/security/cve?id=CVE-2026-0142' },
      category: 'cve',
    },
    {
      id: 'ar-2',
      severity: 'high',
      title: 'ot-plant-07a offline — plant floor controller',
      context: 'Down 18m · HA failed over to ot-plant-07b · IPsec to DMZ failing IKE negotiation',
      action: { label: 'Investigate', to: '/devices/ot-plant-07a' },
      category: 'device',
    },
    {
      id: 'ar-3',
      severity: 'high',
      title: 'br-boi-to-hq IPsec tunnel down',
      context: 'Peer unreachable 2h · br-boi-01 offline · 47 users behind this branch affected',
      action: { label: 'Diagnose', to: '/fabric/vpn' },
      category: 'vpn',
    },
    {
      id: 'ar-4',
      severity: 'medium',
      title: 'Policy drift on br-sea — 4 rules modified locally',
      context: 'Rules 12, 18, 24, 47 edited on device, not in FMG · last sync 8h ago',
      action: { label: 'Review diff', to: '/security/drift' },
      category: 'drift',
    },
    {
      id: 'ar-5',
      severity: 'medium',
      title: 'br-sea HA heartbeat unstable — 3 missed in 5m',
      context: 'Primary/secondary in-sync but hb link flapping · could trigger unwanted failover',
      action: { label: 'Check link', to: '/fabric/ha' },
      category: 'ha',
    },
  ];
}

// ---------- Device detail --------------------------------------------------

function deviceDetail(deviceName) {
  const fwCveMap = {
    '7.6.6':        { patched: ['CVE-2026-0142', 'CVE-2026-0098', 'CVE-2025-9821', 'CVE-2025-9704', 'CVE-2025-9512'], open: [] },
    '7.6.5':        { patched: ['CVE-2025-9821', 'CVE-2025-9704', 'CVE-2025-9512'], open: ['CVE-2026-0142', 'CVE-2026-0098'] },
    '7.6.4':        { patched: ['CVE-2025-9704', 'CVE-2025-9512'], open: ['CVE-2026-0142', 'CVE-2026-0098', 'CVE-2025-9821'] },
    '7.4.8':        { patched: [], open: ['CVE-2026-0142', 'CVE-2026-0098', 'CVE-2025-9821', 'CVE-2025-9704', 'CVE-2025-9512'] },
    '7.2.11':       { patched: [], open: ['CVE-2026-0142', 'CVE-2026-0098', 'CVE-2025-9821', 'CVE-2025-9704', 'CVE-2025-9512'] },
    '8.0.0-beta2':  { patched: ['CVE-2026-0142', 'CVE-2026-0098', 'CVE-2025-9821', 'CVE-2025-9704', 'CVE-2025-9512'], open: [] },
  };

  const threatsFor = (host) => {
    const all = threatEvents();
    return all.filter((e) => e.destHost === host).slice(0, 8);
  };

  const installs = [
    { at: daysAgo(2),  pkg: 'HQ-Core', result: 'success', changes: '3 rules' },
    { at: daysAgo(14), pkg: 'HQ-Core', result: 'success', changes: '1 rule' },
    { at: daysAgo(37), pkg: 'HQ-Core', result: 'success', changes: '12 rules · major update' },
    { at: daysAgo(65), pkg: 'BranchPolicy',    result: 'partial', changes: '8 rules · 1 conflict' },
  ];

  // Build device detail from fleet data
  const mock = require('./mockData');
  const fleet = mock.deviceFleet();
  const device = fleet.find((d) => d.name === deviceName);
  if (!device) return null;

  const fwInfo = fwCveMap[device.firmware] || { patched: [], open: [] };

  const interfaces = [
    { name: 'wan1',     ip: '203.0.113.10/30', state: device.status === 'danger' ? 'down' : 'up', txMbps: 42, rxMbps: 108 },
    { name: 'wan2',     ip: '198.51.100.10/30', state: 'up', txMbps: 12, rxMbps: 28 },
    { name: 'internal', ip: '10.0.0.1/24', state: 'up', txMbps: 220, rxMbps: 185 },
    { name: 'dmz',      ip: '10.100.0.1/24', state: device.site === 'HQ-DMZ' ? 'up' : 'down', txMbps: 18, rxMbps: 42 },
  ];

  // Cluster info for HA devices
  let cluster = null;
  if (device.haMode && device.haMode !== 'single' && device.haMode !== 'standalone') {
    const clusterName = deviceName.replace(/-\d+[ab]?$/, '').replace(/-\d+$/, '');
    // Find the partner device
    const partner = fleet.find((d) =>
      d.name !== deviceName &&
      d.site === device.site &&
      d.platform === device.platform &&
      d.haMode === device.haMode
    );
    cluster = {
      name: clusterName,
      mode: device.haMode,
      role: deviceName.endsWith('01') || deviceName.endsWith('a') ? 'primary' : 'secondary',
      partner: partner?.name || null,
      syncState: device.note === 'drift' ? 'in-sync (drift detected)' : 'in-sync',
      heartbeatMs: device.status === 'warning' ? 4200 : 820,
    };
  }

  // Drift info
  const drift = device.note === 'drift' ? {
    count: 4,
    rules: [
      { id: 12, change: 'modified', desc: 'SSL-VPN portal source addresses' },
      { id: 18, change: 'modified', desc: 'admin allowlist expanded' },
      { id: 24, change: 'added',    desc: 'OT-to-corp cross-zone exception' },
      { id: 47, change: 'disabled', desc: 'guest wifi rate limit' },
    ],
    lastSeen: hoursAgo(8),
  } : null;

  const status = {
    online:     device.status !== 'danger',
    lastSyncAt: device.status === 'danger' ? hoursAgo(2) : minsAgo(Math.floor(Math.random() * 4) + 1),
    uptimeSec:  device.status === 'danger' ? 0 : 4_147_200 + Math.floor(Math.random() * 2_592_000),
    reason:     device.note || null,
  };

  return {
    device,
    status,
    cluster,
    firmware: {
      current: device.firmware,
      latest: '7.6.6',
      patchedCves: fwInfo.patched,
      openCves:    fwInfo.open,
      behind:  device.firmware !== '7.6.6' && !device.firmware.includes('beta'),
    },
    interfaces,
    drift,
    recentThreats: threatsFor(device.name),
    installs,
  };
}

// ---------- Policy objects -------------------------------------------------

function policyObjects() {
  const addresses = [
    { name: 'CORP-VLAN-10-OFFICE',   type: 'ipmask', value: '10.10.0.0/16',     usedBy: 24 },
    { name: 'CORP-VLAN-20-VOICE',    type: 'ipmask', value: '10.20.0.0/16',     usedBy: 12 },
    { name: 'CORP-VLAN-30-PRINTERS', type: 'ipmask', value: '10.30.0.0/24',     usedBy: 8  },
    { name: 'DMZ-WEB-SERVERS',       type: 'ipmask', value: '10.100.1.0/24',    usedBy: 18 },
    { name: 'DMZ-MAIL',              type: 'ipmask', value: '10.100.2.0/24',    usedBy: 6  },
    { name: 'OT-PLANT1-SCADA',       type: 'ipmask', value: '10.2.1.0/24',      usedBy: 14 },
    { name: 'OT-PLANT2-SCADA',       type: 'ipmask', value: '10.2.2.0/24',      usedBy: 14 },
    { name: 'OT-HISTORIAN',          type: 'ipmask', value: '10.2.100.5/32',    usedBy: 9  },
    { name: 'GUEST-WIFI',            type: 'ipmask', value: '172.16.0.0/16',    usedBy: 4  },
    { name: 'MGMT-JUMPHOST',         type: 'ipmask', value: '10.0.99.5/32',     usedBy: 22 },
    { name: 'PARTNER-ACME',          type: 'ipmask', value: '198.51.100.0/24',  usedBy: 3  },
    { name: 'EXT-SIEM',              type: 'ipmask', value: '203.0.113.50/32',  usedBy: 47 },
    { name: 'EXT-MICROSOFT365',      type: 'fqdn',   value: '*.office.com',     usedBy: 38 },
    { name: 'EXT-GITHUB',            type: 'fqdn',   value: '*.github.com',     usedBy: 12 },
    { name: 'EXT-ANTHROPIC',         type: 'fqdn',   value: 'api.anthropic.com', usedBy: 5  },
    { name: 'CORP-VLANS',            type: 'group',  members: ['CORP-VLAN-10-OFFICE','CORP-VLAN-20-VOICE','CORP-VLAN-30-PRINTERS'], usedBy: 31 },
    { name: 'DMZ-ALL',               type: 'group',  members: ['DMZ-WEB-SERVERS','DMZ-MAIL'], usedBy: 9 },
    { name: 'OT-SCADA-ALL',          type: 'group',  members: ['OT-PLANT1-SCADA','OT-PLANT2-SCADA'], usedBy: 11 },
    { name: 'BLACKLIST-TOR',         type: 'geo',    value: 'dynamic · FortiGuard feed', usedBy: 6 },
  ];

  const services = [
    { name: 'HTTP',              protocol: 'tcp', ports: '80',            usedBy: 48 },
    { name: 'HTTPS',             protocol: 'tcp', ports: '443',           usedBy: 92 },
    { name: 'SSH',               protocol: 'tcp', ports: '22',            usedBy: 21 },
    { name: 'RDP',               protocol: 'tcp', ports: '3389',          usedBy: 14 },
    { name: 'DNS',               protocol: 'tcp/udp', ports: '53',        usedBy: 47 },
    { name: 'SMTP-SUBMISSION',   protocol: 'tcp', ports: '587',           usedBy: 3  },
    { name: 'MODBUS',            protocol: 'tcp', ports: '502',           usedBy: 16 },
    { name: 'DNP3',              protocol: 'tcp', ports: '20000',         usedBy: 12 },
    { name: 'OPC-UA',            protocol: 'tcp', ports: '4840',          usedBy: 10 },
    { name: 'BACNET',            protocol: 'udp', ports: '47808',         usedBy: 6  },
    { name: 'SYSLOG',            protocol: 'udp', ports: '514',           usedBy: 47 },
    { name: 'SNMP',              protocol: 'udp', ports: '161,162',       usedBy: 47 },
    { name: 'WEB',               protocol: 'group', ports: 'HTTP + HTTPS', members: ['HTTP','HTTPS'], usedBy: 82 },
    { name: 'OT-PROTOCOLS',      protocol: 'group', ports: '502, 20000, 4840, 47808/udp', members: ['MODBUS','DNP3','OPC-UA','BACNET'], usedBy: 14 },
  ];

  const schedules = [
    { name: 'always',             type: 'recurring', spec: '24/7',               usedBy: 98 },
    { name: 'business-hours',     type: 'recurring', spec: 'Mon-Fri 08:00-18:00', usedBy: 18 },
    { name: 'after-hours',        type: 'recurring', spec: 'Mon-Fri 18:00-08:00', usedBy: 6  },
    { name: 'weekends',           type: 'recurring', spec: 'Sat-Sun all day',     usedBy: 3  },
    { name: 'maintenance-window', type: 'onetime',   spec: 'Sat 02:00-06:00',     usedBy: 2  },
  ];

  const vips = [
    { name: 'VIP-WEB',     extIntf: 'wan1', extIp: '203.0.113.10', extPort: '443',           intIp: '10.100.1.10', intPort: '443',   usedBy: 2 },
    { name: 'VIP-MAIL',    extIntf: 'wan1', extIp: '203.0.113.11', extPort: '25,465,587',    intIp: '10.100.2.10', intPort: 'same',  usedBy: 1 },
    { name: 'VIP-SSL-VPN', extIntf: 'wan1', extIp: '203.0.113.12', extPort: '443',           intIp: '10.0.0.5',    intPort: '10443', usedBy: 1 },
  ];

  return {
    summary: { addresses: addresses.length, services: services.length, schedules: schedules.length, vips: vips.length },
    addresses,
    services,
    schedules,
    vips,
  };
}

// ---------- Security profiles ---------------------------------------------

function policyProfiles() {
  return {
    antivirus: [
      { name: 'default',         engine: 'FortiGuard AV', signatures: '12.0.458', action: 'block', protocols: ['HTTP','SMTP','IMAP','POP3'], usedBy: 4,  note: 'Baseline corporate AV' },
      { name: 'strict-corp',     engine: 'FortiGuard AV', signatures: '12.0.458', action: 'block', protocols: ['HTTP','HTTPS','SMTP','IMAP','POP3','FTP','CIFS'], usedBy: 8, note: 'HTTPS inspection, quarantine suspicious' },
      { name: 'ot-permissive',   engine: 'FortiGuard AV', signatures: '12.0.458', action: 'monitor', protocols: ['HTTP','SMTP'], usedBy: 2, note: 'Monitor-only to avoid OT disruption' },
    ],
    ips: [
      { name: 'default-ips',     engine: 'FortiGuard IPS', signatures: '26.0.1412', action: 'block',  scope: 'severity >= high', usedBy: 6,  note: 'Standard protection' },
      { name: 'corp-ips',        engine: 'FortiGuard IPS', signatures: '26.0.1412', action: 'block',  scope: 'severity >= medium, block scanners', usedBy: 12, note: 'Tighter than default' },
      { name: 'ot-ips',          engine: 'FortiGuard IPS', signatures: '26.0.1412', action: 'block',  scope: 'OT protocols: Modbus, DNP3, BACnet anomaly', usedBy: 8, note: 'ICS/SCADA-specific' },
      { name: 'dmz-ips',         engine: 'FortiGuard IPS', signatures: '26.0.1412', action: 'block',  scope: 'public-facing attack signatures', usedBy: 2, note: 'DMZ hardening' },
    ],
    webFilter: [
      { name: 'corp-wf',         engine: 'FortiGuard URL DB', categories: '82', action: 'block', blocked: ['Adult','Malicious','Phishing','Botnet'], usedBy: 6, note: 'Standard corp' },
      { name: 'strict-wf',       engine: 'FortiGuard URL DB', categories: '82', action: 'block', blocked: ['Adult','Malicious','Phishing','Social','Streaming','Gaming'], usedBy: 4, note: 'Task-focused' },
      { name: 'guest-wf',        engine: 'FortiGuard URL DB', categories: '82', action: 'block', blocked: ['Adult','Malicious'], usedBy: 1, note: 'Guest WiFi' },
      { name: 'monitor-only',    engine: 'FortiGuard URL DB', categories: '82', action: 'monitor', blocked: [], usedBy: 2, note: 'Logging without blocking' },
    ],
    appControl: [
      { name: 'corp-apps',       engine: 'FortiGuard AppDB', signatures: '23.0.890', action: 'block', blocked: ['P2P','Games','RemoteAccess'], usedBy: 6, note: 'Corporate acceptable use' },
      { name: 'ot-apps',         engine: 'FortiGuard AppDB', signatures: '23.0.890', action: 'block', blocked: ['all non-OT'], usedBy: 8,  note: 'Strict OT allowlist' },
      { name: 'default-apps',    engine: 'FortiGuard AppDB', signatures: '23.0.890', action: 'monitor', blocked: [],        usedBy: 2,  note: 'Visibility only' },
    ],
    sslInspect: [
      { name: 'inspect-all',     mode: 'deep-inspection', cert: 'corp-ca',     exemptions: ['banking','healthcare'], usedBy: 4, note: 'Full TLS inspection' },
      { name: 'inspect-exempt',  mode: 'deep-inspection', cert: 'corp-ca',     exemptions: ['banking','healthcare','government','privacy-sensitive'], usedBy: 6, note: 'Extended exemptions' },
      { name: 'certificate-only', mode: 'certificate-inspection', cert: '—',   exemptions: [],  usedBy: 2, note: 'Cert validation only' },
    ],
    dlp: [
      { name: 'pii-detect',      mode: 'block',   patterns: ['SSN','credit-card','passport','drivers-license'], usedBy: 3, note: 'US PII' },
      { name: 'code-leakage',    mode: 'monitor', patterns: ['private-key','aws-secret','github-token'],        usedBy: 2, note: 'Dev security' },
    ],
  };
}
