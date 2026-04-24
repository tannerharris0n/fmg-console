import { useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Server, FileText, ShieldCheck, Share2, Zap,
  Code2, Settings, Search, AlertTriangle, Lock, Activity,
} from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';

const COMMANDS = [
  { group: 'Navigate', items: [
    { label: 'Dashboard',        path: '/',                icon: LayoutGrid },
    { label: 'Devices',          path: '/devices',         icon: Server },
    { label: 'Policy packages',  path: '/policy/packages', icon: FileText },
    { label: 'SD-WAN',           path: '/fabric/sdwan',    icon: Activity },
    { label: 'VPN tunnels',      path: '/fabric/vpn',      icon: Share2 },
    { label: 'Threats',          path: '/security/threats',icon: ShieldCheck },
    { label: 'CVE watchlist',    path: '/security/cve',    icon: Lock },
    { label: 'Drift alerts',     path: '/security/drift',  icon: AlertTriangle },
    { label: 'Tasks',            path: '/tasks',           icon: Zap },
    { label: 'Scripts',          path: '/scripts',         icon: Code2 },
    { label: 'Settings',         path: '/settings',        icon: Settings },
  ]},
  { group: 'Actions', items: [
    { label: 'Install preview',  action: 'install-preview',  icon: Zap },
    { label: 'Compare policies', action: 'policy-compare',   icon: FileText },
    { label: 'Run script',       action: 'script-run',       icon: Code2 },
    { label: 'Search objects',   action: 'object-search',    icon: Search },
  ]},
];

export function CommandPalette() {
  const open = useUiStore((s) => s.cmdkOpen);
  const setOpen = useUiStore((s) => s.setCmdk);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!open);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const handleSelect = (item) => {
    setOpen(false);
    if (item.path) navigate(item.path);
    // action-based items would dispatch to stores; stubbed for v0.1
  };

  return (
    <div cmdk-overlay="" onClick={() => setOpen(false)}>
      <div cmdk-dialog="" onClick={(e) => e.stopPropagation()}>
        <Command label="Command menu" loop>
          <Command.Input placeholder="Search devices, policies, objects, actions..." autoFocus />
          <Command.List>
            <Command.Empty>No matches.</Command.Empty>
            {COMMANDS.map((group) => (
              <Command.Group key={group.group} heading={group.group}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.label}
                      onSelect={() => handleSelect(item)}
                    >
                      <Icon className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.7} />
                      <span>{item.label}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
