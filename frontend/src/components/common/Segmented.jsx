import clsx from 'clsx';

export function Segmented({ value, onChange, options }) {
  return (
    <div className="inline-flex bg-surface-800 rounded-lg p-1 gap-0.5 ring-1 ring-surface-600/60">
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors',
              active
                ? 'bg-surface-700 text-ink-50 shadow-panel'
                : 'text-ink-400 hover:text-ink-200'
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
