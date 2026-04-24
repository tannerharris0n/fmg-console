import clsx from 'clsx';
import { Activity } from 'lucide-react';
import { Tile } from '../common/Tile';

const tone = (status) => {
  switch (status) {
    case 'ok': return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
    case 'warning': return { bar: 'bg-amber-400', text: 'text-amber-400' };
    case 'danger': return { bar: 'bg-rose-500', text: 'text-rose-400' };
    case 'standby': return { bar: 'bg-surface-500', text: 'text-ink-400' };
    default: return { bar: 'bg-surface-500', text: 'text-ink-400' };
  }
};

export function SdwanMatrix({ data = [] }) {
  return (
    <Tile title="SD-WAN SLA" subtitle={`${data.length} overlays`} icon={Activity}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {data.map((o) => {
          const t = tone(o.status);
          const pct = o.sla ?? 100;
          return (
            <div key={o.name}>
              <div className="flex items-center justify-between text-[11.5px] mb-1.5">
                <span className="text-ink-200">{o.name}</span>
                <span className={t.text}>
                  {o.sla != null ? `${o.sla}% · ${o.latencyMs}ms` : 'standby'}
                </span>
              </div>
              <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all', t.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Tile>
  );
}
