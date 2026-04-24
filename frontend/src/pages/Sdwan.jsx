import { useState } from 'react';
import clsx from 'clsx';
import { Activity, CheckCircle2, XCircle, AlertTriangle, Pause } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Chip } from '../components/common/Chip';
import { Badge } from '../components/common/Badge';
import { Drawer } from '../components/common/Drawer';
import { useSdwan, useSdwanOverlay } from '../hooks/useFmgData';

const STATUS_ICON = {
  ok:      { Icon: CheckCircle2,   class: 'text-emerald-400' },
  warning: { Icon: AlertTriangle,  class: 'text-amber-400' },
  danger:  { Icon: XCircle,        class: 'text-rose-400' },
  standby: { Icon: Pause,          class: 'text-ink-400' },
};

function OverlayRow({ overlay, onOpen }) {
  const { Icon, class: iconClass } = STATUS_ICON[overlay.status] || STATUS_ICON.ok;
  const bar =
    overlay.status === 'danger' ? 'bg-rose-500' :
    overlay.status === 'warning' ? 'bg-amber-400' :
    overlay.status === 'standby' ? 'bg-surface-500' :
    'bg-emerald-500';

  return (
    <button
      onClick={onOpen}
      className="w-full text-left py-3 first:pt-0 last:pb-0 border-b border-surface-600/40 last:border-0 hover:bg-surface-800/40 rounded-md px-2 -mx-2 transition"
    >
      <div className="flex items-center gap-3">
        <Icon className={clsx('h-4 w-4 shrink-0', iconClass)} strokeWidth={1.7} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-ink-50 truncate">{overlay.name}</span>
            {overlay.status === 'standby' && <Badge variant="neutral">standby</Badge>}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5 flex flex-wrap gap-x-3">
            {overlay.latencyMs != null && <span>latency <span className="text-ink-200 tabular-nums">{overlay.latencyMs}ms</span></span>}
            {overlay.jitterMs != null && <span>jitter <span className="text-ink-200 tabular-nums">{overlay.jitterMs}ms</span></span>}
            {overlay.lossPct != null && <span>loss <span className="text-ink-200 tabular-nums">{overlay.lossPct}%</span></span>}
          </div>
        </div>
        <div className="shrink-0 text-right min-w-[140px]">
          <div className="text-[14px] font-semibold tabular-nums text-ink-50">
            {overlay.sla != null ? `${overlay.sla}%` : '—'}
          </div>
          <div className="mt-1 h-1 w-[140px] bg-surface-800 rounded-full overflow-hidden">
            <div className={clsx('h-full transition-all', bar)} style={{ width: `${overlay.sla ?? 100}%` }} />
          </div>
        </div>
      </div>
    </button>
  );
}

function OverlayDrawer({ name, open, onClose }) {
  const { data, isLoading } = useSdwanOverlay(open ? name : null);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={name || ''}
      subtitle={data ? `${data.peer} · ${data.bandwidth}` : 'Loading...'}
      width="lg"
    >
      {isLoading && <div className="text-[12px] text-ink-400">Loading overlay metrics...</div>}
      {data && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="SLA"        value={data.sla != null ? `${data.sla}%` : '—'} />
            <MetricCard label="Latency"    value={data.latencyMs != null ? `${data.latencyMs}ms` : '—'} />
            <MetricCard label="Jitter"     value={data.jitterMs != null ? `${data.jitterMs}ms` : '—'} />
            <MetricCard label="Loss"       value={data.lossPct != null ? `${data.lossPct}%` : '—'} />
          </div>

          <section>
            <h3 className="text-[12px] font-semibold mb-2">Latency · 24h</h3>
            <div className="h-36 bg-surface-800 rounded-md p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.points}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3039" />
                  <XAxis dataKey="hour" tick={{ fill: '#8A919C', fontSize: 10 }} axisLine={{ stroke: '#2A3039' }} tickLine={false} />
                  <YAxis tick={{ fill: '#8A919C', fontSize: 10 }} axisLine={{ stroke: '#2A3039' }} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ background: '#11141A', border: '1px solid #2A3039', borderRadius: 6, fontSize: 11 }} />
                  <Line type="monotone" dataKey="latency" stroke="#378ADD" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section>
            <h3 className="text-[12px] font-semibold mb-2">SLA targets</h3>
            <ul className="divide-y divide-surface-600/40 bg-surface-800 rounded-md px-3">
              {data.slaTargets.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2 text-[12px]">
                  <span className="flex items-center gap-2">
                    {t.met
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.8} />
                      : <XCircle className="h-3.5 w-3.5 text-rose-400" strokeWidth={1.8} />}
                    <span className="text-ink-50 font-medium">{t.name}</span>
                  </span>
                  <span className="text-[11px] text-ink-400 tabular-nums">
                    latency ≤ {t.maxLatency}ms · jitter ≤ {t.maxJitter}ms · loss ≤ {t.maxLoss}%
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[12px] font-semibold mb-2">Member interfaces</h3>
            <ul className="bg-surface-800 rounded-md px-3 divide-y divide-surface-600/40">
              {data.members.map((m) => (
                <li key={m.device + m.iface} className="flex items-center justify-between py-2 text-[12px]">
                  <span className="flex items-center gap-2">
                    <Chip variant={m.state === 'up' ? 'success' : 'danger'}>{m.state}</Chip>
                    <span className="text-ink-50">{m.device}</span>
                    <span className="code">{m.iface}</span>
                  </span>
                  <span className="text-[11px] text-ink-400 tabular-nums">
                    <span className="text-emerald-400">{m.txMbps}</span>tx · <span className="text-sky-400">{m.rxMbps}</span>rx Mbps
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[12px] font-semibold mb-2">Rules using this overlay</h3>
            <ul className="bg-surface-800 rounded-md px-3 divide-y divide-surface-600/40">
              {data.rules.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2 text-[12px]">
                  <span className="text-ink-50">{r.name}</span>
                  <span className="text-[11px] text-ink-400">
                    <span className="tabular-nums">{r.matches.toLocaleString()}</span> matches · last steer <span className="code">{r.lastSteer}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </Drawer>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-surface-800 rounded-md px-3 py-2">
      <div className="text-[10.5px] text-ink-400">{label}</div>
      <div className="text-[18px] font-semibold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

export default function Sdwan() {
  const { data, isLoading } = useSdwan();
  const [selected, setSelected] = useState(null);

  if (isLoading) return <div className="py-6 text-center text-ink-400 text-sm">Loading SD-WAN...</div>;
  if (!data) return null;

  const ok = data.overlays.filter((o) => o.status === 'ok').length;
  const warn = data.overlays.filter((o) => o.status === 'warning').length;
  const danger = data.overlays.filter((o) => o.status === 'danger').length;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Average SLA"  value={data.avgSla} suffix="%" icon={Activity} iconTone="info" delta="rolling 24h" deltaTone="muted" />
        <KpiCard label="Overlays OK"  value={ok}     icon={CheckCircle2}  iconTone="ok"      />
        <KpiCard label="At risk"       value={warn}   icon={AlertTriangle} iconTone="warning" delta="needs review" deltaTone="warning" />
        <KpiCard label="Failing"        value={danger} icon={XCircle}       iconTone="danger"  delta="action required" deltaTone="danger" />
      </div>

      <Tile title="Overlays" subtitle={`${data.overlays.length} total`} icon={Activity}>
        {data.overlays.map((o) => (
          <OverlayRow key={o.name} overlay={o} onOpen={() => setSelected(o.name)} />
        ))}
      </Tile>

      <OverlayDrawer name={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </div>
  );
}
