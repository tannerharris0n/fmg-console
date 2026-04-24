import clsx from 'clsx';
import { Inbox } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title, hint, action, className }) {
  return (
    <div className={clsx('py-10 px-6 text-center', className)}>
      <Icon className="h-6 w-6 mx-auto mb-3 text-ink-400" strokeWidth={1.4} />
      <div className="text-[13px] text-ink-200 font-medium">{title}</div>
      {hint && <div className="text-[12px] text-ink-400 mt-1">{hint}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
