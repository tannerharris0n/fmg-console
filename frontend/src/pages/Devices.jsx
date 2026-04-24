import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { Server, Search, MapPin, AlertOctagon, Cloud } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { StatusDot } from '../components/common/StatusDot';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { useDevices } from '../hooks/useDevices';

const VIEWS = [
  { id: 'all',       label: 'All',         icon: Server },
  { id: 'site',      label: 'By site',     icon: MapPin },
  { id: 'unmanaged', label: 'Unmanaged',   icon: AlertOctagon },
  { id: 'firmware',  label: 'Firmware',    icon: Cloud },
];

const fwTone = (fw) => {
  if (fw.startsWith('8.')) return 'info';
  if (fw.startsWith('7.6'))  return 'success';
  if (fw.startsWith('7.4'))  return 'warning';
  if (fw.startsWith('7.2'))  return 'danger';
  return 'neutral';
};

function StatusPill({ device }) {
  if (!device.managed) return <Badge variant="warning">unmanaged</Badge>;
  if (device.status === 'ok') return <StatusDot status="ok" />;
  return (
    <span className="flex items-center gap-1.5">
      <StatusDot status={device.status} />
      <span className={clsx('text-[11px]', device.status === 'danger' ? 'text-rose-400' : 'text-amber-400')}>
        {device.note || device.status}
      </span>
    </span>
  );
}

function DeviceRow({ device }) {
  return (
    <tr className="hover:bg-surface-800/50 transition">
      <td className="py-2 px-2"><StatusPill device={device} /></td>
      <td className="py-2 px-2 font-medium">{device.name}</td>
      <td className="py-2 px-2 text-ink-400">{device.platform}</td>
      <td className="py-2 px-2">
        <Badge variant={fwTone(device.firmware)}>{device.firmware}</Badge>
      </td>
      <td className="py-2 px-2 text-ink-400">{device.site || '—'}</td>
      <td className="py-2 px-2 text-ink-400">{device.haMode || '—'}</td>
    </tr>
  );
}

function AllView({ devices, query }) {
  const filtered = devices.filter((d) => d.managed !== false).filter((d) => {
    if (!query) return true;
    const l = query.toLowerCase();
    return d.name.toLowerCase().includes(l) || (d.site || '').toLowerCase().includes(l) || d.firmware.includes(l);
  });

  if (filtered.length === 0) return <EmptyState title="No devices match" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12px]">
        <thead className="text-ink-400 text-[11px] border-b border-surface-600/60">
          <tr>
            <th className="py-2 px-2 font-medium">Status</th>
            <th className="py-2 px-2 font-medium">Name</th>
            <th className="py-2 px-2 font-medium">Platform</th>
            <th className="py-2 px-2 font-medium">Firmware</th>
            <th className="py-2 px-2 font-medium">Site</th>
            <th className="py-2 px-2 font-medium">HA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-800">
          {filtered.map((d) => <DeviceRow key={d.name} device={d} />)}
        </tbody>
      </table>
    </div>
  );
}

