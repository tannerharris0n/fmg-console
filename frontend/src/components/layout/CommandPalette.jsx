import { useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Server, FileText, ShieldCheck, Share2, Zap,
  Code2, Settings, Search, AlertTriangle, Lock, Activity,
  Link2, ShieldAlert, Package, Bug, MapPin, Keyboard,
} from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { useKeyboardShortcutsHelp } from '../../hooks/useKeyboardShortcuts';

const COMMANDS = [
  { group: 'Navigate', items: [
    { label: 'Dashboard',        path: '/',                  icon: LayoutGrid, shortcut: 'g d' },
    { label: 'Devices',          path: '/devices',           icon: Server,     shortcut: 'g v' },
    { label: 'SD-WAN',           path: '/fabric/sdwan',      icon: Activity,   shortcut: 'g s' },
    { label: 'VPN tunnels',      path: '/fabric/vpn',        icon: Link2,      shortcut: 'g n' },
    { label: 'HA clusters',      path: '/fabric/ha',         icon: Share2,     shortcut: 'g h' },
    { label: 'Policy packages',  path: '/policy/packages',   icon: FileText,   shortcut: 'g p' },
    { label: 'Policy objects',   path: '/policy/objects',    icon: Package,    shortcut: 'g o' },
    { label: 'Security profiles', path: '/policy/profiles',  icon: ShieldCheck, shortcut: 'g f' },
    { label: 'Policy analyzer',  path: '/policy/analyzer',   icon: Bug,        shortcut: 'g a' },
    { label: 'Threats',          path: '/security/threats',  icon: ShieldAlert, shortcut: 'g t' },
    { label: 'CVE watchlist',    path: '/security/cve',      icon: Lock,       shortcut: 'g c' },
    { label: 'Drift alerts',     path: '/security/drift',    icon: AlertTriangle, shortcut: 'g r' },
    { label: 'Admin audit',      path: '/security/audit',    icon: ShieldCheck, shortcut: 'g u' },
    { label: 'Tasks',            path: '/tasks',             icon: Zap,        shortcut: 'g k' },
    { label: 'Scripts',          path: '/scripts',           icon: Code2 },
    { label: 'Settings',         path: '/settings',          icon: Settings },
  ]},
  { group: 'Actions', items: [
    { label: 'Install preview',          action: 'install-preview',  icon: Zap },
    { label: 'Compare policies',         action: 'policy-compare',   icon: FileText },
    { label: 'Run script',               action: 'script-run',       icon: Code2 },
    { label: 'Search objects',           action: 'object-search',    icon: Search },
    { label: 'Show keyboard shortcuts',  action: 'show-shortcuts',   icon: Keyboard, shortcut: '?' },
  ]},
];

export function CommandPalette() {
  const open = useUiStore((s) => s.cmdkOpen);
  const setOpen = useUiStore((s) => s.setCmdk);
  const navigate = useNavigate();
  const { setOpen: setHelp } = useKeyboardShortcutsHelp();

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
    if (item.path) return navigate(item.path);
    if (item.action === 'show-shortcuts') return setHelp(true);
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
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <span className="kbd ml-auto">{item.shortcut}</span>
                      )}
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
