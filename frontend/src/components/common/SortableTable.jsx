import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

/**
 * useSortable — manage sort state and produce sorted data.
 *
 *   const { sorted, sort, setSort } = useSortable(rows, { key: 'name', dir: 'asc' });
 *
 * Sort keys can be field names, or "resolvers" — functions (row) => comparable.
 * Pass them via the `resolvers` map:
 *
 *   useSortable(rows, defaultSort, { name: (r) => r.name.toLowerCase() })
 */
export function useSortable(rows, initial = null, resolvers = {}) {
  const [sort, setSort] = useState(initial);

  const sorted = useMemo(() => {
    if (!sort || !rows) return rows;
    const { key, dir } = sort;
    const resolve = resolvers[key] || ((r) => r[key]);
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = resolve(a);
      const vb = resolve(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return dir === 'asc' ? va - vb : vb - va;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      return dir === 'asc' ? sa.localeCompare(sb, undefined, { numeric: true }) : sb.localeCompare(sa, undefined, { numeric: true });
    });
    return copy;
  }, [rows, sort, resolvers]);

  const toggle = (key) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  return { sorted, sort, setSort, toggle };
}

/**
 * SortableTh — table header cell that shows sort arrows and toggles state when clicked.
 */
export function SortableTh({ sortKey, sort, onToggle, align = 'left', className, children }) {
  const active = sort?.key === sortKey;
  const dir = active ? sort.dir : null;
  const Icon = dir === 'asc' ? ChevronUp : dir === 'desc' ? ChevronDown : ChevronsUpDown;

  return (
    <th className={clsx('py-2 px-2 font-medium', className)} align={align}>
      <button
        onClick={() => onToggle(sortKey)}
        className={clsx(
          'inline-flex items-center gap-1 hover:text-ink-200 transition group',
          active ? 'text-ink-200' : 'text-ink-400'
        )}
      >
        {children}
        <Icon
          className={clsx(
            'h-2.5 w-2.5 transition',
            active ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'
          )}
          strokeWidth={2.4}
        />
      </button>
    </th>
  );
}
