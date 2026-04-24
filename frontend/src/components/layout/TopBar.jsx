import { useLocation } from 'react-router-dom';
import { Share2, ShieldCheck, Search, Clock, Keyboard } from 'lucide-react';
import { Segmented } from '../common/Segmented';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Tooltip } from '../common/Tooltip';
import { useUiStore } from '../../stores/uiStore';
import { useAuth } from '../../hooks/useAuth';
import { useAppStatus } from '../../hooks/useAppStatus';
import { useKeyboardShortcutsHelp } from '../../hooks/useKeyboardShortcuts';

/**
 * Map path segments to human-readable labels + links.
 */
function buildBreadcrumbs(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return { title: 'Dashboard', crumbs: [] };

  const topLabels = {
    devices: 'Devices',
    fabric: 'Fabric',
    policy: 'Policy',
    security: 'Security',
    tasks: 'Tasks',
    scripts: 'Scripts',
    settings: 'Settings',
  };

  const subLabels = {
    'fabric/sdwan':   'SD-WAN',
    'fabric/vpn':     'VPN tunnels',
    'fabric/ha':      'HA clusters',
    'policy/packages': 'Packages',
    'policy/objects':  'Objects',
    'policy/profiles': 'Profiles',
    'policy/analyzer': 'Analyzer',
    'security/threats': 'Threats',
    'security/drift':   'Drift',
    'security/audit':   'Admin audit',
    'security/cve':     'CVE watch',
  };

  if (parts.length === 1) {
    const label = topLabels[parts[0]] || parts[0];
    return { title: label, crumbs: [] };
  }

  // Device detail: /devices/:name
  if (parts[0] === 'devices' && parts.length === 2) {
    return {
      title: parts[1],
      crumbs: [
        { label: 'Devices', to: '/devices' },
        { label: parts[1] },
      ],
    };
  }

  // Top + sub, e.g. /fabric/sdwan
  const joined = `${parts[0]}/${parts[1]}`;
  const topLabel = topLabels[parts[0]] || parts[0];
  const subLabel = subLabels[joined] || parts[1];
  return {
    title: subLabel,
    crumbs: [
      { label: topLabel, to: `/${parts[0]}` },
      { label: subLabel },
    ],
  };
}

function Avatar({ user }) {
  const initials = (user?.email || 'U')
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-7 w-7 rounded-full bg-accent-soft grid place-items-center text-[11px] font-semibold text-sky-200">
      {initials}
    </div>
  );
}

function DemoBadge() {
  return (
    <Tooltip content="All data is fictional. Mutations are blocked.">
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        Demo
      </span>
    </Tooltip>
  );
}

export function TopBar({ showPreset = true }) {
  const { pathname } = useLocation();
  const { title, crumbs } = buildBreadcrumbs(pathname);
  const preset = useUiStore((s) => s.preset);
  const setPreset = useUiStore((s) => s.setPreset);
  const toggleCmdk = useUiStore((s) => s.toggleCmdk);
  const { user } = useAuth();
  const { data: status } = useAppStatus();
  const isDemo = status?.demo === true;
  const { setOpen: setHelp } = useKeyboardShortcutsHelp();

  // Only show preset toggle on Dashboard
  const isDashboard = pathname === '/';

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-surface-600/60 bg-surface-950/60 backdrop-blur">
      <div className="min-w-0 flex items-center gap-3">
        <div className="min-w-0">
          {crumbs.length > 0 && <Breadcrumbs items={crumbs} className="mb-1" />}
          <h1 className="text-[16px] font-semibold tracking-tight leading-none truncate">{title}</h1>
          {crumbs.length === 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-ink-400 mt-1">
              <Clock className="h-3 w-3" strokeWidth={1.7} />
              <span>auto refresh · every 30s</span>
            </div>
          )}
        </div>
        {isDemo && <DemoBadge />}
      </div>

      <div className="flex items-center gap-3">
        {showPreset && isDashboard && (
          <Segmented
            value={preset}
            onChange={setPreset}
            options={[
              { value: 'network',  label: 'Network',  icon: Share2 },
              { value: 'security', label: 'Security', icon: ShieldCheck },
            ]}
          />
        )}

        <Tooltip content="Keyboard shortcuts (?)">
          <button
            onClick={() => setHelp(true)}
            className="h-8 w-8 grid place-items-center rounded-lg border border-surface-600 bg-surface-900 text-ink-400 hover:text-ink-200 hover:border-surface-500 transition"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </Tooltip>

        <button
          onClick={toggleCmdk}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-600 bg-surface-900 text-[12px] text-ink-400 hover:text-ink-200 hover:border-surface-500 transition"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={1.8} />
          Search
          <span className="kbd ml-1">⌘K</span>
        </button>

        <Avatar user={user} />
      </div>
    </header>
  );
}
