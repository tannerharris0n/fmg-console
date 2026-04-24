import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Calendar as CalendarIcon, Rocket, Code2, Package, Award, AlertCircle, User, Clock } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Badge } from '../components/common/Badge';
import { Chip } from '../components/common/Chip';
import { useChangeCalendar } from '../hooks/useFmgData';

const TYPE_META = {
  install:     { Icon: Rocket,      color: 'sky',     label: 'Install' },
  script:      { Icon: Code2,       color: 'purple',  label: 'Script' },
  firmware:    { Icon: Package,     color: 'amber',   label: 'Firmware' },
  maintenance: { Icon: CalendarIcon, color: 'emerald', label: 'Maintenance' },
  cert:        { Icon: Award,       color: 'rose',    label: 'Certificate' },
};

const STATUS_TONE = {
  success:   'success',
  partial:   'warning',
  failed:    'danger',
  scheduled: 'info',
  warning:   'warning',
};

const COLOR_CLASS = {
  sky:     { dot: 'bg-sky-500',     ring: 'ring-sky-500/40',     text: 'text-sky-300',     bg: 'bg-sky-500/10' },
  purple:  { dot: 'bg-purple-500',  ring: 'ring-purple-500/40',  text: 'text-purple-300',  bg: 'bg-purple-500/10' },
  amber:   { dot: 'bg-amber-400',   ring: 'ring-amber-500/40',   text: 'text-amber-300',   bg: 'bg-amber-500/10' },
  emerald: { dot: 'bg-emerald-500', ring: 'ring-emerald-500/40', text: 'text-emerald-300', bg: 'bg-emerald-500/10' },
  rose:    { dot: 'bg-rose-500',    ring: 'ring-rose-500/40',    text: 'text-rose-300',    bg: 'bg-rose-500/10' },
};

function dayKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(d) {
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function buildDays(anchor, spanBack, spanFwd) {
  const days = [];
  for (let i = -spanBack; i <= spanFwd; i++) {
    const d = new Date(anchor);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

function EventRow({ event, compact = false }) {
  const meta = TYPE_META[event.type] || TYPE_META.install;
  const color = COLOR_CLASS[meta.color];
  const Icon = meta.Icon;
  const time = new Date(event.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  if (compact) {
    return (
      <div className={clsx('flex items-center gap-1.5 text-[10.5px] py-0.5 px-1.5 rounded', color.bg)}>
        <Icon className={clsx('h-2.5 w-2.5 shrink-0', color.text)} strokeWidth={2} />
        <span className="truncate text-ink-200">{event.title}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-surface-600/30 last:border-0">
      <div className={clsx('h-7 w-7 rounded-md grid place-items-center shrink-0', color.bg, 'ring-1', color.ring)}>
        <Icon className={clsx('h-3.5 w-3.5', color.text)} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12.5px] font-medium text-ink-50">{event.title}</span>
          <Chip variant={STATUS_TONE[event.status] || 'neutral'}>{event.status}</Chip>
        </div>
        <div className="mt-0.5 text-[11px] text-ink-400 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span className="inline-flex items-center gap-1"><Clock className="h-2.5 w-2.5" strokeWidth={1.8} /> {time}{event.window && ` · ${event.window}`}</span>
          <span>{event.target}</span>
          <span className="inline-flex items-center gap-1"><User className="h-2.5 w-2.5" strokeWidth={1.8} /> {event.owner}</span>
        </div>
        {event.note && <div className="mt-0.5 text-[11px] text-amber-300">{event.note}</div>}
      </div>
    </div>
  );
}

function DayCell({ day, events, isToday, selected, onClick }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const past = day < today;
  const hasEvents = events.length > 0;

  // Highest-severity dot color
  const hasDanger = events.some((e) => e.status === 'failed' || e.type === 'cert');
  const hasWarning = events.some((e) => e.status === 'partial' || e.status === 'warning');
  const hasScheduled = events.some((e) => e.status === 'scheduled');

  return (
    <button
      onClick={onClick}
      className={clsx(
        'h-[96px] rounded-md border transition text-left p-2 flex flex-col',
        selected ? 'border-accent bg-surface-800' : 'border-surface-600/40 bg-surface-900 hover:bg-surface-800/60',
        isToday && !selected && 'ring-1 ring-accent/50',
        past && 'opacity-75'
      )}
    >
      <div className="flex items-center justify-between">
        <span className={clsx('text-[10.5px] uppercase tracking-wider', isToday ? 'text-accent font-semibold' : 'text-ink-400')}>
          {day.toLocaleDateString(undefined, { weekday: 'short' })}
        </span>
        <span className={clsx('text-[13px] font-semibold tabular-nums', isToday ? 'text-ink-50' : 'text-ink-200')}>
          {day.getDate()}
        </span>
      </div>
      {hasEvents ? (
        <div className="mt-1.5 flex-1 flex flex-col gap-0.5 overflow-hidden">
          {events.slice(0, 3).map((e) => {
            const m = TYPE_META[e.type] || TYPE_META.install;
            const c = COLOR_CLASS[m.color];
            return (
              <div key={e.id} className="flex items-center gap-1 min-w-0">
                <span className={clsx('h-1.5 w-1.5 rounded-full shrink-0', c.dot)} />
                <span className="text-[10px] text-ink-200 truncate">{e.title}</span>
              </div>
            );
          })}
          {events.length > 3 && (
            <span className="text-[9.5px] text-ink-400">+{events.length - 3} more</span>
          )}
        </div>
      ) : (
        <div className="mt-1.5 flex-1 flex items-center justify-center">
          <span className="text-[10px] text-ink-600">no changes</span>
        </div>
      )}
      {hasEvents && (
        <div className="flex items-center gap-1 mt-auto">
          {hasDanger && <span className="h-1 w-1 rounded-full bg-rose-500" />}
          {hasWarning && <span className="h-1 w-1 rounded-full bg-amber-400" />}
          {hasScheduled && <span className="h-1 w-1 rounded-full bg-sky-500" />}
        </div>
      )}
    </button>
  );
}

export default function CalendarPage() {
  const { data = [], isLoading } = useChangeCalendar();
  const [selectedKey, setSelectedKey] = useState(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const days = useMemo(() => buildDays(today, 6, 7), [today]);
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const byDay = useMemo(() => {
    const map = {};
    for (const e of data) {
      const k = dayKey(e.at);
      if (!map[k]) map[k] = [];
      map[k].push(e);
    }
    // sort each day by time
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => new Date(a.at) - new Date(b.at));
    }
    return map;
  }, [data]);

  if (isLoading) return <div className="py-6 text-center text-ink-400 text-sm">Loading calendar...</div>;

  const upcoming = data.filter((e) => new Date(e.at) >= today && e.status === 'scheduled');
  const warnings = data.filter((e) => e.status === 'warning' || e.type === 'cert');
  const lastWeek = data.filter((e) => new Date(e.at) < today);
  const totalSuccess = lastWeek.filter((e) => e.status === 'success').length;

  const selectedDayKey = selectedKey || todayKey;
  const selectedEvents = byDay[selectedDayKey] || [];
  const selectedDay = days.find((d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === selectedDayKey) || today;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Upcoming scheduled"  value={upcoming.length}    icon={CalendarIcon} iconTone="info"    delta="next 7 days" deltaTone="muted" />
        <KpiCard label="Warnings"            value={warnings.length}    icon={AlertCircle}  iconTone={warnings.length ? 'warning' : 'muted'} delta="certs expiring soon" deltaTone="warning" />
        <KpiCard label="Last 7 day success"  value={totalSuccess}        icon={Rocket}       iconTone="success" />
        <KpiCard label="Total tracked"       value={data.length}         icon={CalendarIcon} iconTone="muted" />
      </div>

      <Tile title="Change calendar" subtitle="14-day view · click any day to see its details" icon={CalendarIcon}>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            return (
              <DayCell
                key={k}
                day={d}
                events={byDay[k] || []}
                isToday={k === todayKey}
                selected={k === selectedDayKey}
                onClick={() => setSelectedKey(k)}
              />
            );
          })}
        </div>
      </Tile>

      <Tile title={`${dayLabel(selectedDay)} · ${selectedEvents.length} change${selectedEvents.length === 1 ? '' : 's'}`} icon={Clock}>
        {selectedEvents.length === 0 ? (
          <div className="py-8 text-center text-[12px] text-ink-400">No changes scheduled for this day</div>
        ) : (
          <div>
            {selectedEvents.map((e) => <EventRow key={e.id} event={e} />)}
          </div>
        )}
      </Tile>
    </div>
  );
}
