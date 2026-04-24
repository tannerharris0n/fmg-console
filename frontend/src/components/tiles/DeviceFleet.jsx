import { Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Tile } from '../common/Tile';
import { StatusDot } from '../common/StatusDot';
import { Tooltip } from '../common/Tooltip';

const noteTone = (status) => {
  if (status === 'warning') return 'text-amber-400';
  if (status === 'danger' || status === 'offline') return 'text-rose-400';
  return 'text-ink-400';
};

const statusDescription = (d) => {
  if (d.status === 'ok') return `online · ${d.firmware}`;
  if (d.status === 'warning') return `${d.note || 'attention'} · ${d.firmware}`;
  if (d.status === 'danger') return `${d.note || 'offline'} · ${d.firmware}`;
  return d.firmware;
};

export function DeviceFleet({ data = [] }) {
  const managed = data.filter((d) => d.managed !== false);
  return (
    <Tile title="Device fleet" subtitle={`${managed.length} devices`} icon={Server} to="/devices">
      <div className="grid grid-cols-4 gap-1.5">
        {managed.slice(0, 12).map((d) => (
          <Tooltip key={d.name} content={statusDescription(d)} side="top">
            <Link
              to={`/devices/${encodeURIComponent(d.name)}`}
              className="block w-full text-left bg-surface-800 hover:bg-surface-700 rounded-md px-2.5 py-2 transition"
            >
              <div className="flex items-center gap-1.5">
                <StatusDot
                  status={d.status === 'ok' ? 'ok' : d.status === 'warning' ? 'warning' : 'danger'}
                />
                <span className="text-[11px] font-medium truncate">{d.name}</span>
              </div>
              <div className={clsx('text-[10px] mt-0.5', noteTone(d.status))}>
                {d.note ?? `${d.platform?.replace('FortiGate-', '') || ''} · ${d.firmware || ''}`}
              </div>
            </Link>
          </Tooltip>
        ))}
      </div>
    </Tile>
  );
}
