// v0.8 fixtures - SASE, FortiSwitch, FortiAP, change calendar, config diffs.
// Plain data. Zero runtime cost.

function minsAgo(m) { return new Date(Date.now() - m * 60_000).toISOString(); }
function hoursAgo(h) { return minsAgo(h * 60); }
function daysAgo(d) { return minsAgo(d * 1440); }
function inDays(d) { return new Date(Date.now() + d * 86_400_000).toISOString(); }
function inHours(h) { return new Date(Date.now() + h * 3_600_000).toISOString(); }

// ----- SASE -----

function saseOverview() {
  return {
    users: { active: 342, licensed: 500, trend: [320, 325, 330, 338, 342, 340, 342] },
    sia:   { sessions: 8420, blocksLast24h: 1240, bandwidthMbps: 420 },
    ztna:  { apps: 18, activeSessions: 192, failedAuth24h: 7 },
    spa:   { gateways: 3, tunnelsUp: 3, tunnelsDown: 0 },
    posture: { compliant: 318, warning: 18, nonCompliant: 6 },
    topLocations: [
      { city: 'Seattle',    region: 'WA', users: 142 },
      { city: 'Tacoma',     region: 'WA', users: 48 },
      { city: 'Spokane',    region: 'WA', users: 32 },
      { city: 'Portland',   region: 'OR', users: 28 },
      { city: 'Boise',      region: 'ID', users: 18 },
      { city: 'Coeur d\'Alene', region: 'ID', users: 12 },
      { city: 'Remote',     region: 'misc', users: 62 },
    ],
    topApps: [
      { name: 'Salesforce',       category: 'SaaS',    sessions: 2104, action: 'allow' },
      { name: 'Microsoft 365',    category: 'SaaS',    sessions: 4820, action: 'allow' },
      { name: 'GitHub',           category: 'Dev',     sessions: 1840, action: 'allow' },
      { name: 'Dropbox',          category: 'Storage', sessions: 420,  action: 'monitor' },
      { name: 'Personal Gmail',   category: 'Email',   sessions: 180,  action: 'warn' },
      { name: 'Anonymous Proxy',  category: 'Proxy',   sessions: 24,   action: 'block' },
    ],
    topBlocks: [
      { url: 'malvertising-domain-042.net',   category: 'Malicious',      hits: 342 },
      { url: 'phish-m365-impersonation.xyz',   category: 'Phishing',       hits: 128 },
      { url: 'c2-beacon-tracker.biz',          category: 'Botnet C&C',     hits: 48 },
      { url: 'proxy-bypass-mesh.net',          category: 'Proxy Avoidance', hits: 42 },
      { url: 'cryptojack-miner.pw',            category: 'Cryptomining',   hits: 24 },
    ],
  };
}

function saseZtnaApps() {
  return [
    { name: 'internal-wiki',    fqdn: 'wiki.corp.local',     sessions: 48, lastUsed: minsAgo(4),   posture: 'strict', gateway: 'hq-core' },
    { name: 'hr-portal',        fqdn: 'hr.corp.local',       sessions: 22, lastUsed: minsAgo(14),  posture: 'strict', gateway: 'hq-core' },
    { name: 'finance-tableau',  fqdn: 'tableau.corp.local',  sessions: 8,  lastUsed: minsAgo(42),  posture: 'strict', gateway: 'hq-core' },
    { name: 'jenkins',          fqdn: 'ci.corp.local',       sessions: 18, lastUsed: minsAgo(2),   posture: 'standard', gateway: 'hq-core' },
    { name: 'gitea',            fqdn: 'git.corp.local',      sessions: 34, lastUsed: minsAgo(1),   posture: 'standard', gateway: 'hq-core' },
    { name: 'grafana',          fqdn: 'grafana.corp.local',  sessions: 12, lastUsed: minsAgo(22),  posture: 'standard', gateway: 'hq-core' },
    { name: 'scada-historian',  fqdn: 'historian.ot.local',  sessions: 4,  lastUsed: minsAgo(180), posture: 'strict-ot', gateway: 'hq-dmz' },
    { name: 'plc-config-portal', fqdn: 'plc-mgmt.ot.local',  sessions: 1,  lastUsed: hoursAgo(6),  posture: 'strict-ot', gateway: 'hq-dmz' },
  ];
}

