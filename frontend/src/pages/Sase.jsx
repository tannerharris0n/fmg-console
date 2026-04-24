import { Cloud, Users, Shield, Activity, Globe, Ban, Check, AlertCircle } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Chip } from '../components/common/Chip';
import { Badge } from '../components/common/Badge';
import { useSaseOverview, useSaseZtnaApps } from '../hooks/useFmgData';

const actionTone = (a) => a === 'block' ? 'danger' : a === 'warn' ? 'warning' : a === 'monitor' ? 'info' : 'success';

function UserLoadMap({ locations }) {
  // Simple horizontal bar list - locations ranked by user count
  const max = Math.max(...locations.map((l) => l.users), 1);
  return (
    <div className="space-y-1.5">
      {locations.map((loc) => {
        const pct = (loc.users / max) * 100;
        return (
          <div key={loc.city} className="flex items-center gap-3 text-[11.5px]">
            <div className="w-28 shrink-0 flex items-center gap-1.5">
              <span className="text-ink-50 font-medium truncate">{loc.city}</span>
              <span className="text-ink-600 uppercase text-[10px]">{loc.region}</span>
            </div>
            <div className="flex-1 relative h-4 bg-surface-800 rounded">
              <div
                className="absolute inset-y-0 left-0 bg-sky-500/60 rounded"
                style={{ width: `${pct}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-end px-2">
                <span className="tabular-nums text-[10.5px] font-medium">{loc.users}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UsageSparkline({ values }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const w = 140, h = 32;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - ((v - min) / (max - min || 1)) * h * 0.8 - 4}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-[140px] h-[32px]">
      <polyline points={points} fill="none" stroke="#378ADD" strokeWidth={1.5} />
      <circle cx={(values.length - 1) * step} cy={h - ((values[values.length - 1] - min) / (max - min || 1)) * h * 0.8 - 4} r={2.5} fill="#378ADD" />
    </svg>
  );
}

function PostureBar({ compliant, warning, nonCompliant }) {
  const total = compliant + warning + nonCompliant;
  const c = (compliant / total) * 100;
  const w = (warning / total) * 100;
  const n = (nonCompliant / total) * 100;
  return (
    <div>
      <div className="h-3 rounded overflow-hidden flex">
        <div className="bg-emerald-500" style={{ width: `${c}%` }} />
        <div className="bg-amber-400"   style={{ width: `${w}%` }} />
        <div className="bg-rose-500"    style={{ width: `${n}%` }} />
      </div>
      <div className="flex items-center gap-3 text-[11px] mt-1.5">
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="text-ink-200 tabular-nums">{compliant} compliant</span></span>
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400"   /><span className="text-ink-200 tabular-nums">{warning} warning</span></span>
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-500"    /><span className="text-ink-200 tabular-nums">{nonCompliant} non-compliant</span></span>
      </div>
    </div>
  );
}

export default function Sase() {
  const { data, isLoading } = useSaseOverview();
  const { data: ztna = [] } = useSaseZtnaApps();

  if (isLoading) return <div className="py-6 text-center text-ink-400 text-sm">Loading SASE overview...</div>;
  if (!data) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Active users"        value={data.users.active}     icon={Users}    iconTone="info"    delta={`of ${data.users.licensed} licensed`} deltaTone="muted" />
        <KpiCard label="ZTNA sessions"       value={data.ztna.activeSessions} icon={Shield} iconTone="success" delta={`${data.ztna.apps} apps`}             deltaTone="muted" />
        <KpiCard label="SIA sessions 24h"    value={data.sia.sessions.toLocaleString()} icon={Activity} iconTone="info" delta={`${data.sia.blocksLast24h.toLocaleString()} blocked`} deltaTone="danger" />
        <KpiCard label="Private Access tunnels" value={`${data.spa.tunnelsUp}/${data.spa.gateways}`} icon={Globe} iconTone={data.spa.tunnelsDown ? 'danger' : 'success'} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Tile title="Users by location" subtitle="active SASE clients" icon={Globe} className="col-span-2">
          <UserLoadMap locations={data.topLocations} />
          <div className="mt-4 pt-3 border-t border-surface-600/40 flex items-center justify-between">
            <span className="text-[11px] text-ink-400">Trend, last 7 days</span>
            <UsageSparkline values={data.users.trend} />
          </div>
        </Tile>

        <Tile title="Client posture" subtitle="device health at login" icon={Shield}>
          <PostureBar {...data.posture} />
          <div className="mt-3 text-[11px] text-ink-400 space-y-1">
            <div className="flex items-center gap-1.5"><Check     className="h-3 w-3 text-emerald-400" strokeWidth={2} /> OS up to date, disk encrypted, EDR running</div>
            <div className="flex items-center gap-1.5"><AlertCircle className="h-3 w-3 text-amber-400" strokeWidth={2} /> Missing one posture signal</div>
            <div className="flex items-center gap-1.5"><Ban       className="h-3 w-3 text-rose-400"    strokeWidth={2} /> Blocked from ZTNA apps until remediated</div>
          </div>
        </Tile>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tile title="Top apps" subtitle="sessions last 24h" icon={Activity}>
          <div className="divide-y divide-surface-600/30">
            {data.topApps.map((app) => (
              <div key={app.name} className="flex items-center gap-3 py-2 text-[12px]">
                <span className="flex-1 font-medium text-ink-50 truncate">{app.name}</span>
                <Badge variant="neutral">{app.category}</Badge>
                <span className="tabular-nums text-ink-200 w-16 text-right">{app.sessions.toLocaleString()}</span>
                <Chip variant={actionTone(app.action)}>{app.action}</Chip>
              </div>
            ))}
          </div>
        </Tile>

        <Tile title="Top blocks" subtitle="URLs blocked last 24h" icon={Ban}>
          <div className="divide-y divide-surface-600/30">
            {data.topBlocks.map((b) => (
              <div key={b.url} className="flex items-center gap-3 py-2 text-[12px]">
                <span className="flex-1 font-mono text-[10.5px] text-ink-50 truncate">{b.url}</span>
                <Badge variant="danger">{b.category}</Badge>
                <span className="tabular-nums text-rose-300 w-12 text-right font-medium">{b.hits}</span>
              </div>
            ))}
          </div>
        </Tile>
      </div>

      <Tile title="ZTNA applications" subtitle={`${ztna.length} published · click gateway to drill in`} icon={Shield}>
        <table className="w-full text-left text-[12px]">
          <thead className="text-ink-400 text-[10.5px] border-b border-surface-600/60">
            <tr>
              <th className="py-2 px-2 font-medium">App</th>
              <th className="py-2 px-2 font-medium">FQDN</th>
              <th className="py-2 px-2 font-medium">Posture</th>
              <th className="py-2 px-2 font-medium">Gateway</th>
              <th className="py-2 px-2 font-medium text-right">Sessions</th>
              <th className="py-2 px-2 font-medium">Last used</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {ztna.map((app) => (
              <tr key={app.name} className="hover:bg-surface-800/50 transition">
                <td className="py-2 px-2 font-medium text-ink-50">{app.name}</td>
                <td className="py-2 px-2"><span className="code">{app.fqdn}</span></td>
                <td className="py-2 px-2"><Badge variant={app.posture === 'strict' || app.posture === 'strict-ot' ? 'warning' : 'info'}>{app.posture}</Badge></td>
                <td className="py-2 px-2 text-ink-200">{app.gateway}</td>
                <td className="py-2 px-2 text-right tabular-nums">{app.sessions}</td>
                <td className="py-2 px-2 text-ink-400 text-[11px]">{relMin(app.lastUsed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>
    </div>
  );
}

function relMin(iso) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}