function SiteView({ devices, query }) {
  const grouped = useMemo(() => {
    const filtered = devices
      .filter((d) => d.managed !== false)
      .filter((d) => {
        if (!query) return true;
        const l = query.toLowerCase();
        return d.name.toLowerCase().includes(l) || (d.site || '').toLowerCase().includes(l);
      });
    const by = {};
    filtered.forEach((d) => {
      const s = d.site || 'Unassigned';
      (by[s] = by[s] || []).push(d);
    });
    return Object.entries(by).sort(([a], [b]) => a.localeCompare(b));
  }, [devices, query]);

  if (grouped.length === 0) return <EmptyState title="No devices match" />;

  return (
    <div className="space-y-4">
      {grouped.map(([site, items]) => (
        <section key={site}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-semibold flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.7} />
              {site}
            </h3>
            <Badge variant="neutral">{items.length}</Badge>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {items.map((d) => (
              <div key={d.name} className="bg-surface-800 rounded-md px-3 py-2">
                <div className="flex items-center gap-2">
                  <StatusDot status={d.status} />
                  <span className="text-[12px] font-medium truncate">{d.name}</span>
                </div>
                <div className="text-[10.5px] text-ink-400 mt-1 flex items-center gap-1.5">
                  <span>{d.platform.replace('FortiGate-', '')}</span>
                  <span>·</span>
                  <span>{d.firmware}</span>
                </div>
                {d.note && (
                  <div className={clsx(
                    'text-[10.5px] mt-1',
                    d.status === 'danger' ? 'text-rose-400' : 'text-amber-400'
                  )}>
                    {d.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function UnmanagedView({ devices, query }) {
  const items = devices
    .filter((d) => d.managed === false)
    .filter((d) => {
      if (!query) return true;
      const l = query.toLowerCase();
      return d.name.toLowerCase().includes(l) || (d.site || '').toLowerCase().includes(l);
    });

  if (items.length === 0) {
    return <EmptyState title="No unmanaged devices" hint="All discovered devices are under FMG management." />;
  }

  return (
    <>
      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11.5px] text-amber-200 mb-3">
        These devices are visible on the network but have not been imported into FortiManager. Import to start enforcing policy packages and collecting logs.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="text-ink-400 text-[11px] border-b border-surface-600/60">
            <tr>
              <th className="py-2 px-2 font-medium">Name</th>
              <th className="py-2 px-2 font-medium">Platform</th>
              <th className="py-2 px-2 font-medium">Firmware</th>
              <th className="py-2 px-2 font-medium">Site</th>
              <th className="py-2 px-2 font-medium">Reason</th>
              <th className="py-2 px-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {items.map((d) => (
              <tr key={d.name} className="hover:bg-surface-800/50">
                <td className="py-2 px-2 font-medium">{d.name}</td>
                <td className="py-2 px-2 text-ink-400">{d.platform}</td>
                <td className="py-2 px-2"><Badge variant={fwTone(d.firmware)}>{d.firmware}</Badge></td>
                <td className="py-2 px-2 text-ink-400">{d.site}</td>
                <td className="py-2 px-2 text-amber-300">{d.note}</td>
                <td className="py-2 px-2 text-right">
                  <button className="text-[11.5px] text-sky-300 hover:text-sky-200 font-medium">Import ↗</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FirmwareView({ devices, query }) {
  const grouped = useMemo(() => {
    const filtered = devices
      .filter((d) => d.managed !== false)
      .filter((d) => {
        if (!query) return true;
        const l = query.toLowerCase();
        return d.name.toLowerCase().includes(l) || d.firmware.includes(l);
      });
    const by = {};
    filtered.forEach((d) => { (by[d.firmware] = by[d.firmware] || []).push(d); });
    // Sort newest version first, with beta at top
    return Object.entries(by).sort(([a], [b]) => {
      if (a.includes('beta') && !b.includes('beta')) return -1;
      if (b.includes('beta') && !a.includes('beta')) return 1;
      return b.localeCompare(a, undefined, { numeric: true });
    });
  }, [devices, query]);

  if (grouped.length === 0) return <EmptyState title="No devices match" />;

  const totalManaged = devices.filter((d) => d.managed !== false).length;

  return (
    <div className="space-y-4">
      {grouped.map(([version, items]) => {
        const pct = Math.round((items.length / totalManaged) * 100);
        const tone = fwTone(version);
        return (
          <section key={version}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Badge variant={tone}>{version}</Badge>
                <span className="text-[11.5px] text-ink-400 tabular-nums">{items.length} devices · {pct}%</span>
              </div>
              {version.includes('beta') && (
                <span className="text-[10.5px] text-sky-300">beta lab — pre-release testing</span>
              )}
              {version.startsWith('7.2') && (
                <span className="text-[10.5px] text-rose-300">EOL imminent — upgrade plan needed</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {items.map((d) => (
                <div key={d.name} className="bg-surface-800 rounded-md px-3 py-2">
                  <div className="flex items-center gap-2">
                    <StatusDot status={d.status} />
                    <span className="text-[12px] font-medium truncate">{d.name}</span>
                  </div>
                  <div className="text-[10.5px] text-ink-400 mt-1">
                    {d.platform.replace('FortiGate-', '')} · {d.site}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function Devices() {
  const { data = [], isLoading } = useDevices();
  const [params, setParams] = useSearchParams();
  const view = params.get('view') || 'all';
  const [query, setQuery] = useState('');

  const counts = useMemo(() => ({
    all:       data.filter((d) => d.managed !== false).length,
    unmanaged: data.filter((d) => d.managed === false).length,
    sites:     new Set(data.filter((d) => d.managed !== false).map((d) => d.site)).size,
    fws:       new Set(data.filter((d) => d.managed !== false).map((d) => d.firmware)).size,
  }), [data]);

  if (isLoading) return <div className="py-6 text-center text-ink-400 text-sm">Loading devices...</div>;

  const subtitle =
    view === 'all'       ? `${counts.all} managed` :
    view === 'site'      ? `${counts.sites} sites` :
    view === 'unmanaged' ? `${counts.unmanaged} discovered, not managed` :
    view === 'firmware'  ? `${counts.fws} versions` :
    null;

  return (
    <div className="space-y-3 animate-fade-in">
      <Tile
        title="Devices"
        subtitle={subtitle}
        icon={Server}
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.7} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="bg-surface-800 border border-surface-600 rounded-md pl-7 pr-2 py-1 text-[11.5px] outline-none focus:border-accent w-44"
              />
            </div>
            <div className="inline-flex bg-surface-800 rounded-md p-0.5 gap-0.5 ring-1 ring-surface-600/60">
              {VIEWS.map((v) => {
                const Icon = v.icon;
                const active = view === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setParams(v.id === 'all' ? {} : { view: v.id })}
                    className={clsx(
                      'flex items-center gap-1 text-[11px] px-2 py-1 rounded font-medium transition',
                      active ? 'bg-surface-700 text-ink-50' : 'text-ink-400 hover:text-ink-200'
                    )}
                  >
                    <Icon className="h-3 w-3" strokeWidth={1.8} />
                    {v.label}
                    {v.id === 'unmanaged' && counts.unmanaged > 0 && (
                      <span className={clsx('ml-0.5 tabular-nums', active ? 'text-amber-300' : 'text-amber-400')}>
                        {counts.unmanaged}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        }
      >
        {view === 'all'       && <AllView       devices={data} query={query} />}
        {view === 'site'      && <SiteView      devices={data} query={query} />}
        {view === 'unmanaged' && <UnmanagedView devices={data} query={query} />}
        {view === 'firmware'  && <FirmwareView  devices={data} query={query} />}
      </Tile>
    </div>
  );
}
