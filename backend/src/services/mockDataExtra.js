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
};

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
