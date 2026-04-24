import { useState, useRef, cloneElement } from 'react';
import clsx from 'clsx';

/**
 * Lightweight tooltip — hover or focus, positioned above by default.
 *
 * Usage:
 *   <Tooltip content="Offline 2h, last sync 8h ago">
 *     <StatusDot status="danger" />
 *   </Tooltip>
 *
 * The child must be a single element that can accept refs and event handlers.
 * For bare elements like <span>/<div>, use the wrapper form:
 *   <Tooltip content="..."><span>...</span></Tooltip>
 */
export function Tooltip({ content, side = 'top', delay = 120, children, className }) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  if (!content) return children;

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  const positionClass =
    side === 'bottom' ? 'top-full mt-1.5' :
    side === 'left'   ? 'right-full mr-1.5 top-1/2 -translate-y-1/2' :
    side === 'right'  ? 'left-full ml-1.5 top-1/2 -translate-y-1/2' :
                        'bottom-full mb-1.5';

  const arrowClass =
    side === 'bottom' ? 'top-[-3px] left-1/2 -translate-x-1/2' :
    side === 'left'   ? 'right-[-3px] top-1/2 -translate-y-1/2' :
    side === 'right'  ? 'left-[-3px] top-1/2 -translate-y-1/2' :
                        'bottom-[-3px] left-1/2 -translate-x-1/2';

  return (
    <span
      className={clsx('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={clsx(
            'absolute z-50 pointer-events-none whitespace-nowrap',
            'bg-surface-950 text-ink-50 text-[11px] leading-relaxed',
            'px-2 py-1 rounded-md shadow-lg ring-1 ring-surface-600/80',
            side === 'top' || side === 'bottom' ? 'left-1/2 -translate-x-1/2' : '',
            positionClass
          )}
        >
          {content}
          <span className={clsx('absolute h-1.5 w-1.5 rotate-45 bg-surface-950 ring-1 ring-surface-600/80', arrowClass)} />
        </span>
      )}
    </span>
  );
}
