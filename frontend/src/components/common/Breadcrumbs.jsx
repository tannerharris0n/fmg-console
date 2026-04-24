import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';

/**
 * Breadcrumbs - small trail shown in the top bar when the page has context depth.
 *
 *   <Breadcrumbs items={[
 *     { label: 'Devices', to: '/devices' },
 *     { label: 'ot-plant-05a' },   // current, no `to`
 *   ]} />
 */
export function Breadcrumbs({ items = [], className }) {
  if (items.length === 0) return null;

  return (
    <nav className={clsx('flex items-center gap-1 text-[11.5px] text-ink-400', className)} aria-label="Breadcrumb">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {item.to && !last ? (
              <Link to={item.to} className="hover:text-ink-200 transition">{item.label}</Link>
            ) : (
              <span className={last ? 'text-ink-50 font-medium' : ''}>{item.label}</span>
            )}
            {!last && <ChevronRight className="h-3 w-3 text-ink-600" strokeWidth={2} />}
          </span>
        );
      })}
    </nav>
  );
}
