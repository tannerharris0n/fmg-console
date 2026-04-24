import { Link } from 'react-router-dom';
import {
  Server, Link2, Activity, Cloud, ShieldCheck, FileText, AlertTriangle, Lock,
} from 'lucide-react';
import { useUiStore } from '../stores/uiStore';
import { useDashboard } from '../hooks/useDashboard';
import { KpiCard } from '../components/common/KpiCard';
import { SkeletonDashboard } from '../components/common/Skeleton';
import { AtRiskPanel } from '../components/dashboard/AtRiskPanel';
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

/**
 * Make KpiCard clickable via a wrapping Link.
 */
function LinkedKpi({ to, ...props }) {
  return (
    <Link to={to} className="block hover:-translate-y-[1px] focus-visible:-translate-y-[1px] transition-transform">
      <KpiCard {...props} />
    </Link>
  );
}

export default function Dashboard() {
  const preset = useUiStore((s) => s.preset);
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <SkeletonDashboard />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return null;

  return preset === 'security' ? <SecurityPreset data={data} /> : <NetworkPreset data={data} />;
}

function NetworkPreset({ data }) {
  const s = data.summary;
  return (
    <div className="space-y-3">
      <div className="animate-stagger-1">
        <AtRiskPanel items={data.atRisk} />
      </div>

      <div className="grid grid-cols-4 gap-2 animate-stagger-2">
        <LinkedKpi
          to="/devices"
          label="Devices online"
          icon={Server} iconTone="ok"
          value={s.devices.online}
          suffix={` / ${s.devices.total}`}
          delta={`${Math.round((s.devices.online / s.devices.total) * 100)}% availability`}
          deltaTone="ok"
        />
        <LinkedKpi
          to="/fabric/vpn"
          label="VPN tunnels"
          icon={Link2} iconTone="ok"
          value={data.vpn.up}
          suffix={` / ${data.vpn.total}`}
          delta={`${data.vpn.total - data.vpn.up} down · attention`}
          deltaTone="warning"
        />
        <LinkedKpi
          to="/fabric/sdwan"
          label="SD-WAN avg SLA"
          icon={Activity} iconTone="info"
          value={s.sdwan?.avgSla ?? 91}
          suffix="%"
          delta="1 overlay at risk"
          deltaTone="warning"
        />
        <LinkedKpi
          to="/tasks"
          label="Pending installs"
          icon={Cloud} iconTone="warning"
          value={s.installs.pending}
          delta={`1 running · ${s.installs.runningPct}%`}
          deltaTone="info"
        />
      </div>

      <div className="animate-stagger-3"><SdwanMatrix data={data.sdwan} /></div>

      <div className="grid grid-cols-2 gap-3 animate-stagger-4">
        <VpnTunnels data={data.vpn} />
        <HaClusters data={data.ha} />
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-3 animate-stagger-5">
        <DeviceFleet data={data.fleet} />
        <FirmwarePosture data={data.firmware} />
      </div>

      <div className="animate-stagger-6"><ActivityFeed data={data.activity} /></div>
    </div>
  );
}

function SecurityPreset({ data }) {
  const s = data.summary;
  return (
    <div className="space-y-3">
      <div className="animate-stagger-1">
        <AtRiskPanel items={data.atRisk} />
      </div>

      <div className="grid grid-cols-4 gap-2 animate-stagger-2">
        <LinkedKpi
          to="/security/threats"
          label="Threats blocked"
          icon={ShieldCheck} iconTone="info"
          value={data.threats.total24h.toLocaleString()}
          delta="last 24h"
          deltaTone="ok"
        />
        <LinkedKpi
          to="/policy/analyzer"
          label="Dead policies"
          icon={FileText} iconTone="danger"
          value={s.policies.dead}
          suffix={` / ${s.policies.total}`}
          delta="no hits 30d"
          deltaTone="danger"
        />
        <LinkedKpi
          to="/security/drift"
          label="Config drift"
          icon={AlertTriangle} iconTone="danger"
          value={s.drift.count}
          delta="needs attention"
          deltaTone="danger"
        />
        <LinkedKpi
          to="/security/cve"
          label="CVE exposures"
          icon={Lock} iconTone="warning"
          value={s.cves?.count ?? data.cves.length}
          delta="1 critical · SSL-VPN"
          deltaTone="warning"
        />
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-3 animate-stagger-3">
        <PolicyHeatmap data={data.heatmap} />
        <ThreatActivity data={data.threats} />
      </div>

      <div className="animate-stagger-4"><CveWatchlist data={data.cves} /></div>

      <div className="grid grid-cols-2 gap-3 animate-stagger-5">
        <DriftAlerts data={data.drift} />
        <AdminAudit data={data.audit} />
      </div>

      <div className="animate-stagger-6"><ActivityFeed data={data.activity} /></div>
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
