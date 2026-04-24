import { FileText } from 'lucide-react';
import clsx from 'clsx';
import { Tile } from '../common/Tile';

const BUCKET_BG = {
  heavy:    'bg-emerald-500',
  active:   'bg-emerald-500/70',
  moderate: 'bg-emerald-500/40',
  low:      'bg-surface-500',
  dead:     'bg-rose-500',
};

export function PolicyHeatmap({ data }) {
  if (!data) return null;
  const { rules, summary } = data;

  return (
    <Tile title="Policy hit heatmap" subtitle={`${summary.total} rules · 30d`} icon={FileText} to="/policy/analyzer">
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[3px] mb-3">
        {rules.map((r) => (
          <div
            key={r.id}
            title={`${r.name} · ${r.hits.toLocaleString()} hits`}
            className={clsx(
              'aspect-square rounded-[2px] transition-transform hover:scale-125 cursor-pointer',
              BUCKET_BG[r.bucket]
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[11px] text-ink-400">
        <Legend swatch="bg-emerald-500" tone="text-emerald-400" count={summary.active + summary.heavy} label="active" />
        <Legend swatch="bg-rose-500"    tone="text-rose-400"    count={summary.dead} label="dead" />
        <Legend swatch="bg-surface-500" tone="text-ink-400"     count={summary.low}  label="low use" />
      </div>
    </Tile>
  );
}

function Legend({ swatch, tone, count, label }) {
  return (
    <span className={clsx('flex items-center gap-1.5', tone)}>
      <span className={clsx('h-2 w-2 rounded-sm', swatch)} />
      {count} {label}
    </span>
  );
}
