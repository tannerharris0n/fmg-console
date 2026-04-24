import { useState } from 'react';
import clsx from 'clsx';
import { Network, Zap, Users, Activity } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Badge } from '../components/common/Badge';
import { Tooltip } from '../components/common/Tooltip';
import { useSwitches } from '../hooks/useFmgData';

/**
 * Port map - visual SVG of switch ports arranged like the physical faceplate.
 * 2 rows of ports (odd on top, even on bottom), uplink ports highlighted.
 */
function PortMap({ ports }) {
  const boxW = 16;
  const boxH = 14;
  const gap = 2;
  const cols = Math.ceil(ports.length / 2);
  const width = cols * (boxW + gap) + 4;
  const height = 2 * (boxH + gap) + 8;

  const colorFor = (p) => {
    if (p.status === 'down') return { fill: '#334155', stroke: '#475569' };      // gray
    if (p.uplink)            return { fill: '#7C3AED', stroke: '#A78BFA' };       // purple (uplink trunk)
    if (p.poeWatts > 0)      return { fill: '#065F46', stroke: '#10B981' };       // emerald (PoE active)
    if (p.vlan === 'trunk')  return { fill: '#7C3AED', stroke: '#A78BFA' };       // purple
    if (p.vlan === 900)      return { fill: '#831843', stroke: '#EC4899' };       // pink (OT VLAN)
    return { fill: '#0B3A66', stroke: '#378ADD' };                                // blue (generic up)
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[36px]" preserveAspectRatio="xMinYMid meet">
      {ports.map((p, i) => {
        const row = i % 2;
        const col = Math.floor(i / 2);
        const x = 2 + col * (boxW + gap);
        const y = row * (boxH + gap) + 4;
        const c = colorFor(p);
        return (
          <g key={p.port}>
            <title>{`Port ${p.port} · ${p.status} · VLAN ${p.vlan}${p.poeWatts ? ` · PoE ${p.poeWatts}W` : ''}${p.uplink ? ' · UPLINK' : ''}`}</title>
            <rect x={x} y={y} width={boxW} height={boxH} rx={1.5} fill={c.fill} stroke={c.stroke} strokeWidth={0.6} />
            {p.uplink && <text x={x + boxW/2} y={y + 9} fontSize={7} fontFamily="JetBrains Mono" fill="#F5F7FA" textAnchor="middle" fontWeight="700">U</text>}
          </g>
        );
      })}
    </svg>
  );
}

