import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { FileText, Server, Clock, CheckCircle2, AlertTriangle, Rocket } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Chip } from '../common/Chip';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { usePackageDetail } from '../../hooks/useFmgData';
import { toast } from '../common/Toast';

function relTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

const actionTone = (a) => a === 'accept' ? 'success' : a === 'deny' ? 'danger' : 'neutral';

function RuleRow({ rule }) {
  return (
    <tr className="hover:bg-surface-800/50 transition">
      <td className="py-1.5 px-2 font-mono text-[10.5px] text-ink-400 tabular-nums">{rule.id}</td>
      <td className="py-1.5 px-2">
        <div className="font-medium">{rule.name}</div>
        {rule.profiles?.length > 0 && (
          <div className="flex gap-1 mt-0.5">
            {rule.profiles.slice(0, 3).map((p) => (
              <span key={p} className="text-[9.5px] px-1 py-0.5 rounded bg-surface-800 text-ink-400">{p}</span>
            ))}
          </div>
        )}
      </td>
      <td className="py-1.5 px-2"><span className="code">{rule.src}</span></td>
      <td className="py-1.5 px-2"><span className="code">{rule.dst}</span></td>
      <td className="py-1.5 px-2"><span className="code">{rule.service}</span></td>
      <td className="py-1.5 px-2"><Chip variant={actionTone(rule.action)}>{rule.action}</Chip></td>
      <td className="py-1.5 px-2 text-right text-ink-400 tabular-nums text-[11px]">
        {rule.hits != null ? rule.hits.toLocaleString() : '—'}
      </td>
    </tr>
  );
}

export function PackageDetailDrawer({ name, open, onClose }) {
  const { data, isLoading } = usePackageDetail(open ? name : null);

  const doInstall = () => {
    toast.info('Install is read-only in demo', {
      detail: `Would push ${name} to ${data?.assignedDevices?.length ?? 0} devices`,
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={name || ''}
      subtitle={data?.description}
      width="xl"
      footer={
        data && (
          <div className="flex items-center gap-2 w-full">
            <div className="text-[11px] text-ink-400 flex-1">
              {data.ruleCount} rules · {data.assignedDevices.length} devices assigned
            </div>
            <Button variant="primary" icon={Rocket} onClick={doInstall}>Install preview</Button>
          </div>
        )
      }
    >
      {isLoading && <div className="text-[12px] text-ink-400">Loading package...</div>}
      {data && (
        <div className="space-y-5">
          <section className="grid grid-cols-4 gap-2">
            <Stat label="Rules"               value={data.ruleCount} />
            <Stat label="Devices"             value={data.assignedDevices.length} />
            <Stat label="Last install"        value={relTime(data.lastInstall)} />
            <Stat label="Enabled rules"       value={data.rules.filter((r) => r.enabled).length} />
          </section>

          <section>
            <h3 className="text-[12px] font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
              Rules
            </h3>
            <div className="bg-surface-800 rounded-md overflow-hidden">
              <table className="w-full text-left text-[12px]">
                <thead className="text-ink-400 text-[10.5px] border-b border-surface-600/60">
                  <tr>
                    <th className="py-2 px-2 font-medium">#</th>
                    <th className="py-2 px-2 font-medium">Name</th>
                    <th className="py-2 px-2 font-medium">Source</th>
                    <th className="py-2 px-2 font-medium">Destination</th>
                    <th className="py-2 px-2 font-medium">Service</th>
                    <th className="py-2 px-2 font-medium">Action</th>
                    <th className="py-2 px-2 font-medium text-right">Hits 30d</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-600/30">
                  {data.rules.map((r) => <RuleRow key={r.id} rule={r} />)}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-[12px] font-semibold mb-2 flex items-center gap-2">
              <Server className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
              Assigned devices ({data.assignedDevices.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {data.assignedDevices.map((d) => (
                <Link key={d} to={`/devices/${encodeURIComponent(d)}`}
                  className="text-[11px] px-2 py-0.5 rounded bg-surface-800 hover:bg-surface-700 text-ink-200 hover:text-sky-300 transition">
                  {d}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[12px] font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
              Install history
            </h3>
            <ul className="bg-surface-800 rounded-md divide-y divide-surface-600/30">
              {data.installHistory.map((h, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2 text-[11.5px]">
                  <span className="text-ink-400 tabular-nums w-14 shrink-0">{relTime(h.at)}</span>
                  <Chip variant={h.result === 'success' ? 'success' : h.result === 'partial' ? 'warning' : 'danger'}>
                    {h.result}
                  </Chip>
                  <span className="text-ink-200">{h.devices} devices</span>
                  <span className="text-ink-400">·</span>
                  <span className="text-ink-400">{h.duration}s</span>
                  <span className="text-ink-400">·</span>
                  <span className="text-ink-400">by {h.by}</span>
                  {h.note && <span className="text-amber-300 text-[11px]">{h.note}</span>}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </Drawer>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-surface-800 rounded-md px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-400">{label}</div>
      <div className="text-[17px] font-semibold tabular-nums text-ink-50 mt-0.5">{value}</div>
    </div>
  );
}
