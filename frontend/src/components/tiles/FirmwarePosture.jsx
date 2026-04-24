import { Cloud } from 'lucide-react';
import clsx from 'clsx';
import { Tile } from '../common/Tile';
import { StatusDot } from '../common/StatusDot';

const barColor = (status) => {
  if (status === 'warning') return 'bg-amber-400';
  if (status === 'danger') return 'bg-rose-500';
  return 'bg-emerald-500';
};

export function FirmwarePosture({ data }) {
  if (!data) return null;
  const { total, buckets } = data;
  return (
    <Tile title="Firmware" subtitle={`${total} devices`} icon={Cloud}>
      <div className="flex h-2 rounded-full overflow-hidden mb-3">
        {buckets.map((b, i) => (
          <div
            key={b.version}
            className={clsx(
              barColor(b.status),
              i === 0 ? '' : 'ml-px',
            )}
            style={{ width: `${(b.count / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="space-y-1 text-[11px]">
        {buckets.map((b) => (
          <li key={b.version} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-200">
              <StatusDot status={b.status} />
              <span className="tabular-nums">{b.version}</span>
              {b.label && <span className="text-ink-400">{b.label}</span>}
            </span>
            <span className="code">{b.count}</span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
