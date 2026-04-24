import clsx from 'clsx';

const VARIANT = {
  neutral: 'bg-surface-700 text-ink-200 ring-surface-600',
  info:    'bg-sky-500/10 text-sky-300 ring-sky-500/30',
  success: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  danger:  'bg-rose-500/10 text-rose-300 ring-rose-500/30',
};

export function Badge({ variant = 'neutral', children, className }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset tabular-nums',
      VARIANT[variant],
      className,
    )}>
      {children}
    </span>
  );
}
