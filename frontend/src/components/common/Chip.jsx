import clsx from 'clsx';

const VARIANT = {
  neutral: 'bg-surface-700 text-ink-200',
  info:    'bg-sky-500/15 text-sky-300',
  success: 'bg-emerald-500/15 text-emerald-300',
  warning: 'bg-amber-500/15 text-amber-300',
  danger:  'bg-rose-500/15 text-rose-300',
};

export function Chip({ variant = 'neutral', children, className }) {
  return (
    <span className={clsx('chip', VARIANT[variant], className)}>
      {children}
    </span>
  );
}
