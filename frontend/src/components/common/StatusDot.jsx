import clsx from 'clsx';

const COLOR = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-400',
  danger: 'bg-rose-500',
  info: 'bg-sky-400',
  idle: 'bg-surface-500',
};

export function StatusDot({ status = 'ok', size = 'sm', pulse = false, className }) {
  const sz = size === 'lg' ? 'h-2.5 w-2.5' : size === 'md' ? 'h-2 w-2' : 'h-1.5 w-1.5';
  return (
    <span
      aria-hidden
      className={clsx(
        'inline-block rounded-full shrink-0',
        COLOR[status] || COLOR.idle,
        sz,
        pulse && 'animate-pulse',
        className,
      )}
    />
  );
}
