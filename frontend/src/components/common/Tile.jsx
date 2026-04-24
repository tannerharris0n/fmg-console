import clsx from 'clsx';

export function Tile({ title, subtitle, icon: Icon, action, children, className, padded = true }) {
  return (
    <section className={clsx('tile', padded && 'p-4', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className="h-3.5 w-3.5 text-ink-400 shrink-0" strokeWidth={1.7} />}
            <span className="text-[12.5px] font-medium text-ink-50 truncate">{title}</span>
            {subtitle && (
              <span className="text-[11px] text-ink-400 truncate">{subtitle}</span>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
