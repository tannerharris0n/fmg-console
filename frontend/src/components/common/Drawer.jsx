import { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

/**
 * Right-side sliding drawer. Closes on Esc and overlay click.
 * Used for the Install Preview, drift diff viewer, and any other
 * contextual panel that shouldn't replace the current page.
 */
export function Drawer({ open, onClose, title, subtitle, width = 'md', footer, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widthClass = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }[width] || 'max-w-xl';

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={clsx(
          'relative w-full bg-surface-900 border-l border-surface-600 flex flex-col shadow-2xl animate-slide-up',
          widthClass,
        )}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between px-5 py-4 border-b border-surface-600/60">
          <div className="min-w-0">
            <div className="text-[14px] font-semibold leading-tight">{title}</div>
            {subtitle && <div className="text-[11.5px] text-ink-400 mt-1">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-400 hover:text-ink-50 hover:bg-surface-800 rounded-md transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="px-5 py-3 border-t border-surface-600/60 bg-surface-900/60 flex items-center justify-end gap-2">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
