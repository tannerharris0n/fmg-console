import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

/**
 * Toast store - global bus for transient feedback notifications.
 *
 * Use via the `toast` helper:
 *   import { toast } from '.../useToast';
 *   toast.success('Install completed');
 *   toast.error('Demo environment is read-only', { detail: 'POST /api/install' });
 *   toast.info('Copied CVE-2026-0142 to clipboard');
 */
export const useToastStore = create((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2, 9);
    const toast = { id, kind: 'info', duration: 3500, ...t };
    set({ toasts: [...get().toasts, toast] });
    if (toast.duration > 0) {
      setTimeout(() => get().dismiss(id), toast.duration);
    }
    return id;
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  success: (message, opts = {}) => useToastStore.getState().push({ kind: 'success', message, ...opts }),
  error:   (message, opts = {}) => useToastStore.getState().push({ kind: 'error',   message, duration: 6000, ...opts }),
  info:    (message, opts = {}) => useToastStore.getState().push({ kind: 'info',    message, ...opts }),
  warn:    (message, opts = {}) => useToastStore.getState().push({ kind: 'warning', message, duration: 5000, ...opts }),
};

const KIND = {
  success: { Icon: CheckCircle2, color: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  error:   { Icon: AlertCircle,  color: 'text-rose-400',    ring: 'ring-rose-500/20' },
  warning: { Icon: AlertCircle,  color: 'text-amber-400',   ring: 'ring-amber-500/20' },
  info:    { Icon: Info,         color: 'text-sky-400',     ring: 'ring-sky-500/20' },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[360px] pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const { Icon, color, ring } = KIND[t.kind] || KIND.info;
        return (
          <div
            key={t.id}
            className={clsx(
              'pointer-events-auto bg-surface-900 ring-1 rounded-lg shadow-2xl',
              'px-3 py-2.5 flex items-start gap-2.5 animate-toast-in',
              ring
            )}
          >
            <Icon className={clsx('h-4 w-4 shrink-0 mt-0.5', color)} strokeWidth={1.8} />
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] text-ink-50 font-medium leading-snug">{t.message}</div>
              {t.detail && <div className="text-[11px] text-ink-400 mt-0.5">{t.detail}</div>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-ink-400 hover:text-ink-200 shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Convenience hook for components that want to wire toast into a side effect.
 */
export function useToast() {
  return toast;
}
