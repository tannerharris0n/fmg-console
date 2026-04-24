import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Package, Search, Globe, Network, Calendar, ArrowRightLeft } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { usePolicyObjects } from '../hooks/useFmgData';

const TABS = [
  { id: 'addresses', label: 'Addresses', icon: Globe },
  { id: 'services',  label: 'Services',  icon: Network },
  { id: 'schedules', label: 'Schedules', icon: Calendar },
  { id: 'vips',      label: 'VIPs',      icon: ArrowRightLeft },
];

const TYPE_BADGE = {
  ipmask:     'info',
  fqdn:       'neutral',
  group:      'success',
  geo:        'warning',
  iprange:    'info',
};

function AddressesTab({ items, query }) {
  const f = items.filter((a) => !query || [a.name, a.type, a.value].join(' ').toLowerCase().includes(query.toLowerCase()));
  if (f.length === 0) return <EmptyState title="No matches" />;
  return (
    <table className="w-full text-left text-[12px]">
      <thead className="text-ink-400 text-[11px] border-b border-surface-600/60">
        <tr>
          <th className="py-2 px-2 font-medium">Name</th>
          <th className="py-2 px-2 font-medium">Type</th>
          <th className="py-2 px-2 font-medium">Value</th>
          <th className="py-2 px-2 font-medium text-right">Used by</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-800">
        {f.map((a) => (
          <tr key={a.name} className="hover:bg-surface-800/50">
            <td className="py-2 px-2 font-medium">{a.name}</td>
            <td className="py-2 px-2"><Badge variant={TYPE_BADGE[a.type] || 'neutral'}>{a.type}</Badge></td>
            <td className="py-2 px-2">
              {a.members
                ? <span className="text-ink-400 text-[11px]">{a.members.length} members: {a.members.slice(0, 3).join(', ')}{a.members.length > 3 ? '…' : ''}</span>
                : <span className="code">{a.value}</span>}
            </td>
            <td className="py-2 px-2 text-right text-ink-200 tabular-nums">{a.usedBy}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ServicesTab({ items, query }) {
  const f = items.filter((s) => !query || [s.name, s.protocol, s.ports].join(' ').toLowerCase().includes(query.toLowerCase()));
  if (f.length === 0) return <EmptyState title="No matches" />;
  return (
    <table className="w-full text-left text-[12px]">
      <thead className="text-ink-400 text-[11px] border-b border-surface-600/60">
        <tr>
          <th className="py-2 px-2 font-medium">Name</th>
          <th className="py-2 px-2 font-medium">Protocol</th>
          <th className="py-2 px-2 font-medium">Ports</th>
          <th className="py-2 px-2 font-medium text-right">Used by</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-800">
        {f.map((s) => (
          <tr key={s.name} className="hover:bg-surface-800/50">
            <td className="py-2 px-2 font-medium">{s.name}</td>
            <td className="py-2 px-2">
              <Badge variant={s.protocol === 'group' ? 'success' : 'info'}>{s.protocol}</Badge>
            </td>
            <td className="py-2 px-2"><span className="code">{s.ports}</span></td>
            <td className="py-2 px-2 text-right text-ink-200 tabular-nums">{s.usedBy}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SchedulesTab({ items, query }) {
  const f = items.filter((s) => !query || [s.name, s.type, s.spec].join(' ').toLowerCase().includes(query.toLowerCase()));
  if (f.length === 0) return <EmptyState title="No matches" />;
  return (
    <table className="w-full text-left text-[12px]">
      <thead className="text-ink-400 text-[11px] border-b border-surface-600/60">
        <tr>
          <th className="py-2 px-2 font-medium">Name</th>
          <th className="py-2 px-2 font-medium">Type</th>
          <th className="py-2 px-2 font-medium">When</th>
          <th className="py-2 px-2 font-medium text-right">Used by</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-800">
        {f.map((s) => (
          <tr key={s.name} className="hover:bg-surface-800/50">
            <td className="py-2 px-2 font-medium">{s.name}</td>
            <td className="py-2 px-2"><Badge variant={s.type === 'onetime' ? 'warning' : 'info'}>{s.type}</Badge></td>
            <td className="py-2 px-2 text-ink-400">{s.spec}</td>
            <td className="py-2 px-2 text-right text-ink-200 tabular-nums">{s.usedBy}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function VipsTab({ items, query }) {
  const f = items.filter((v) => !query || [v.name, v.extIp, v.intIp].join(' ').toLowerCase().includes(query.toLowerCase()));
  if (f.length === 0) return <EmptyState title="No matches" />;
  return (
    <table className="w-full text-left text-[12px]">
      <thead className="text-ink-400 text-[11px] border-b border-surface-600/60">
        <tr>
          <th className="py-2 px-2 font-medium">Name</th>
          <th className="py-2 px-2 font-medium">External</th>
          <th className="py-2 px-2 font-medium">Internal</th>
          <th className="py-2 px-2 font-medium text-right">Used by</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-800">
        {f.map((v) => (
          <tr key={v.name} className="hover:bg-surface-800/50">
            <td className="py-2 px-2 font-medium">{v.name}</td>
            <td className="py-2 px-2">
              <span className="code">{v.extIp}:{v.extPort}</span>
              <span className="text-ink-400 text-[10.5px] ml-1.5">({v.extIntf})</span>
            </td>
            <td className="py-2 px-2">
              <span className="code">{v.intIp}:{v.intPort}</span>
            </td>
            <td className="py-2 px-2 text-right text-ink-200 tabular-nums">{v.usedBy}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PolicyObjects() {
  const { data, isLoading } = usePolicyObjects();
  const [tab, setTab] = useState('addresses');
  const [query, setQuery] = useState('');

  const summary = data?.summary;

  const activeItems = useMemo(() => {
    if (!data) return [];
    return data[tab] || [];
  }, [data, tab]);

  if (isLoading) return <div className="py-6 text-center text-ink-400 text-sm">Loading objects...</div>;
  if (!data) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Addresses" value={summary.addresses} icon={Globe}          iconTone="info" />
        <KpiCard label="Services"  value={summary.services}  icon={Network}        iconTone="muted" />
        <KpiCard label="Schedules" value={summary.schedules} icon={Calendar}       iconTone="muted" />
        <KpiCard label="VIPs"      value={summary.vips}      icon={ArrowRightLeft} iconTone="muted" />
      </div>

      <Tile
        title="Objects"
        icon={Package}
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
            <div className="inline-flex bg-surface-800 rounded-md p-0.5 gap-0.5 ring-1 ring-surface-600/60">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                const count = data[t.id]?.length ?? 0;
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
        <div className="overflow-x-auto">
          {tab === 'addresses' && <AddressesTab items={activeItems} query={query} />}
          {tab === 'services'  && <ServicesTab  items={activeItems} query={query} />}
          {tab === 'schedules' && <SchedulesTab items={activeItems} query={query} />}
          {tab === 'vips'      && <VipsTab      items={activeItems} query={query} />}
        </div>
      </Tile>
    </div>
  );
}
