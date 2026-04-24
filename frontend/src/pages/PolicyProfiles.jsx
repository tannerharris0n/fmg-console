import { useState } from 'react';
import clsx from 'clsx';
import { ShieldCheck, Search, Shield, Bug, Globe, Layers, Lock, FileKey } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { usePolicyProfiles } from '../hooks/useFmgData';

const TABS = [
  { id: 'antivirus',  label: 'Antivirus',  icon: Shield,      field: 'engine' },
  { id: 'ips',        label: 'IPS',        icon: Bug,         field: 'engine' },
  { id: 'webFilter',  label: 'Web filter', icon: Globe,       field: 'engine' },
  { id: 'appControl', label: 'App ctrl',   icon: Layers,      field: 'engine' },
  { id: 'sslInspect', label: 'SSL insp',   icon: Lock,        field: 'mode' },
  { id: 'dlp',        label: 'DLP',        icon: FileKey,     field: 'mode' },
];

const actionTone = (a) => {
  if (a === 'block') return 'danger';
  if (a === 'monitor') return 'info';
  if (a === 'quarantine') return 'warning';
  return 'neutral';
};

function ProfileList({ items, tab, query }) {
  const f = items.filter((p) => !query || (p.name + ' ' + (p.note || '')).toLowerCase().includes(query.toLowerCase()));
  if (f.length === 0) return <EmptyState title="No profiles match" />;

  return (
    <ul className="divide-y divide-surface-600/40">
      {f.map((p) => (
        <li key={p.name} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-semibold text-ink-50">{p.name}</span>
                {p.action && <Badge variant={actionTone(p.action)}>{p.action}</Badge>}
                {p.mode && <Badge variant="info">{p.mode}</Badge>}
                <Badge variant="neutral">{p.usedBy} policies</Badge>
              </div>
              {p.note && <div className="text-[11.5px] text-ink-400 mt-1">{p.note}</div>}

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                {p.engine    && <Field label="Engine"     value={p.engine} />}
                {p.signatures && <Field label="Sigs"       value={p.signatures} mono />}
                {p.categories && <Field label="Categories" value={p.categories} mono />}
                {p.scope     && <Field label="Scope"      value={p.scope} />}
                {p.cert      && <Field label="Cert"       value={p.cert} mono />}
              </div>

              {p.protocols && p.protocols.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {p.protocols.map((x) => <span key={x} className="code">{x}</span>)}
                </div>
              )}
              {p.blocked && p.blocked.length > 0 && (
                <div className="mt-1.5 text-[11px]">
                  <span className="text-rose-400 font-medium">Blocked:</span>{' '}
                  <span className="text-ink-200">{p.blocked.join(', ')}</span>
                </div>
              )}
              {p.exemptions && p.exemptions.length > 0 && (
                <div className="mt-1.5 text-[11px]">
                  <span className="text-emerald-400 font-medium">Exempt:</span>{' '}
                  <span className="text-ink-200">{p.exemptions.join(', ')}</span>
                </div>
              )}
              {p.patterns && p.patterns.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {p.patterns.map((x) => <span key={x} className="code">{x}</span>)}
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Field({ label, value, mono }) {
  return (
    <span>
      <span className="text-ink-600 uppercase tracking-wider text-[10px] mr-1">{label}</span>
      <span className={clsx('text-ink-200', mono && 'font-mono text-[10.5px]')}>{value}</span>
    </span>
  );
}

export default function PolicyProfiles() {
  const { data, isLoading } = usePolicyProfiles();
  const [tab, setTab] = useState('antivirus');
  const [query, setQuery] = useState('');

  if (isLoading) return <div className="py-6 text-center text-ink-400 text-sm">Loading profiles...</div>;
  if (!data) return null;

  const totalsByType = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0])
  );
  const totalProfiles = Object.values(totalsByType).reduce((a, b) => a + b, 0);
  const totalUsedBy = Object.values(data).flat().reduce((a, p) => a + (p.usedBy || 0), 0);

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Profiles"         value={totalProfiles}        icon={ShieldCheck} iconTone="info" />
        <KpiCard label="Profile types"    value={TABS.length}          icon={Layers}      iconTone="muted" />
        <KpiCard label="Policies using"   value={totalUsedBy}          icon={FileKey}     iconTone="muted"  delta="across all packages" deltaTone="muted" />
        <KpiCard label="Block-mode"       value={Object.values(data).flat().filter((p) => p.action === 'block' || p.mode === 'deep-inspection' || p.mode === 'block').length} icon={Shield} iconTone="danger" />
      </div>

      <Tile
        title="Security profiles"
        icon={ShieldCheck}
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.7} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="bg-surface-800 border border-surface-600 rounded-md pl-7 pr-2 py-1 text-[11.5px] outline-none focus:border-accent w-40"
              />
            </div>
            <div className="inline-flex bg-surface-800 rounded-md p-0.5 gap-0.5 ring-1 ring-surface-600/60 flex-wrap">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                const count = totalsByType[t.id] ?? 0;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={clsx(
                      'flex items-center gap-1 text-[11px] px-2 py-1 rounded font-medium transition',
                      active ? 'bg-surface-700 text-ink-50' : 'text-ink-400 hover:text-ink-200'
                    )}
                  >
                    <Icon className="h-3 w-3" strokeWidth={1.8} />
                    {t.label}
                    <span className={clsx('tabular-nums', active ? 'text-ink-400' : 'text-ink-600')}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        }
      >
        <ProfileList items={data[tab]} tab={tab} query={query} />
      </Tile>
    </div>
  );
}
