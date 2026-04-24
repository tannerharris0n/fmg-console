import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Tile({ title, subtitle, icon: Icon, action, to, children, className, padded = true }) {
  const LinkTitle = to
    ? ({ children }) => (
        <Link to={to} className="group flex items-center gap-2 min-w-0 hover:text-sky-300 transition">
          {children}
          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition" strokeWidth={2} />
        </Link>
      )
    : ({ children }) => <div className="flex items-center gap-2 min-w-0">{children}</div>;

  return (
    <section className={clsx('tile', padded && 'p-4', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between mb-3">
          <LinkTitle>
            {Icon && <Icon className="h-3.5 w-3.5 text-ink-400 shrink-0" strokeWidth={1.7} />}
            <span className="text-[12.5px] font-medium text-ink-50 truncate">{title}</span>
            {subtitle && (
              <span className="text-[11px] text-ink-400 truncate">{subtitle}</span>
            )}
          </LinkTitle>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
