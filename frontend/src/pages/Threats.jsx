import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Globe2, Target, ShieldAlert, Search } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Chip } from '../components/common/Chip';
import { useSortable, SortableTh } from '../components/common/SortableTable';
import {
  useThreatActivity,
  useThreatEvents,
  useThreatTopSources,
  useThreatTopTargets,
} from '../hooks/useFmgData';

const sevTone = (s) => ({ critical: 'danger', high: 'warning', medium: 'info', low: 'neutral' }[s] || 'neutral');

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

export default function Threats() {
  const { data: activity } = useThreatActivity();
  const { data: events = [] } = useThreatEvents();
  const { data: sources = [] } = useThreatTopSources();
  const { data: targets = [] } = useThreatTopTargets();
  const [query, setQuery] = useState('');
  const [sev, setSev] = useState('all');

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (sev !== 'all' && e.severity !== sev) return false;
      if (query) {
        const l = query.toLowerCase();
        return (
          e.signature.toLowerCase().includes(l) ||
          e.sourceIp.includes(l) ||
          e.destHost.toLowerCase().includes(l) ||
          e.category.toLowerCase().includes(l)
        );
      }
      return true;
    });
  }, [events, query, sev]);

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Blocked 24h"        value={(activity?.total24h ?? 0).toLocaleString()} icon={ShieldAlert} iconTone="info"    delta="all categories" deltaTone="muted" />
        <KpiCard label="Unique sources"     value={sources.length}                              icon={Globe2}     iconTone="warning" />
        <KpiCard label="Unique targets"     value={targets.length}                              icon={Target}     iconTone="info" />
        <KpiCard label="Top category"       value={activity?.top?.[0]?.category || '—'}        icon={Activity}   iconTone="danger"  delta={activity?.top?.[0]?.name || ''} deltaTone="danger" />
      </div>

      <Tile title="Activity" subtitle="24h · hourly buckets" icon={Activity}>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activity?.points || []}>
              <defs>
                <linearGradient id="thrG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#378ADD" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#378ADD" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: '#8A919C', fontSize: 10 }} axisLine={{ stroke: '#2A3039' }} tickLine={false} />
              <YAxis tick={{ fill: '#8A919C', fontSize: 10 }} axisLine={{ stroke: '#2A3039' }} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: '#11141A', border: '1px solid #2A3039', borderRadius: 6, fontSize: 11 }} />
              <Area type="monotone" dataKey="count" stroke="#378ADD" strokeWidth={1.5} fill="url(#thrG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Tile>

      <div className="grid grid-cols-2 gap-3">
        <Tile title="Top sources" subtitle="attackers" icon={Globe2}>
          <ul className="divide-y divide-surface-600/40">
            {sources.map((s) => (
              <li key={s.ip} className="py-2 flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2">
                  <span className="text-[10px] text-ink-400 font-mono uppercase bg-surface-800 px-1.5 py-0.5 rounded">{s.country}</span>
                  <span className="code">{s.ip}</span>
                </span>
                <span className="text-ink-400 tabular-nums">
                  <span className="text-rose-400 font-medium">{s.count}</span> · {s.uniqueTargets} targets
                </span>
              </li>
            ))}
          </ul>
        </Tile>

        <Tile title="Top targets" subtitle="attacked hosts" icon={Target}>
          <ul className="divide-y divide-surface-600/40">
            {targets.map((t) => (
              <li key={t.host} className="py-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.host}</span>
                  <span className="tabular-nums text-rose-400 font-medium">{t.count}</span>
                </div>
                <div className="text-[10.5px] text-ink-400 mt-0.5 flex gap-1.5">
                  <span className="code">{t.ip}</span>
                  <span>·</span>
                  <span>{t.categories.join(', ')}</span>
                </div>
              </li>
            ))}
          </ul>
        </Tile>
      </div>

      <Tile
        title="Event log"
        subtitle={`${filtered.length} of ${events.length}`}
        icon={ShieldAlert}
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
              {['all','critical','high','medium','low'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSev(s)}
                  className={
                    'text-[10.5px] px-2 py-0.5 rounded font-medium transition ' +
                    (sev === s ? 'bg-surface-700 text-ink-50' : 'text-ink-400 hover:text-ink-200')
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <ThreatEventTable rows={filtered} />
      </Tile>
    </div>
  );
}

function ThreatEventTable({ rows }) {
  const { sorted, sort, toggle } = useSortable(rows, { key: 'at', dir: 'desc' });
  const display = sorted.slice(0, 25);
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11.5px]">
          <thead className="text-ink-400 text-[10.5px] border-b border-surface-600/60">
            <tr>
              <SortableTh sortKey="at"        sort={sort} onToggle={toggle}>Time</SortableTh>
              <SortableTh sortKey="severity"  sort={sort} onToggle={toggle}>Sev</SortableTh>
              <SortableTh sortKey="signature" sort={sort} onToggle={toggle}>Signature</SortableTh>
              <SortableTh sortKey="sourceIp"  sort={sort} onToggle={toggle}>Source</SortableTh>
              <SortableTh sortKey="destHost"  sort={sort} onToggle={toggle}>Target</SortableTh>
              <SortableTh sortKey="protocol"  sort={sort} onToggle={toggle}>Proto</SortableTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {display.map((e) => (
              <tr key={e.id} className="hover:bg-surface-800/50 transition">
                <td className="py-1.5 px-2 text-ink-400 tabular-nums whitespace-nowrap">{relTime(e.at)}</td>
                <td className="py-1.5 px-2"><Chip variant={sevTone(e.severity)}>{e.severity}</Chip></td>
                <td className="py-1.5 px-2">
                  <span className="text-[10px] text-ink-400 uppercase tracking-wider mr-1.5">{e.category}</span>
                  <span className="font-medium">{e.signature}</span>
                </td>
                <td className="py-1.5 px-2">
                  <span className="text-[10px] text-ink-400 font-mono uppercase bg-surface-800 px-1 rounded mr-1">{e.sourceCountry}</span>
                  <span className="code">{e.sourceIp}</span>
                </td>
                <td className="py-1.5 px-2">
                  <Link to={`/devices/${encodeURIComponent(e.destHost)}`} className="text-ink-200 hover:text-sky-300 transition">{e.destHost}</Link>
                </td>
                <td className="py-1.5 px-2 text-ink-400"><span className="code">{e.protocol}/{e.port}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 25 && (
        <div className="text-center text-[11px] text-ink-400 mt-3">
          Showing first 25 of {rows.length}. Refine search to narrow.
        </div>
      )}
    </>
  );
}
