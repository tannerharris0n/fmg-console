import clsx from 'clsx';
import { Rocket, Plus, Pencil, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Drawer } from './common/Drawer';
import { Badge } from './common/Badge';
import { Button } from './common/Button';
import { useInstallPreview, useExecuteInstall } from '../hooks/useFmgData';

const KIND_META = {
  add:    { icon: Plus,   class: 'text-emerald-400 bg-emerald-500/10', label: 'add' },
  modify: { icon: Pencil, class: 'text-amber-400 bg-amber-500/10',    label: 'modify' },
  remove: { icon: Minus,  class: 'text-rose-400 bg-rose-500/10',      label: 'remove' },
};

function ChangeRow({ change }) {
  const meta = KIND_META[change.kind] || KIND_META.modify;
  const Icon = meta.icon;
  return (
    <li className="flex items-start gap-2.5 py-2 border-b border-surface-600/30 last:border-0">
      <div className={clsx('h-5 w-5 rounded grid place-items-center shrink-0 mt-0.5', meta.class)}>
        <Icon className="h-3 w-3" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] uppercase tracking-wide text-ink-400">{change.section}</div>
        <div className="text-[12px] text-ink-50 font-mono leading-snug mt-0.5">{change.detail}</div>
      </div>
    </li>
  );
}

function TargetRow({ target }) {
  const statusIcon =
    target.status === 'warning' ? <AlertTriangle className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.8} /> :
    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.8} />;
  return (
    <li className="flex items-center justify-between py-1.5 text-[12px]">
      <span className="flex items-center gap-2">
        {statusIcon}
        <span className="text-ink-50 font-medium">{target.device}</span>
        {target.note && <span className="text-[11px] text-amber-300">{target.note}</span>}
      </span>
      <span className="flex gap-2 text-[11px] tabular-nums">
        <span className="text-emerald-400">+{target.added}</span>
        <span className="text-amber-400">~{target.modified}</span>
        <span className="text-rose-400">−{target.removed}</span>
      </span>
    </li>
  );
}

export function InstallPreview({ packageId, open, onClose, onInstalled }) {
  const { data, isLoading } = useInstallPreview(open ? packageId : null);
  const execute = useExecuteInstall();

  const handleInstall = async () => {
    try {
      const result = await execute.mutateAsync(packageId);
      onInstalled?.(result);
      onClose?.();
    } catch (err) {
      // error surfaces inline below
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Install preview: ${packageId || ''}`}
      subtitle={data ? `v${data.previousVersion} → v${data.version}` : 'Computing diff...'}
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={execute.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Rocket}
            onClick={handleInstall}
            disabled={!data || execute.isPending}
          >
            {execute.isPending ? 'Installing...' : `Install to ${data?.targets?.length || 0} device${data?.targets?.length === 1 ? '' : 's'}`}
          </Button>
        </>
      }
    >
      {isLoading && (
        <div className="text-[12px] text-ink-400 animate-pulse">Computing changes...</div>
      )}

      {data && (
        <div className="space-y-5">
          <section className="grid grid-cols-4 gap-2">
            <Stat label="New rules"      value={data.impact.newRules}      tone="text-emerald-400" />
            <Stat label="Modified rules" value={data.impact.modifiedRules} tone="text-amber-400" />
            <Stat label="New objects"    value={data.impact.newObjects} />
            <Stat label="Est. downtime"  value={`${data.impact.estimatedDowntimeSeconds}s`} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[12px] font-semibold text-ink-50">Target devices</h3>
              <Badge variant="neutral">{data.targets.length}</Badge>
            </div>
            <ul className="bg-surface-800 rounded-md px-3 divide-y divide-surface-600/40">
              {data.targets.map((t) => <TargetRow key={t.device} target={t} />)}
            </ul>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[12px] font-semibold text-ink-50">Changes</h3>
              <Badge variant="neutral">{data.changes.length}</Badge>
            </div>
            <ul className="bg-surface-800 rounded-md px-3">
              {data.changes.map((c, i) => <ChangeRow key={i} change={c} />)}
            </ul>
          </section>

          {execute.error && (
            <div className="rounded-md bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-[12px] text-rose-300">
              Install failed: {execute.error.message}
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="bg-surface-800 rounded-md px-3 py-2">
      <div className="text-[10.5px] text-ink-400">{label}</div>
      <div className={clsx('text-[16px] font-semibold tabular-nums leading-tight mt-0.5', tone || 'text-ink-50')}>
        {value}
      </div>
    </div>
  );
}
