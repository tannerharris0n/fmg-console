import { useParams, Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Server, ArrowLeft, ShieldCheck, AlertTriangle, Activity,
  Cloud, ShieldAlert, ArrowRightLeft, Wifi, WifiOff,
  Clock, CircleDashed,
} from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { Chip } from '../components/common/Chip';
import { Badge } from '../components/common/Badge';
import { StatusDot } from '../components/common/StatusDot';
import { Tooltip } from '../components/common/Tooltip';
import { SkeletonLine, SkeletonTile } from '../components/common/Skeleton';
import { useDeviceDetail } from '../hooks/useFmgData';

function fmtUptime(sec) {
  if (!sec) return 'offline';
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

function relTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

const fwTone = (fw) => {
  if (fw.startsWith('8.')) return 'info';
  if (fw.startsWith('7.6')) return 'success';
  if (fw.startsWith('7.4')) return 'warning';
  if (fw.startsWith('7.2')) return 'danger';
  return 'neutral';
};

function DeviceHeader({ device, status }) {
  return (
    <header className="flex items-start justify-between gap-4 mb-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-[20px] font-semibold text-ink-50 tracking-tight">{device.name}</h1>
          <Tooltip content={status.online ? `online · last sync ${relTime(status.lastSyncAt)}` : `offline · ${status.reason || 'no recent contact'}`}>
            <StatusDot status={status.online ? 'ok' : 'danger'} size="md" />
          </Tooltip>
          {!device.managed && <Badge variant="warning">unmanaged</Badge>}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-400">
          <span>{device.platform}</span>
          <span>·</span>
          <span>{device.site}</span>
          <span>·</span>
          <span>HA: <span className="text-ink-200">{device.haMode}</span></span>
          <span>·</span>
          <span>Firmware: <Badge variant={fwTone(device.firmware)}>{device.firmware}</Badge></span>
        </div>
      </div>
    </header>
  );
}

function StatusCard({ status }) {
  return (
    <Tile title="Status" icon={status.online ? Wifi : WifiOff} padded>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="State" value={status.online ? 'online' : 'offline'} tone={status.online ? 'text-emerald-400' : 'text-rose-400'} />
        <Metric label="Uptime" value={fmtUptime(status.uptimeSec)} />
        <Metric label="Last sync" value={relTime(status.lastSyncAt)} />
        <Metric label="Reason" value={status.reason || 'nominal'} tone={status.reason ? 'text-amber-300' : 'text-ink-200'} />
      </div>
    </Tile>
  );
}

function ClusterCard({ cluster }) {
  if (!cluster) return null;
  return (
    <Tile title="Cluster" icon={ArrowRightLeft} padded>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Cluster" value={cluster.name} />
        <Metric label="Mode" value={cluster.mode} />
        <Metric label="Role" value={cluster.role} tone={cluster.role === 'primary' ? 'text-sky-300' : 'text-ink-200'} />
        <Metric label="Partner" value={cluster.partner || '—'}
                link={cluster.partner ? `/devices/${cluster.partner}` : null} />
        <Metric label="Sync" value={cluster.syncState} tone={cluster.syncState.startsWith('in-sync') ? 'text-emerald-400' : 'text-amber-400'} />
        <Metric label="Heartbeat" value={`${cluster.heartbeatMs}ms`} tone={cluster.heartbeatMs > 3000 ? 'text-amber-400' : 'text-emerald-400'} />
      </div>
    </Tile>
  );
}

function FirmwareCard({ firmware }) {
  const openCount = firmware.openCves.length;
  const tone = openCount === 0 ? 'ok' : firmware.openCves.some((c) => c.includes('2026-0142')) ? 'danger' : 'warning';
  const Icon = openCount === 0 ? ShieldCheck : ShieldAlert;
  return (
    <Tile title="Firmware & CVEs" icon={Icon} padded>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Badge variant={fwTone(firmware.current)}>{firmware.current}</Badge>
          {firmware.behind && (
            <span className="text-[11px] text-ink-400">
              ← latest <span className="text-ink-200">{firmware.latest}</span>
            </span>
          )}
          {!firmware.behind && firmware.current === firmware.latest && (
            <span className="text-[11px] text-emerald-400">up to date</span>
          )}
          {firmware.current.includes('beta') && (
            <span className="text-[11px] text-sky-300">beta lab</span>
          )}
        </div>

        {firmware.openCves.length > 0 && (
          <div>
            <div className="text-[10.5px] uppercase tracking-wider text-ink-400 mb-1">Unpatched ({firmware.openCves.length})</div>
            <div className="flex flex-wrap gap-1">
              {firmware.openCves.map((id) => (
                <Link
                  key={id}
                  to={`/security/cve?id=${encodeURIComponent(id)}`}
                  className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30 hover:bg-rose-500/20 transition"
                >
                  {id}
                </Link>
              ))}
            </div>
          </div>
        )}

        {firmware.patchedCves.length > 0 && (
          <div>
            <div className="text-[10.5px] uppercase tracking-wider text-ink-400 mb-1">Patched ({firmware.patchedCves.length})</div>
            <div className="flex flex-wrap gap-1">
              {firmware.patchedCves.slice(0, 6).map((id) => (
                <span
                  key={id}
                  className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Tile>
  );
}

function Metric({ label, value, tone = 'text-ink-200', link }) {
  const content = (
    <span className={clsx('text-[13px] font-medium', tone)}>{value}</span>
  );
  return (
    <div>
      <div className="text-[10px] text-ink-400 uppercase tracking-wider">{label}</div>
      <div className="mt-0.5">
        {link ? <Link to={link} className="hover:text-sky-300 transition">{content}</Link> : content}
      </div>
    </div>
  );
}

function InterfacesCard({ interfaces }) {
  return (
    <Tile title="Interfaces" icon={Activity} padded>
      <ul className="divide-y divide-surface-600/40">
        {interfaces.map((i) => (
          <li key={i.name} className="flex items-center justify-between py-2 text-[12px]">
            <div className="flex items-center gap-2">
              <Chip variant={i.state === 'up' ? 'success' : 'danger'}>{i.state}</Chip>
              <span className="font-mono text-[11px]">{i.name}</span>
              <span className="text-ink-400 text-[11px]">{i.ip}</span>
            </div>
            <span className="text-[11px] tabular-nums">
              <span className="text-emerald-400">{i.txMbps}</span>tx · <span className="text-sky-400">{i.rxMbps}</span>rx Mbps
            </span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

function DriftCard({ drift }) {
  if (!drift) {
    return (
      <Tile title="Configuration drift" icon={CircleDashed} padded>
        <div className="flex items-center gap-2 text-[12px] text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.7} />
          In sync with FMG
        </div>
      </Tile>
    );
  }
  return (
    <Tile
      title="Configuration drift"
      subtitle={`${drift.count} local changes · ${relTime(drift.lastSeen)}`}
      icon={AlertTriangle}
      padded
      action={<Link to="/security/drift" className="text-[11px] text-sky-300 hover:text-sky-200 font-medium">View diff →</Link>}
    >
      <ul className="divide-y divide-surface-600/40">
        {drift.rules.map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-2 text-[12px]">
            <span className="font-mono text-[10.5px] text-ink-400">#{r.id}</span>
            <Chip variant={r.change === 'modified' ? 'warning' : r.change === 'added' ? 'info' : 'danger'}>{r.change}</Chip>
            <span className="text-ink-200">{r.desc}</span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

function ThreatsCard({ events }) {
  if (events.length === 0) {
    return (
      <Tile title="Recent threats targeting this device" icon={ShieldCheck} padded>
        <div className="text-[12px] text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.7} />
          No blocks recorded in the last 24h
        </div>
      </Tile>
    );
  }
  return (
    <Tile
      title="Recent threats"
      subtitle={`${events.length} blocks in the last 24h`}
      icon={ShieldAlert}
      padded
      action={<Link to="/security/threats" className="text-[11px] text-sky-300 hover:text-sky-200 font-medium">View all →</Link>}
    >
      <ul className="divide-y divide-surface-600/40">
        {events.map((e) => (
          <li key={e.id} className="flex items-center gap-3 py-1.5 text-[11.5px]">
            <span className="text-ink-400 font-mono tabular-nums w-14 shrink-0">{relTime(e.at)}</span>
            <Chip variant={e.severity === 'critical' ? 'danger' : e.severity === 'high' ? 'warning' : 'info'}>{e.severity}</Chip>
            <span className="text-ink-200 font-medium truncate">{e.signature}</span>
            <span className="text-ink-400 ml-auto shrink-0">
              <span className="text-[9.5px] font-mono uppercase bg-surface-800 px-1 rounded mr-1">{e.sourceCountry}</span>
              <span className="code">{e.sourceIp}</span>
            </span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

function InstallsCard({ installs }) {
  return (
    <Tile title="Install history" icon={Cloud} padded>
      <ul className="divide-y divide-surface-600/40">
        {installs.map((i, idx) => (
          <li key={idx} className="flex items-center justify-between py-2 text-[12px]">
            <div className="flex items-center gap-3">
              <span className="text-ink-400 text-[11px] tabular-nums w-14">{relTime(i.at)}</span>
              <span className="font-medium">{i.pkg}</span>
              <Chip variant={i.result === 'success' ? 'success' : i.result === 'partial' ? 'warning' : 'danger'}>
                {i.result}
              </Chip>
            </div>
            <span className="text-ink-400 text-[11px]">{i.changes}</span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

export default function DeviceDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useDeviceDetail(name);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="mb-4">
          <SkeletonLine width="200px" className="h-5 mb-2" />
          <SkeletonLine width="320px" className="h-3" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <SkeletonTile />
          <SkeletonTile />
          <SkeletonTile />
        </div>
        <SkeletonTile />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-rose-400" strokeWidth={1.7} />
        <div className="text-[13px] text-ink-200">Device <span className="code">{name}</span> not found.</div>
        <button onClick={() => navigate('/devices')} className="text-[11.5px] text-sky-300 hover:text-sky-200 mt-3 font-medium">
          ← Back to device list
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link to="/devices" className="inline-flex items-center gap-1 text-[11.5px] text-ink-400 hover:text-ink-200 mb-3 transition">
        <ArrowLeft className="h-3 w-3" strokeWidth={2} />
        Devices
      </Link>

      <DeviceHeader device={data.device} status={data.status} />

      <div className={clsx('grid gap-3 mb-3', data.cluster ? 'grid-cols-3' : 'grid-cols-2')}>
        <div className="animate-stagger-1"><StatusCard status={data.status} /></div>
        {data.cluster && <div className="animate-stagger-2"><ClusterCard cluster={data.cluster} /></div>}
        <div className={data.cluster ? 'animate-stagger-3' : 'animate-stagger-2'}>
          <FirmwareCard firmware={data.firmware} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="animate-stagger-3"><InterfacesCard interfaces={data.interfaces} /></div>
        <div className="animate-stagger-4"><DriftCard drift={data.drift} /></div>
      </div>

      <div className="animate-stagger-5 mb-3"><ThreatsCard events={data.recentThreats} /></div>

      <div className="animate-stagger-6"><InstallsCard installs={data.installs} /></div>
    </div>
  );
}
