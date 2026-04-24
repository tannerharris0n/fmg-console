import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Link2, Users, Search, Network } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Chip } from '../components/common/Chip';
import { VpnMap } from '../components/visualizations/VpnMap';
import { useSortable, SortableTh } from '../components/common/SortableTable';
import { useIpsecTunnels, useSslVpnSessions } from '../hooks/useFmgData';

function fmtUptime(sec) {
  if (!sec) return '—';
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  if (d > 0) return `${d}d ${h}h`;
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}
function fmtBytes(b) {
  if (b === 0) return '0';
  const u = ['B','KB','MB','GB','TB'];
  const i = Math.min(u.length - 1, Math.floor(Math.log(b) / Math.log(1024)));
  return (b / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + u[i];
}
function relTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function IpsecTab() {
  const { data = [], isLoading } = useIpsecTunnels();
  const { sorted, sort, toggle } = useSortable(data, { key: 'name', dir: 'asc' }, {
    traffic: (r) => r.bytesIn + r.bytesOut,
  });

  if (isLoading) return <div className="text-[12px] text-ink-400 py-6 text-center">Loading tunnels...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12px]">
        <thead className="text-ink-400 text-[11px] border-b border-surface-600/60">
          <tr>
            <SortableTh sortKey="status"    sort={sort} onToggle={toggle}>Status</SortableTh>
            <SortableTh sortKey="name"      sort={sort} onToggle={toggle}>Tunnel</SortableTh>
            <SortableTh sortKey="remoteGw"  sort={sort} onToggle={toggle}>Peer</SortableTh>
            <SortableTh sortKey="phase1"    sort={sort} onToggle={toggle}>Phase 1 / 2</SortableTh>
            <SortableTh sortKey="uptimeSec" sort={sort} onToggle={toggle}>Uptime</SortableTh>
            <SortableTh sortKey="traffic"   sort={sort} onToggle={toggle}>Traffic (in / out)</SortableTh>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-800">
          {sorted.map((t) => (
            <tr key={t.id} className="hover:bg-surface-800/50 transition">
              <td className="py-2 px-2">
                <Chip variant={t.status === 'up' ? 'success' : 'danger'}>{t.status}</Chip>
              </td>
              <td className="py-2 px-2">
                <div className="font-medium text-ink-50">{t.name}</div>
                {t.note && <div className="text-[10.5px] text-rose-400 mt-0.5">{t.note}</div>}
              </td>
              <td className="py-2 px-2 text-ink-400"><span className="code">{t.remoteGw}</span></td>
              <td className="py-2 px-2">
                <span className={clsx('mr-2', t.phase1 === 'ok' ? 'text-emerald-400' : 'text-rose-400')}>
                  P1: {t.phase1}
                </span>
                <span className={t.phase2 === 'ok' ? 'text-emerald-400' : 'text-rose-400'}>
                  P2: {t.phase2}
                </span>
              </td>
              <td className="py-2 px-2 text-ink-400">
                {t.status === 'down' ? `down ${relTime(t.downSince)}` : fmtUptime(t.uptimeSec)}
              </td>
              <td className="py-2 px-2 text-ink-400 tabular-nums">
                <span className="text-sky-400">{fmtBytes(t.bytesIn)}</span> / <span className="text-emerald-400">{fmtBytes(t.bytesOut)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SslTab() {
  const { data, isLoading } = useSslVpnSessions();
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!data) return [];
    if (!q) return data.sessions;
    const l = q.toLowerCase();
    return data.sessions.filter((s) =>
      s.user.toLowerCase().includes(l) ||
      s.group.toLowerCase().includes(l) ||
      s.sourceIp.includes(l)
    );
  }, [data, q]);

  const { sorted, sort, toggle } = useSortable(filtered, { key: 'user', dir: 'asc' }, {
    traffic: (r) => r.bytesIn + r.bytesOut,
  });

  if (isLoading) return <div className="text-[12px] text-ink-400 py-6 text-center">Loading sessions...</div>;

  return (
    <>
      <div className="relative mb-3 max-w-sm">
        <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.7} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search user, group, source IP..."
          className="w-full bg-surface-800 border border-surface-600 rounded-md pl-8 pr-3 py-1.5 text-[12px] outline-none focus:border-accent placeholder:text-ink-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="text-ink-400 text-[11px] border-b border-surface-600/60">
            <tr>
              <SortableTh sortKey="user"        sort={sort} onToggle={toggle}>User</SortableTh>
              <SortableTh sortKey="group"       sort={sort} onToggle={toggle}>Group</SortableTh>
              <SortableTh sortKey="sourceIp"    sort={sort} onToggle={toggle}>Source IP</SortableTh>
              <SortableTh sortKey="assignedIp"  sort={sort} onToggle={toggle}>Assigned IP</SortableTh>
              <SortableTh sortKey="connectedAt" sort={sort} onToggle={toggle}>Connected</SortableTh>
              <SortableTh sortKey="traffic"     sort={sort} onToggle={toggle}>Traffic</SortableTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {sorted.map((s) => (
              <tr key={s.id} className="hover:bg-surface-800/50 transition">
                <td className="py-2 px-2 font-medium">{s.user}</td>
                <td className="py-2 px-2 text-ink-400">{s.group}</td>
                <td className="py-2 px-2"><span className="code">{s.sourceIp}</span></td>
                <td className="py-2 px-2"><span className="code">{s.assignedIp}</span></td>
                <td className="py-2 px-2 text-ink-400">{relTime(s.connectedAt)}</td>
                <td className="py-2 px-2 text-ink-400 tabular-nums">
                  <span className="text-sky-400">{fmtBytes(s.bytesIn)}</span> / <span className="text-emerald-400">{fmtBytes(s.bytesOut)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function VpnTunnels() {
  const [tab, setTab] = useState('ipsec');
  const { data: ipsec = [] } = useIpsecTunnels();
  const { data: ssl } = useSslVpnSessions();

  const up = ipsec.filter((t) => t.status === 'up').length;
  const down = ipsec.filter((t) => t.status === 'down').length;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="IPsec up"       value={up}                 icon={Link2} iconTone="ok" suffix={` / ${ipsec.length}`} />
        <KpiCard label="IPsec down"     value={down}               icon={Link2} iconTone={down ? 'danger' : 'muted'} />
        <KpiCard label="SSL-VPN users"  value={ssl?.active ?? 0}   icon={Users} iconTone="info" delta="active now" deltaTone="info" />
        <KpiCard label="Total tunnels"  value={ipsec.length + (ssl?.active ?? 0)} icon={Link2} iconTone="muted" />
      </div>

      <Tile title="Topology" subtitle="IPsec tunnels + SSL-VPN · click endpoints to drill in" icon={Network} padded={false} className="p-2">
        <VpnMap ipsecTunnels={ipsec} sslSessionCount={ssl?.active ?? 0} />
      </Tile>

      <Tile
        title="VPN"
        icon={Link2}
        action={
          <div className="inline-flex bg-surface-800 rounded-md p-1 gap-0.5 ring-1 ring-surface-600/60">
            {['ipsec','ssl'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'px-3 py-1 text-[11.5px] font-medium rounded transition',
                  tab === t ? 'bg-surface-700 text-ink-50' : 'text-ink-400 hover:text-ink-200'
                )}
              >
                {t === 'ipsec' ? 'IPsec' : 'SSL-VPN'}
              </button>
            ))}
          </div>
        }
      >
        {tab === 'ipsec' ? <IpsecTab /> : <SslTab />}
      </Tile>
    </div>
  );
}