// ----- FortiSwitch -----

function switchList() {
  const ports = (count, overrides = {}) => {
    const out = [];
    for (let i = 1; i <= count; i++) {
      const p = { port: i, status: 'up', vlan: 10, poeWatts: 0, linkSpeed: '1G' };
      if (i % 7 === 0) p.status = 'down';
      if (i % 11 === 0) p.vlan = 20;
      if (i % 13 === 0) p.vlan = 30;
      if (i === count - 1) { p.uplink = true; p.vlan = 'trunk'; p.linkSpeed = '10G'; }
      if (i === count)     { p.uplink = true; p.vlan = 'trunk'; p.linkSpeed = '10G'; }
      if (overrides[i]) Object.assign(p, overrides[i]);
      out.push(p);
    }
    return out;
  };
  return [
    { name: 'hq-sw-01',   model: 'FortiSwitch 248E-FPOE', site: 'HQ-Seattle', managedBy: 'hq-core-01', ports: ports(52, { 1:{poeWatts:15},2:{poeWatts:12},3:{poeWatts:8},4:{poeWatts:15},12:{poeWatts:30},24:{status:'down'} }), poeBudget: 768, poeUsed: 184, uplink: 'up',   clients: 42, uptime: '68d' },
    { name: 'hq-sw-02',   model: 'FortiSwitch 248E-FPOE', site: 'HQ-Seattle', managedBy: 'hq-core-02', ports: ports(52), poeBudget: 768, poeUsed: 210, uplink: 'up',   clients: 48, uptime: '68d' },
    { name: 'hq-dmz-sw-01', model: 'FortiSwitch 124F-POE', site: 'HQ-DMZ',   managedBy: 'hq-dmz-01', ports: ports(28), poeBudget: 240, poeUsed: 42,  uplink: 'up',   clients: 12, uptime: '92d' },
    { name: 'br-sea-sw-01', model: 'FortiSwitch 124E-POE', site: 'sea',     managedBy: 'br-sea-01', ports: ports(28), poeBudget: 185, poeUsed: 68,  uplink: 'up',   clients: 18, uptime: '41d' },
    { name: 'br-tac-sw-01', model: 'FortiSwitch 108E-POE', site: 'tac',     managedBy: 'br-tac-01', ports: ports(12), poeBudget: 90,  poeUsed: 32,  uplink: 'up',   clients: 8,  uptime: '14d' },
    { name: 'br-spk-sw-01', model: 'FortiSwitch 108E-POE', site: 'spk',     managedBy: 'br-spk-01', ports: ports(12), poeBudget: 90,  poeUsed: 28,  uplink: 'up',   clients: 6,  uptime: '22d' },
    { name: 'br-boi-sw-01', model: 'FortiSwitch 108E-POE', site: 'boi',     managedBy: 'br-boi-01', ports: ports(12), poeBudget: 90,  poeUsed: 0,   uplink: 'down', clients: 0,  uptime: '0d', warning: 'uplink down (controller br-boi-01 offline)' },
    { name: 'br-pdx-sw-01', model: 'FortiSwitch 124E-POE', site: 'pdx',     managedBy: 'br-pdx-01', ports: ports(28), poeBudget: 185, poeUsed: 72,  uplink: 'up',   clients: 20, uptime: '88d' },
    { name: 'ot-plant-01-sw', model: 'FortiSwitch RUGGED-112D-POE', site: 'ot-plant-01', managedBy: 'ot-plant-01a', ports: ports(12, { 11:{vlan:900,status:'up'}, 12:{vlan:900,status:'up'} }), poeBudget: 180, poeUsed: 96, uplink: 'up', clients: 14, uptime: '124d' },
    { name: 'ot-plant-07-sw', model: 'FortiSwitch RUGGED-112D-POE', site: 'ot-plant-07', managedBy: 'ot-plant-07a', ports: ports(12), poeBudget: 180, poeUsed: 0,  uplink: 'down', clients: 0,  uptime: '0d', warning: 'controller offline' },
  ];
}

function switchDetail(name) {
  return switchList().find((s) => s.name === name) || null;
}

// ----- FortiAP -----

