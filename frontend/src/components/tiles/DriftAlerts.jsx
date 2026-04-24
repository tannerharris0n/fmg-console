import { AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { Tile } from '../common/Tile';
import { Chip } from '../common/Chip';

const bgFor = (sev) => {
  if (sev === 'danger') return 'bg-rose-500/10 border-rose-500/30';
  if (sev === 'warning') return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-surface-800 border-surface-600';
};

const toneFor = (sev) => {
  if (sev === 'danger') return 'text-rose-300';
  if (sev === 'warning') return 'text-amber-300';
  return 'text-ink-200';
};

export function DriftAlerts({ data = [] }) {
  return (
    <Tile
      title="Drift alerts"
      subtitle={`${data.length} device${data.length === 1 ? '' : 's'} diverged`}
      icon={AlertTriangle}
    >
      <ul className="space-y-2">
        {data.map((a) => (
          <li
            key={a.device}
            className={clsx('rounded-md px-3 py-2 border', bgFor(a.severity))}
          >
            <div className="flex items-center justify-between text-[11.5px]">
              <span className={clsx('font-semibold', toneFor(a.severity))}>{a.device}</span>
              <Chip variant={a.severity}>
                {a.diffCount} diff{a.diffCount === 1 ? '' : 's'}
              </Chip>
            </div>
            <div className="text-[10.5px] text-ink-400 mt-1">{a.note}</div>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