function SwitchCard({ sw, selected, onClick }) {
  const poePct = Math.round((sw.poeUsed / sw.poeBudget) * 100);
  const poeTone = poePct > 85 ? 'text-rose-300' : poePct > 65 ? 'text-amber-300' : 'text-emerald-300';
  const upPorts = sw.ports.filter((p) => p.status === 'up').length;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left bg-surface-900 rounded-lg border p-3 transition hover:bg-surface-800',
        selected ? 'border-accent' : 'border-surface-600/60'
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={clsx('h-2 w-2 rounded-full', sw.uplink === 'up' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse')} />
        <span className="font-medium text-[12.5px] text-ink-50">{sw.name}</span>
        {sw.warning && <Badge variant="danger">warning</Badge>}
      </div>
      <div className="text-[10.5px] text-ink-400 mb-2 flex flex-wrap gap-x-3 gap-y-0.5">
        <span>{sw.model}</span>
        <span>·</span>
        <span>{sw.site}</span>
        <span>·</span>
        <span>via <span className="code">{sw.managedBy}</span></span>
      </div>

      <PortMap ports={sw.ports} />

      <div className="mt-2 flex items-center gap-3 text-[10.5px] text-ink-400">
        <span className="inline-flex items-center gap-1"><Activity className="h-2.5 w-2.5" strokeWidth={2} /><span className="tabular-nums text-ink-200">{upPorts}/{sw.ports.length}</span> up</span>
        <span className="inline-flex items-center gap-1"><Users    className="h-2.5 w-2.5" strokeWidth={2} /><span className="tabular-nums text-ink-200">{sw.clients}</span> clients</span>
        <span className="inline-flex items-center gap-1"><Zap      className="h-2.5 w-2.5" strokeWidth={2} /><span className={clsx('tabular-nums', poeTone)}>{sw.poeUsed}/{sw.poeBudget}W</span></span>
        <span className="ml-auto text-ink-600">uptime {sw.uptime}</span>
      </div>
    </button>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-ink-400">
      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-sky-900 ring-1 ring-sky-500" /> link up</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-emerald-900 ring-1 ring-emerald-500" /> PoE active</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-purple-900 ring-1 ring-purple-500" /> uplink trunk</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-pink-900 ring-1 ring-pink-500" /> OT VLAN</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-surface-700 ring-1 ring-surface-600" /> down</span>
    </div>
  );
}

export default function Switches() {
  const { data = [], isLoading } = useSwitches();
  const [selected, setSelected] = useState(null);

  if (isLoading) return <div className="py-6 text-center text-ink-400 text-sm">Loading switches...</div>;

  const totalPorts = data.reduce((a, s) => a + s.ports.length, 0);
  const upPorts    = data.reduce((a, s) => a + s.ports.filter((p) => p.status === 'up').length, 0);
  const totalClients = data.reduce((a, s) => a + s.clients, 0);
  const totalPoe = data.reduce((a, s) => a + s.poeUsed, 0);

  const sel = selected ? data.find((s) => s.name === selected) : null;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Switches"       value={data.length} icon={Network} iconTone="info" />
        <KpiCard label="Ports up"       value={`${upPorts}/${totalPorts}`} icon={Activity} iconTone="success" />
        <KpiCard label="Clients"        value={totalClients} icon={Users} iconTone="info" />
        <KpiCard label="PoE drawn"      value={`${totalPoe}W`} icon={Zap} iconTone="muted" delta={`across ${data.length} switches`} deltaTone="muted" />
      </div>

      <Tile title="FortiSwitch fabric" subtitle={`${data.length} managed via FortiLink · click any switch for details`} icon={Network} action={<Legend />}>
        <div className="grid grid-cols-2 gap-2.5">
          {data.map((sw) => (
            <SwitchCard key={sw.name} sw={sw} selected={selected === sw.name} onClick={() => setSelected(sw.name === selected ? null : sw.name)} />
          ))}
        </div>
      </Tile>

      {sel && (
        <Tile title={`Detail · ${sel.name}`} subtitle={sel.warning || `${sel.model} at ${sel.site}`} icon={Network}>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Stat label="Model"      value={sel.model} />
            <Stat label="Controller" value={sel.managedBy} />
            <Stat label="Uptime"     value={sel.uptime} />
          </div>
          <table className="w-full text-left text-[11.5px]">
            <thead className="text-ink-400 text-[10.5px] border-b border-surface-600/60">
              <tr>
                <th className="py-2 px-2 font-medium w-12">Port</th>
                <th className="py-2 px-2 font-medium">Status</th>
                <th className="py-2 px-2 font-medium">VLAN</th>
                <th className="py-2 px-2 font-medium">Speed</th>
                <th className="py-2 px-2 font-medium text-right">PoE</th>
                <th className="py-2 px-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {sel.ports.map((p) => (
                <tr key={p.port} className="hover:bg-surface-800/40">
                  <td className="py-1.5 px-2 tabular-nums font-mono text-ink-400 text-[10.5px]">{p.port}</td>
                  <td className="py-1.5 px-2">
                    <span className={clsx('inline-flex items-center gap-1.5', p.status === 'up' ? 'text-emerald-400' : 'text-ink-400')}>
                      <span className={clsx('h-1.5 w-1.5 rounded-full', p.status === 'up' ? 'bg-emerald-500' : 'bg-surface-600')} />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-1.5 px-2"><span className="code">{p.vlan}</span></td>
                  <td className="py-1.5 px-2 text-ink-200">{p.linkSpeed}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums text-ink-200">{p.poeWatts > 0 ? `${p.poeWatts}W` : '—'}</td>
                  <td className="py-1.5 px-2 text-ink-400 text-[10.5px]">{p.uplink ? 'uplink trunk' : p.vlan === 900 ? 'OT segment' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tile>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-surface-800 rounded-md px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-400">{label}</div>
      <div className="text-[13px] font-semibold tabular-nums text-ink-50 mt-0.5">{value}</div>
    </div>
  );
}
