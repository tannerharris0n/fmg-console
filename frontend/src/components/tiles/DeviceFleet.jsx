import { Server } from 'lucide-react';
import clsx from 'clsx';
import { Tile } from '../common/Tile';
import { StatusDot } from '../common/StatusDot';

const noteTone = (status) => {
  if (status === 'warning') return 'text-amber-400';
  if (status === 'danger' || status === 'offline') return 'text-rose-400';
  return 'text-ink-400';
};

export function DeviceFleet({ data = [] }) {
  return (
    <Tile title="Device fleet" subtitle={`${data.length} devices`} icon={Server}>
      <div className="grid grid-cols-4 gap-1.5">
        {data.slice(0, 12).map((d) => (
          <button
            key={d.name}
            className="text-left bg-surface-800 hover:bg-surface-700 rounded-md px-2.5 py-2 transition"
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
          </button>
        ))}
      </div>
    </Tile>
  );
}
