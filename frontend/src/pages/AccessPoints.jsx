import { useState } from 'react';
import clsx from 'clsx';
import { Wifi, Radio, Users, AlertTriangle } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Badge } from '../components/common/Badge';
import { Chip } from '../components/common/Chip';
import { useAps, useApSsidConfig } from '../hooks/useFmgData';

function BandBar({ label, channel, util, tone }) {
  if (channel == null) return (
    <div className="flex-1">
      <div className="text-[9.5px] text-ink-600 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="h-1.5 rounded bg-surface-800" />
      <div className="text-[10px] text-ink-600 mt-0.5">—</div>
    </div>
  );
  const barColor = util > 60 ? 'bg-rose-500' : util > 40 ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between text-[9.5px] uppercase tracking-wider mb-0.5">
        <span className="text-ink-400">{label}</span>
        <span className="text-ink-500 font-mono normal-case">ch {channel}</span>
      </div>
      <div className="h-1.5 rounded bg-surface-800 overflow-hidden">
        <div className={clsx('h-full', barColor)} style={{ width: `${util}%` }} />
      </div>
      <div className="text-[10px] text-ink-400 tabular-nums mt-0.5">{util}% util</div>
    </div>
  );
}

function ApCard({ ap, selected, onClick }) {
  const isUp = ap.status === 'up';
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left bg-surface-900 rounded-lg border p-3 transition hover:bg-surface-800',
        selected ? 'border-accent' : 'border-surface-600/60'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={clsx('h-2 w-2 rounded-full', isUp ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse')} />
        <span className="font-medium text-[12.5px] text-ink-50">{ap.name}</span>
        {ap.warning && <Badge variant="danger">offline</Badge>}
      </div>
      <div className="text-[10.5px] text-ink-400 mb-2">
        <span>{ap.model}</span>
        <span className="mx-1.5">·</span>
        <span>{ap.site}</span>
        <span className="mx-1.5">·</span>
        <span>via <span className="code">{ap.managedBy}</span></span>
      </div>

      <div className="flex gap-2.5 mb-2">
        <BandBar label="2.4G" channel={ap.channel24} util={ap.util24} />
        <BandBar label="5G"   channel={ap.channel5}  util={ap.util5}  />
        <BandBar label="6G"   channel={ap.channel6}  util={ap.util6}  />
      </div>

      <div className="flex items-center justify-between text-[10.5px]">
        <div className="flex items-center gap-2">
          <Users className="h-2.5 w-2.5 text-ink-400" strokeWidth={2} />
          <span className="tabular-nums font-semibold text-ink-50">{ap.clients}</span>
          <span className="text-ink-400">clients</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {ap.ssids.map((s) => <span key={s} className="code">{s}</span>)}
        </div>
      </div>
    </button>
  );
}

export default function AccessPoints() {
  const { data = [], isLoading } = useAps();
  const { data: ssids = [] } = useApSsidConfig();
  const [selected, setSelected] = useState(null);

  if (isLoading) return <div className="py-6 text-center text-ink-400 text-sm">Loading APs...</div>;

  const up = data.filter((a) => a.status === 'up').length;
  const down = data.filter((a) => a.status === 'down').length;
  const clients = data.reduce((a, ap) => a + ap.clients, 0);
  const avgUtil = Math.round(
    data.filter((a) => a.util5 != null).reduce((a, ap) => a + ap.util5, 0) /
    Math.max(1, data.filter((a) => a.util5 != null).length)
  );

  const sel = selected ? data.find((a) => a.name === selected) : null;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Access points" value={data.length} icon={Wifi} iconTone="info" />
        <KpiCard label="Online"         value={up} icon={Radio} iconTone="success" />
        <KpiCard label="Offline"        value={down} icon={AlertTriangle} iconTone={down ? 'danger' : 'muted'} delta={down ? 'needs attention' : ''} deltaTone={down ? 'danger' : 'muted'} />
        <KpiCard label="Clients"        value={clients} icon={Users} iconTone="info" delta={`~${avgUtil}% avg 5G util`} deltaTone="muted" />
      </div>

      <Tile title="FortiAP fabric" subtitle={`${data.length} APs managed via FortiGate tunnels · click any AP for details`} icon={Wifi}>
        <div className="grid grid-cols-2 gap-2.5">
          {data.map((ap) => (
            <ApCard key={ap.name} ap={ap} selected={selected === ap.name} onClick={() => setSelected(ap.name === selected ? null : ap.name)} />
          ))}
        </div>
      </Tile>

      <Tile title="SSID configuration" subtitle={`${ssids.length} broadcast SSIDs`} icon={Radio}>
        <table className="w-full text-left text-[12px]">
          <thead className="text-ink-400 text-[10.5px] border-b border-surface-600/60">
            <tr>
              <th className="py-2 px-2 font-medium">SSID</th>
              <th className="py-2 px-2 font-medium">Security</th>
              <th className="py-2 px-2 font-medium">Auth</th>
              <th className="py-2 px-2 font-medium">Broadcast</th>
              <th className="py-2 px-2 font-medium">Isolation</th>
              <th className="py-2 px-2 font-medium">VLAN</th>
              <th className="py-2 px-2 font-medium">Bands</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {ssids.map((s) => (
              <tr key={s.ssid} className="hover:bg-surface-800/40">
                <td className="py-2 px-2">
                  <div className="font-medium text-ink-50">{s.ssid}</div>
                  <div className="text-ink-400 text-[10.5px]">{s.description}</div>
                </td>
                <td className="py-2 px-2"><Badge variant={s.security.startsWith('WPA3') ? 'success' : 'warning'}>{s.security}</Badge></td>
                <td className="py-2 px-2 text-ink-200">{s.auth}</td>
                <td className="py-2 px-2"><Chip variant={s.broadcast ? 'info' : 'neutral'}>{s.broadcast ? 'yes' : 'hidden'}</Chip></td>
                <td className="py-2 px-2"><Chip variant={s.isolation ? 'warning' : 'neutral'}>{s.isolation ? 'on' : 'off'}</Chip></td>
                <td className="py-2 px-2"><span className="code">{s.vlan}</span></td>
                <td className="py-2 px-2 text-ink-400 text-[11px]">{s.ranges}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tile>

      {sel && (
        <Tile title={`Detail · ${sel.name}`} subtitle={sel.warning || `${sel.model} at ${sel.site}`} icon={Wifi}>
          <div className="grid grid-cols-4 gap-3">
            <Stat label="Clients"      value={sel.clients} />
            <Stat label="2.4 GHz util" value={sel.util24 != null ? `${sel.util24}%` : '—'} />
            <Stat label="5 GHz util"   value={sel.util5  != null ? `${sel.util5}%`  : '—'} />
            <Stat label="6 GHz util"   value={sel.util6  != null ? `${sel.util6}%`  : '—'} />
          </div>
          <div className="mt-3 text-[11.5px] text-ink-400">
            Broadcasting: {sel.ssids.length === 0 ? 'nothing (AP offline)' : sel.ssids.map((s) => <span key={s} className="code mr-1">{s}</span>)}
          </div>
        </Tile>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-surface-800 rounded-md px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-400">{label}</div>
      <div className="text-[15px] font-semibold tabular-nums text-ink-50 mt-0.5">{value}</div>
    </div>
  );
}
