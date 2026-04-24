import clsx from 'clsx';

const DELTA = {
  ok: 'text-emerald-400',
  warning: 'text-amber-400',
  danger: 'text-rose-400',
  info: 'text-sky-400',
  muted: 'text-ink-400',
};

export function KpiCard({ label, icon: Icon, iconTone = 'muted', value, suffix, delta, deltaTone = 'muted' }) {
  return (
    <div className="bg-surface-800 rounded-lg p-3 ring-1 ring-white/[0.02]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-ink-400">{label}</span>
        {Icon && <Icon className={clsx('h-3 w-3', DELTA[iconTone])} strokeWidth={1.8} />}
      </div>
      <div className="mt-1 text-[22px] font-medium leading-tight text-ink-50 tabular-nums">
        {value}
        {suffix && <span className="text-[13px] text-ink-400 font-normal">{suffix}</span>}
      </div>
      {delta && (
        <div className={clsx('text-[11px] mt-0.5', DELTA[deltaTone])}>
          {delta}
        </div>
      )}
    </div>
  );
}
