import clsx from 'clsx';

const VARIANT = {
  primary:   'bg-accent hover:bg-accent/90 text-white border-transparent',
  secondary: 'bg-surface-800 hover:bg-surface-700 text-ink-50 border-surface-600',
  ghost:     'bg-transparent hover:bg-surface-800 text-ink-200 border-transparent',
  danger:    'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const SIZE = {
  sm: 'text-[11px] px-2.5 py-1 gap-1.5',
  md: 'text-[12px] px-3 py-1.5 gap-2',
  lg: 'text-[13px] px-4 py-2 gap-2',
};

export function Button({ variant = 'secondary', size = 'md', icon: Icon, children, className, ...rest }) {
  return (
    <button
      {...rest}
      className={clsx(
        'inline-flex items-center font-medium rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />}
      {children}
    </button>
  );
}
