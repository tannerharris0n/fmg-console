import { Lock } from 'lucide-react';
import { Tile } from '../common/Tile';
import { Chip } from '../common/Chip';

const variantFor = (sev) => {
  if (sev === 'critical') return 'danger';
  if (sev === 'high') return 'warning';
  if (sev === 'medium') return 'info';
  return 'neutral';
};

const labelFor = (sev) => ({
  critical: 'CRIT',
  high: 'HIGH',
  medium: 'MED',
  low: 'LOW',
}[sev] || sev.toUpperCase());

export function CveWatchlist({ data = [] }) {
  return (
    <Tile title="CVE watchlist" subtitle="affects installed versions" icon={Lock}>
      <ul className="divide-y divide-surface-600/60">
        {data.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-2 text-[11.5px]">
            <Chip variant={variantFor(c.severity)} className="shrink-0">
              {labelFor(c.severity)} · {c.score}
            </Chip>
            <span className="code shrink-0">{c.id}</span>
            <span className="text-ink-200 flex-1 truncate">
              {c.title}
              <span className="text-ink-400 ml-1">· {c.detail}</span>
            </span>
            <span className="shrink-0 text-rose-400 font-medium tabular-nums">
              {c.affectedDevices} dev
            </span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
