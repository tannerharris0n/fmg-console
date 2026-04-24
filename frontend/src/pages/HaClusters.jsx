import clsx from 'clsx';
import { ShieldCheck, AlertTriangle, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Chip } from '../components/common/Chip';
import { Badge } from '../components/common/Badge';
import { useHaClustersDetailed } from '../hooks/useFmgData';

function fmtUptime(sec) {
  if (!sec) return '—';
  const d = Math.floor(sec / 86400);
  if (d >= 1) return `${d}d`;
  const h = Math.floor((sec % 86400) / 3600);
  return `${h}h`;
}
function fmtHb(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 1000)}s`;
}
function relTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.round(diff / 86_400_000);
  if (d < 1) return 'today';
  if (d < 30) return `${d}d ago`;
  return `${Math.round(d / 30)}mo ago`;
}

function Node({ name, serial, role }) {
  return (
    <div className="bg-surface-800 rounded-md px-3 py-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-widest text-ink-400">{role}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </div>
      <div className="text-[13px] font-semibold text-ink-50">{name}</div>
      <div className="text-[10.5px] text-ink-400 font-mono mt-1 truncate">{serial}</div>
    </div>
  );
}

function ClusterCard({ c }) {
  const toneBorder =
    c.status === 'warning' ? 'border-amber-500/40' :
    c.status === 'danger'  ? 'border-rose-500/40' :
    'border-surface-600/60';

  return (
    <div className={clsx('tile border', toneBorder)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold">{c.name}</span>
          <Badge variant="neutral">{c.mode}</Badge>
          {c.override && <Badge variant="warning">override</Badge>}
        </div>
        <Chip variant={c.status === 'ok' ? 'success' : c.status === 'warning' ? 'warning' : 'danger'}>
          {c.status}
        </Chip>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <Node role="primary"   name={c.primary}   serial={c.primarySerial} />
        <Node role="secondary" name={c.secondary} serial={c.secondarySerial} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <Stat label="Heartbeat" value={fmtHb(c.heartbeatAgeMs)}
              tone={c.heartbeatAgeMs > 3000 ? 'text-amber-400' : 'text-emerald-400'} />
        <Stat label="Sync" value={c.syncState} tone={c.syncState === 'in-sync' ? 'text-emerald-400' : 'text-amber-400'} />
        <Stat label="Uptime" value={fmtUptime(c.uptimeSec)} />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[10.5px] text-ink-400">
        <span className="flex items-center gap-1">
          <ArrowRightLeft className="h-3 w-3" strokeWidth={1.8} />
          last failover {relTime(c.lastFailover)}
        </span>
        {c.note && <span className="text-amber-300">{c.note}</span>}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = 'text-ink-50' }) {
  return (
    <div>
      <div className="text-[10px] text-ink-400 uppercase tracking-wider">{label}</div>
      <div className={clsx('text-[12.5px] font-medium tabular-nums mt-0.5', tone)}>{value}</div>
    </div>
  );
}

export default function HaClusters() {
  const { data = [], isLoading } = useHaClustersDetailed();

  if (isLoading) return <div className="py-6 text-center text-ink-400 text-sm">Loading clusters...</div>;

  const ok = data.filter((c) => c.status === 'ok').length;
  const warn = data.filter((c) => c.status === 'warning').length;
  const danger = data.filter((c) => c.status === 'danger').length;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Clusters"         value={data.length}            icon={ShieldCheck}   iconTone="muted" />
        <KpiCard label="Healthy"          value={ok}                     icon={CheckCircle2}  iconTone="ok"      delta="in-sync" deltaTone="ok" />
        <KpiCard label="At risk"           value={warn}                   icon={AlertTriangle} iconTone="warning" delta="needs review" deltaTone="warning" />
        <KpiCard label="Overrides active" value={data.filter((c) => c.override).length} icon={ArrowRightLeft} iconTone="info" />
      </div>

      <Tile title="Clusters" subtitle={`${data.length} pairs`} icon={ShieldCheck}>
        <div className="grid grid-cols-2 gap-3">
          {data.map((c) => <ClusterCard key={c.name} c={c} />)}
        </div>
      </Tile>
    </div>
  );
}
