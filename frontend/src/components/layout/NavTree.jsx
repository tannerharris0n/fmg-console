import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutGrid,
  Server,
  Share2,
  FileText,
  ShieldCheck,
  Zap,
  Code2,
  Settings,
  ChevronDown,
  ChevronRight,
  Cloud,
  Network,
  Wifi,
  Calendar,
} from 'lucide-react';
import { StatusDot } from '../common/StatusDot';

const NAV = [
  { kind: 'item', to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { kind: 'group', label: 'Fabric' },
  {
    kind: 'item', to: '/devices', label: 'Devices', icon: Server, badge: '47',
    children: [
      { to: '/devices', label: 'All devices' },
      { to: '/devices?view=site', label: 'By site' },
      { to: '/devices?view=unmanaged', label: 'Unmanaged', badge: '2', badgeTone: 'warning' },
      { to: '/devices?view=firmware', label: 'Firmware' },
    ],
  },
  {
    kind: 'item', to: '/fabric', label: 'Network', icon: Share2,
    children: [
      { to: '/fabric/sdwan', label: 'SD-WAN' },
      { to: '/fabric/vpn',   label: 'VPN', badge: '34', badgeTone: 'success' },
      { to: '/fabric/ha',    label: 'HA clusters' },
      { to: '/switches',     label: 'Switches' },
      { to: '/aps',          label: 'Access points' },
    ],
  },
  { kind: 'item', to: '/sase', label: 'SASE', icon: Cloud, badge: '342', badgeTone: 'info' },
  { kind: 'group', label: 'Policy' },
  {
    kind: 'item', to: '/policy', label: 'Policy', icon: FileText, badge: '18',
    children: [
      { to: '/policy/packages', label: 'Packages' },
      { to: '/policy/objects', label: 'Objects' },
      { to: '/policy/profiles', label: 'Profiles' },
      { to: '/policy/analyzer', label: 'Analyzer', badge: '18', badgeTone: 'warning' },
    ],
  },
  { kind: 'group', label: 'Security' },
  {
    kind: 'item', to: '/security', label: 'Security', icon: ShieldCheck,
    children: [
      { to: '/security/threats', label: 'Threats' },
      { to: '/security/drift', label: 'Drift', badge: '2', badgeTone: 'danger' },
      { to: '/security/audit', label: 'Admin audit' },
      { to: '/security/cve', label: 'CVE watch', badge: '3', badgeTone: 'warning' },
    ],
  },
  { kind: 'group', label: 'Ops' },
  { kind: 'item', to: '/calendar', label: 'Calendar', icon: Calendar, badge: '8', badgeTone: 'info' },
  { kind: 'item', to: '/tasks',    label: 'Tasks',    icon: Zap,       badge: '1', badgeTone: 'info' },
  { kind: 'item', to: '/scripts',  label: 'Scripts',  icon: Code2 },
  { kind: 'item', to: '/settings', label: 'Settings', icon: Settings },
];

const badgeClass = (tone) => {
  switch (tone) {
    case 'warning': return 'text-amber-300';
    case 'danger':  return 'text-rose-300';
    case 'success': return 'text-emerald-300';
    case 'info':    return 'text-sky-300';
    default:        return 'text-ink-400';
  }
};

function ItemRow({ item }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const hasChildren = item.children?.length > 0;

  return (
    <div>
      <NavLink
        to={item.to}
        end={item.end}
        onClick={() => {
          if (hasChildren) setOpen((o) => !o);
        }}
        className={({ isActive }) => clsx(
          'group flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors',
          isActive
            ? 'bg-surface-700 text-ink-50 font-medium'
            : 'text-ink-200 hover:bg-surface-800 hover:text-ink-50'
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-ink-400 group-hover:text-ink-200" strokeWidth={1.7} />}
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className={clsx('text-[10px] font-medium', badgeClass(item.badgeTone))}>
            {item.badge}
          </span>
        )}
        {hasChildren && (
          open
            ? <ChevronDown className="h-3 w-3 text-ink-400" strokeWidth={2} />
            : <ChevronRight className="h-3 w-3 text-ink-400" strokeWidth={2} />
        )}
      </NavLink>

      {hasChildren && open && (
        <div className="ml-6 mt-0.5 space-y-px animate-fade-in">
          {item.children.map((c) => (
            <NavLink
              key={c.to + c.label}
              to={c.to}
              className={({ isActive }) => clsx(
                'flex items-center justify-between px-2 py-1 rounded text-[11.5px] transition-colors',
                isActive
                  ? 'text-ink-50 bg-surface-800'
                  : 'text-ink-400 hover:text-ink-200 hover:bg-surface-800'
              )}
            >
              <span className="truncate">{c.label}</span>
              {c.badge && (
                <span className={clsx('text-[10px] font-medium', badgeClass(c.badgeTone))}>
                  {c.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function NavTree() {
  return (
    <aside className="w-[168px] shrink-0 bg-surface-900 border-r border-surface-600/60 h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-3 border-b border-surface-600/60">
        <div className="w-6 h-6 rounded-md bg-accent text-white grid place-items-center text-[11px] font-semibold">F</div>
        <span className="text-[13px] font-semibold tracking-tight">FMG Console</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-1.5 py-2">
        {NAV.map((n, i) => {
          if (n.kind === 'group') {
            return (
              <div
                key={'g-' + i}
                className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-widest text-ink-600"
              >
                {n.label}
              </div>
            );
          }
          return <ItemRow key={n.to} item={n} />;
        })}
      </nav>

      <div className="border-t border-surface-600/60 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <StatusDot status="ok" size="sm" />
          <span className="text-[11px] text-ink-200 truncate">fmg.tanlab.net</span>
        </div>
        <div className="text-[10.5px] text-ink-400 mt-0.5">ADOM: root · v7.6.6</div>
      </div>
    </aside>
  );
}