function apList() {
  return [
    { name: 'hq-ap-01',    model: 'FAP-431G',  site: 'HQ-Seattle', managedBy: 'hq-core-01', status: 'up',    clients: 42, ssids: ['corp-wifi','guest-wifi','iot-wifi'], channel24: 6,  channel5: 36,  channel6: 49,  util24: 32, util5: 18, util6: 8,  lastSeen: minsAgo(1) },
    { name: 'hq-ap-02',    model: 'FAP-431G',  site: 'HQ-Seattle', managedBy: 'hq-core-01', status: 'up',    clients: 38, ssids: ['corp-wifi','guest-wifi','iot-wifi'], channel24: 11, channel5: 44,  channel6: 65,  util24: 28, util5: 22, util6: 12, lastSeen: minsAgo(1) },
    { name: 'hq-ap-03',    model: 'FAP-431G',  site: 'HQ-Seattle', managedBy: 'hq-core-01', status: 'up',    clients: 29, ssids: ['corp-wifi','guest-wifi'],            channel24: 1,  channel5: 149, channel6: null, util24: 44, util5: 14, util6: null, lastSeen: minsAgo(2) },
    { name: 'hq-ap-04',    model: 'FAP-231G',  site: 'HQ-DMZ',     managedBy: 'hq-dmz-01',  status: 'up',    clients: 12, ssids: ['corp-wifi'],                         channel24: 6,  channel5: 36,  channel6: null, util24: 18, util5: 12, util6: null, lastSeen: minsAgo(1) },
    { name: 'br-sea-ap-01', model: 'FAP-231G', site: 'sea',       managedBy: 'br-sea-01',  status: 'up',    clients: 24, ssids: ['corp-wifi','guest-wifi'],            channel24: 11, channel5: 40,  channel6: null, util24: 22, util5: 16, util6: null, lastSeen: minsAgo(1) },
    { name: 'br-tac-ap-01', model: 'FAP-231G', site: 'tac',       managedBy: 'br-tac-01',  status: 'up',    clients: 14, ssids: ['corp-wifi','guest-wifi'],            channel24: 6,  channel5: 36,  channel6: null, util24: 18, util5: 10, util6: null, lastSeen: minsAgo(2) },
    { name: 'br-spk-ap-01', model: 'FAP-231G', site: 'spk',       managedBy: 'br-spk-01',  status: 'up',    clients: 8,  ssids: ['corp-wifi','guest-wifi'],            channel24: 1,  channel5: 44,  channel6: null, util24: 12, util5: 8,  util6: null, lastSeen: minsAgo(3) },
    { name: 'br-boi-ap-01', model: 'FAP-231G', site: 'boi',       managedBy: 'br-boi-01',  status: 'down',  clients: 0,  ssids: [],                                     channel24: null, channel5: null, channel6: null, util24: 0, util5: 0, util6: 0, lastSeen: hoursAgo(2), warning: 'controller offline' },
    { name: 'br-pdx-ap-01', model: 'FAP-231G', site: 'pdx',       managedBy: 'br-pdx-01',  status: 'up',    clients: 22, ssids: ['corp-wifi','guest-wifi'],            channel24: 11, channel5: 149, channel6: null, util24: 26, util5: 14, util6: null, lastSeen: minsAgo(1) },
  ];
}

function apSsidConfig() {
  return [
    { ssid: 'corp-wifi',  security: 'WPA3-Enterprise', auth: '802.1X · RADIUS',  broadcast: true,  isolation: false, vlan: 10,  ranges: '2.4/5/6 GHz', description: 'Corporate employee access' },
    { ssid: 'guest-wifi', security: 'WPA3-Personal',   auth: 'Captive portal',   broadcast: true,  isolation: true,  vlan: 99,  ranges: '2.4/5 GHz',   description: 'Guest internet-only access' },
    { ssid: 'iot-wifi',   security: 'WPA2-PSK',        auth: 'PSK',               broadcast: false, isolation: true,  vlan: 50,  ranges: '2.4 GHz',     description: 'IoT devices, isolated VLAN' },
  ];
}

// ----- Change calendar -----

