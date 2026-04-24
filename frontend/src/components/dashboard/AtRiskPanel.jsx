import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ArrowRight, Clock } from 'lucide-react';
import { useAtRisk } from '../../hooks/useFmgData';
import { SkeletonLine } from '../common/Skeleton';

const SEV = {
  critical: 'bg-rose-500/10   text-rose-300   ring-rose-500/30',
  high:     'bg-amber-500/10  text-amber-300  ring-amber-500/30',
  medium:   'bg-sky-500/10    text-sky-300    ring-sky-500/30',
  low:      'bg-surface-800   text-ink-400    ring-surface-600/60',
};

export function AtRiskPanel({ items: itemsProp }) {
  const { data, isLoading } = useAtRisk();
  const items = itemsProp ?? data ?? [];

  if (isLoading && !itemsProp) {
    return (
      <section className="tile overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-surface-600/60">
          <div className="flex items-center gap-2">
            <PulseDot />
            <SkeletonLine width="80px" className="h-3" />
          </div>
        </header>
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonLine width="60px" className="h-4" />
              <div className="flex-1 space-y-1">
                <SkeletonLine width="70%" />
                <SkeletonLine width="50%" className="h-2.5" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="tile overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-surface-600/60">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[12.5px] font-medium">All clear</span>
          </div>
          <span className="text-[11px] text-ink-400 flex items-center gap-1">
            <Clock className="h-3 w-3" strokeWidth={1.8} />
            updated just now
          </span>
        </header>
        <div className="p-5 text-center text-[12px] text-ink-400">
          Nothing needs attention right now.
        </div>
      </section>
    );
  }

  return (
    <section className="tile overflow-hidden animate-fade-in">
      <header className="flex items-center justify-between px-4 py-3 border-b border-surface-600/60">
        <div className="flex items-center gap-2">
          <PulseDot />
          <span className="text-[12.5px] font-medium">At risk</span>
          <span className="text-[11px] text-ink-400">{items.length} {items.length === 1 ? 'item needs' : 'items need'} attention</span>
        </div>
        <span className="text-[11px] text-ink-400 flex items-center gap-1">
          <Clock className="h-3 w-3" strokeWidth={1.8} />
          updated just now
        </span>
      </header>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={item.action.to}
              className="grid grid-cols-[76px_1fr_auto] gap-3 items-center px-4 py-2.5 border-b border-surface-600/40 last:border-0 hover:bg-surface-800/60 transition group"
            >
              <span className={clsx(
                'inline-flex items-center justify-center px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider text-[10px] ring-1 whitespace-nowrap',
                SEV[item.severity] || SEV.low
              )}>
                {item.severity}
              </span>
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-ink-50 leading-snug truncate">{item.title}</div>
                <div className="text-[11px] text-ink-400 mt-0.5 truncate">{item.context}</div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-400 group-hover:text-sky-300 transition shrink-0">
                {item.action.label}
                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" strokeWidth={2} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PulseDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
      <span className="relative rounded-full bg-amber-400 h-2 w-2" />
    </span>
  );
}
