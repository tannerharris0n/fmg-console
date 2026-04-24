import {
  Server, Link2, Activity, Cloud, ShieldCheck, FileText, AlertTriangle, Lock,
} from 'lucide-react';
import { useUiStore } from '../stores/uiStore';
import { useDashboard } from '../hooks/useDashboard';
import { KpiCard } from '../components/common/KpiCard';
import { SdwanMatrix } from '../components/tiles/SdwanMatrix';
import { VpnTunnels } from '../components/tiles/VpnTunnels';
import { HaClusters } from '../components/tiles/HaClusters';
import { DeviceFleet } from '../components/tiles/DeviceFleet';
import { FirmwarePosture } from '../components/tiles/FirmwarePosture';
import { PolicyHeatmap } from '../components/tiles/PolicyHeatmap';
import { ThreatActivity } from '../components/tiles/ThreatActivity';
import { CveWatchlist } from '../components/tiles/CveWatchlist';
import { DriftAlerts } from '../components/tiles/DriftAlerts';
import { AdminAudit } from '../components/tiles/AdminAudit';
import { ActivityFeed } from '../components/tiles/ActivityFeed';

export default function Dashboard() {
  const preset = useUiStore((s) => s.preset);
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return null;

  return preset === 'security' ? <SecurityPreset data={data} /> : <NetworkPreset data={data} />;
}

function NetworkPreset({ data }) {
  const s = data.summary;
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard
          label="Devices online"
          icon={Server} iconTone="ok"
          value={s.devices.online}
          suffix={` / ${s.devices.total}`}
          delta={`${Math.round((s.devices.online / s.devices.total) * 100)}% availability`}
          deltaTone="ok"
        />
        <KpiCard
          label="VPN tunnels"
          icon={Link2} iconTone="ok"
          value={data.vpn.up}
          suffix={` / ${data.vpn.total}`}
          delta={`${data.vpn.total - data.vpn.up} down · attention`}
          deltaTone="warning"
        />
        <KpiCard
          label="SD-WAN avg SLA"
          icon={Activity} iconTone="info"
          value={s.sdwan?.avgSla ?? 91}
          suffix="%"
          delta="1 overlay at risk"
          deltaTone="warning"
        />
        <KpiCard
          label="Pending installs"
          icon={Cloud} iconTone="warning"
          value={s.installs.pending}
          delta={`1 running · ${s.installs.runningPct}%`}
          deltaTone="info"
        />
      </div>

      <SdwanMatrix data={data.sdwan} />

      <div className="grid grid-cols-2 gap-3">
        <VpnTunnels data={data.vpn} />
        <HaClusters data={data.ha} />
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-3">
        <DeviceFleet data={data.fleet} />
        <FirmwarePosture data={data.firmware} />
      </div>

      <ActivityFeed data={data.activity} />
    </div>
  );
}

function SecurityPreset({ data }) {
  const s = data.summary;
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard
          label="Threats blocked"
          icon={ShieldCheck} iconTone="info"
          value={data.threats.total24h.toLocaleString()}
          delta="last 24h"
          deltaTone="ok"
        />
        <KpiCard
          label="Dead policies"
          icon={FileText} iconTone="danger"
          value={s.policies.dead}
          suffix={` / ${s.policies.total}`}
          delta="no hits 30d"
          deltaTone="danger"
        />
        <KpiCard
          label="Config drift"
          icon={AlertTriangle} iconTone="danger"
          value={s.drift.count}
          delta="needs attention"
          deltaTone="danger"
        />
        <KpiCard
          label="CVE exposures"
          icon={Lock} iconTone="warning"
          value={s.cves?.count ?? data.cves.length}
          delta="1 critical · SSL-VPN"
          deltaTone="warning"
        />
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-3">
        <PolicyHeatmap data={data.heatmap} />
        <ThreatActivity data={data.threats} />
      </div>

      <CveWatchlist data={data.cves} />

      <div className="grid grid-cols-2 gap-3">
        <DriftAlerts data={data.drift} />
        <AdminAudit data={data.audit} />
      </div>

      <ActivityFeed data={data.activity} />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[86px] bg-surface-800 rounded-lg" />
        ))}
      </div>
      <div className="h-[180px] bg-surface-800 rounded-lg" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-[160px] bg-surface-800 rounded-lg" />
        <div className="h-[160px] bg-surface-800 rounded-lg" />
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="p-8 text-center text-ink-400">
      <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-rose-400" strokeWidth={1.7} />
      <div className="text-sm">{message}</div>
    </div>
  );
}