function changeCalendar() {
  return [
    // Past week
    { id: 'ev-001', at: daysAgo(6),  type: 'install',    title: 'Install CorporatePolicy v42', target: 'HQ-Core · 4 devices',         status: 'success',  owner: 'tanner' },
    { id: 'ev-002', at: daysAgo(5),  type: 'install',    title: 'Install OT-Baseline v18',     target: 'OT-Baseline · 16 devices',    status: 'partial',  owner: 'tanner', note: 'ot-plant-07a offline' },
    { id: 'ev-003', at: daysAgo(4),  type: 'script',     title: 'Rotate SNMP community',       target: 'all HQ',                      status: 'success',  owner: 'tiffany' },
    { id: 'ev-004', at: daysAgo(3),  type: 'firmware',   title: 'Upgrade 7.4.8 → 7.6.6',       target: 'br-spk-01, br-tac-01',        status: 'success',  owner: 'tanner' },
    { id: 'ev-005', at: daysAgo(2),  type: 'install',    title: 'Install BranchPolicy v15',    target: 'BranchPolicy · 6 devices',    status: 'success',  owner: 'tanner' },
    { id: 'ev-006', at: hoursAgo(22), type: 'maintenance', title: 'FortiManager patch 7.6.5',  target: 'fmg.tanlab.net',             status: 'success',  owner: 'tanner' },
    { id: 'ev-007', at: hoursAgo(5),  type: 'install',   title: 'Install HQ-Core v13',         target: 'HQ-Core · 4 devices',         status: 'success',  owner: 'tanner' },
    // Today
    { id: 'ev-008', at: inHours(3),   type: 'install',   title: 'Install OT-HighRisk v9',      target: 'OT-HighRisk · 8 devices',     status: 'scheduled', owner: 'tanner', window: '20:00 PT' },
    { id: 'ev-009', at: inHours(5),   type: 'script',    title: 'Rotate IPsec PSKs',            target: 'all IPsec tunnels',          status: 'scheduled', owner: 'tiffany', window: '22:00 PT' },
    // Upcoming week
    { id: 'ev-010', at: inDays(1),    type: 'firmware',  title: 'Upgrade 7.6.5 → 7.6.6',        target: 'hq-ext-01, hq-dist-02',      status: 'scheduled', owner: 'tanner', window: 'maintenance window 22:00-02:00' },
    { id: 'ev-011', at: inDays(2),    type: 'install',   title: 'Install Partner-Extranet v4', target: 'hq-ext-01',                   status: 'scheduled', owner: 'tanner' },
    { id: 'ev-012', at: inDays(3),    type: 'cert',      title: 'Cert expires: vpn.corp.local', target: 'hq-core-01',                 status: 'warning',   owner: 'tanner' },
    { id: 'ev-013', at: inDays(4),    type: 'maintenance', title: 'Azure ExpressRoute failover test', target: 'azure-wus2',          status: 'scheduled', owner: 'tiffany' },
    { id: 'ev-014', at: inDays(5),    type: 'cert',      title: 'Cert expires: ztna.corp.local', target: 'hq-dmz-01',                status: 'warning',   owner: 'tanner' },
    { id: 'ev-015', at: inDays(7),    type: 'maintenance', title: 'Quarterly DR drill',          target: 'all HQ',                    status: 'scheduled', owner: 'tanner', window: 'weekend · 06:00-14:00' },
    { id: 'ev-016', at: inDays(10),   type: 'install',   title: 'Install BranchPolicy-Std v3',  target: 'BranchPolicy-Std · 6 devices', status: 'scheduled', owner: 'tiffany' },
  ];
}

// ----- Config diff -----

