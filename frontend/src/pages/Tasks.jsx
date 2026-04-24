import clsx from 'clsx';
import { Zap, CheckCircle2, AlertCircle, Clock, RotateCw } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { useTasks } from '../hooks/useFmgData';

const STATE_META = {
  running: { icon: RotateCw,      tone: 'info',    label: 'running',  iconClass: 'text-sky-400 animate-spin' },
  queued:  { icon: Clock,         tone: 'neutral', label: 'queued',   iconClass: 'text-ink-400' },
  done:    { icon: CheckCircle2,  tone: 'success', label: 'done',     iconClass: 'text-emerald-400' },
  failed:  { icon: AlertCircle,   tone: 'danger',  label: 'failed',   iconClass: 'text-rose-400' },
};

const TYPE_COLOR = {
  install:  'text-sky-300',
  script:   'text-emerald-300',
  firmware: 'text-amber-300',
};

function relTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function ProgressBar({ percent, state }) {
  const color =
    state === 'failed' ? 'bg-rose-500' :
    state === 'done'   ? 'bg-emerald-500' :
    state === 'running'? 'bg-sky-500' :
                         'bg-surface-500';
  return (
    <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
      <div
        className={clsx('h-full transition-all duration-500', color)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function TaskRow({ task }) {
  const meta = STATE_META[task.state] || STATE_META.queued;
  const Icon = meta.icon;

  return (
    <div className="py-3 first:pt-0 last:pb-0 border-b border-surface-600/30 last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <Icon className={clsx('h-4 w-4 mt-0.5 shrink-0', meta.iconClass)} strokeWidth={1.7} />
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium text-ink-50 truncate">{task.name}</div>
            <div className="text-[11px] text-ink-400 flex items-center gap-2 flex-wrap mt-0.5">
              <span className={TYPE_COLOR[task.type] || 'text-ink-400'}>{task.type}</span>
              <span>·</span>
              <span>{task.targets} target{task.targets === 1 ? '' : 's'}</span>
              <span>·</span>
              <span>{task.user}</span>
              <span>·</span>
              <span>{relTime(task.startedAt || task.endedAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] tabular-nums text-ink-200">{task.percent}%</span>
          <Badge variant={meta.tone}>{meta.label}</Badge>
        </div>
      </div>
      <ProgressBar percent={task.percent} state={task.state} />
      {task.error && (
        <div className="text-[11px] text-rose-300 mt-2">
          {task.error}
        </div>
      )}
    </div>
  );
}

export default function Tasks() {
  const { data = [], isLoading } = useTasks();

  const running = data.filter((t) => t.state === 'running');
  const queued  = data.filter((t) => t.state === 'queued');
  const recent  = data.filter((t) => t.state === 'done' || t.state === 'failed');

  if (isLoading) {
    return <div className="py-6 text-center text-ink-400 text-sm">Loading tasks...</div>;
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <Tile
        title="Running"
        subtitle={`${running.length} active`}
        icon={Zap}
      >
        {running.length === 0 ? (
          <EmptyState title="Nothing running" hint="Install and script jobs show up here in real time." />
        ) : (
          running.map((t) => <TaskRow key={t.id} task={t} />)
        )}
      </Tile>

      {queued.length > 0 && (
        <Tile title="Queued" subtitle={`${queued.length} waiting`} icon={Clock}>
          {queued.map((t) => <TaskRow key={t.id} task={t} />)}
        </Tile>
      )}

      <Tile title="Recent" subtitle={`${recent.length} completed`} icon={CheckCircle2}>
        {recent.length === 0 ? (
          <EmptyState title="No recent history" />
        ) : (
          recent.map((t) => <TaskRow key={t.id} task={t} />)
        )}
      </Tile>
    </div>
  );
}
