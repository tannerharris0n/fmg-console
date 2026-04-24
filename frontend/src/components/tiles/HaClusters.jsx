import { ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { Tile } from '../common/Tile';
import { StatusDot } from '../common/StatusDot';

const toneClass = (s) => {
  if (s === 'warning') return 'text-amber-400';
  if (s === 'danger') return 'text-rose-400';
  return 'text-ink-400';
};

export function HaClusters({ data = [] }) {
  const atRisk = data.filter((c) => c.status !== 'ok').length;
  return (
    <Tile
      title="HA clusters"
      subtitle={`${data.length} pairs${atRisk ? ` · ${atRisk} at risk` : ''}`}
      icon={ShieldCheck}
      to="/fabric/ha"
    >
      <ul className="space-y-1.5 text-[11.5px]">
        {data.map((c) => (
          <li key={c.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2 min-w-0">
              <StatusDot status={c.status} />
              <span className="text-ink-200 truncate">{c.name}</span>
              <span className="text-ink-400 text-[10.5px]">{c.mode}</span>
            </span>
            <span className={clsx('text-[11px]', toneClass(c.status))}>{c.syncNote}</span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