function configDiff(packageName, installAt) {
  // Return realistic FortiOS CLI before/after showing a policy change.
  // The "before" is the prior revision; "after" is the one installed at installAt.
  const diffs = {
    HQ: {
      before: `config firewall policy
    edit 47
        set name "Allow-Office365"
        set srcintf "port1"
        set dstintf "port2"
        set srcaddr "CORP-VLANS"
        set dstaddr "EXT-MICROSOFT365"
        set action accept
        set schedule "always"
        set service "HTTPS"
        set utm-status enable
        set ssl-ssh-profile "corp-ssl"
        set av-profile "corp-av"
        set webfilter-profile "corp-wf"
        set ips-sensor "corp-ips"
        set logtraffic all
    next
end`,
      after:  `config firewall policy
    edit 47
        set name "Allow-Office365"
        set srcintf "port1"
        set dstintf "port2"
        set srcaddr "CORP-VLANS"
        set dstaddr "EXT-MICROSOFT365"
        set action accept
        set schedule "always"
        set service "HTTPS" "HTTP"
        set utm-status enable
        set ssl-ssh-profile "strict-corp"
        set av-profile "corp-av"
        set webfilter-profile "corp-wf"
        set ips-sensor "corp-ips"
        set application-list "corp-apps"
        set logtraffic all
    next
    edit 48
        set name "Allow-Teams-Optimized"
        set srcintf "port1"
        set dstintf "port2"
        set srcaddr "CORP-VLANS"
        set dstaddr "EXT-MICROSOFT365"
        set action accept
        set service "TEAMS-UDP" "TEAMS-TCP"
        set utm-status disable
        set logtraffic utm
    next
end`,
    },
    Branch: {
      before: `config firewall policy
    edit 8
        set name "Allow-VoIP-Out"
        set srcintf "internal"
        set dstintf "wan1"
        set srcaddr "CORP-VLAN-20-VOICE"
        set dstaddr "all"
        set action accept
        set service "SIP" "RTP"
        set logtraffic all
    next
end`,
      after:  `config firewall policy
    edit 8
        set name "Allow-VoIP-Out"
        set srcintf "internal"
        set dstintf "wan1" "wan2"
        set srcaddr "CORP-VLAN-20-VOICE"
        set dstaddr "EXT-VOIP-CARRIER"
        set action accept
        set service "SIP" "RTP"
        set traffic-shaper "voip-priority"
        set traffic-shaper-reverse "voip-priority"
        set logtraffic all
    next
end`,
    },
    OT: {
      before: `config firewall policy
    edit 3
        set name "Deny-Corp-to-SCADA"
        set srcintf "corp"
        set dstintf "ot-scada"
        set srcaddr "CORP-VLANS"
        set dstaddr "OT-SCADA-ALL"
        set action deny
        set service "all"
        set logtraffic all
    next
end`,
      after:  `config firewall policy
    edit 3
        set name "Deny-Corp-to-SCADA"
        set srcintf "corp"
        set dstintf "ot-scada"
        set srcaddr "CORP-VLANS"
        set dstaddr "OT-SCADA-ALL"
        set action deny
        set service "all"
        set logtraffic all
        set comments "Purdue Model enforcement - corp must go through L3 historian"
    next
    edit 22
        set name "Monitor-Modbus-Anomalies"
        set srcintf "ot-scada"
        set dstintf "ot-scada"
        set srcaddr "OT-SCADA-ALL"
        set dstaddr "OT-PLC-ALL"
        set action accept
        set service "MODBUS"
        set ips-sensor "ot-ips"
        set logtraffic all
    next
end`,
    },
  };

  const list = require('./mockData').policyPackages();
  const entry = list.find((p) => p.name === packageName);
  if (!entry) return null;

  const descMap = require('./mockDataExtra').__descriptions__ || {};
  const bucket =
    packageName.startsWith('HQ-')       ? 'HQ' :
    packageName.startsWith('BranchPol') ? 'Branch' :
    packageName.startsWith('OT-')       ? 'OT' :
    packageName.startsWith('DMZ-')      ? 'HQ' :
    packageName.startsWith('Partner-')  ? 'HQ' : 'Branch';

  const diff = diffs[bucket] || diffs.Branch;

  return {
    package: packageName,
    installedAt: installAt,
    revisionFrom: 'v' + (10 + (packageName.length % 8)),
    revisionTo:   'v' + (11 + (packageName.length % 8)),
    author: entry.modifiedBy,
    summary: bucket === 'HQ' ? 'Added Teams optimization, tightened SSL inspection'
           : bucket === 'OT' ? 'Added MODBUS anomaly monitor rule'
           : 'Added secondary uplink failover for VoIP',
    before: diff.before,
    after: diff.after,
  };
}

module.exports = {
  saseOverview,
  saseZtnaApps,
  switchList,
  switchDetail,
  apList,
  apSsidConfig,
  changeCalendar,
  configDiff,
};
