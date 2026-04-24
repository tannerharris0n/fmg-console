import { Tile } from '../common/Tile';
import { StatusDot } from '../common/StatusDot';

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

const toneFor = (type) => {
  if (type === 'warning') return 'text-amber-300';
  if (type === 'danger') return 'text-rose-300';
  return 'text-sky-300';
};

export function ActivityFeed({ data = [] }) {
  return (
    <Tile
      title="Recent activity"
      to="/tasks"
      action={
        <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-400 px-2 py-0.5 rounded-full border border-surface-600/60">
          <StatusDot status="ok" pulse />
          live
        </span>
      }
    >
      <ul className="divide-y divide-surface-600/60">
        {data.map((e, i) => (
          <li key={i} className="py-2 text-[11.5px] first:pt-0 last:pb-0">
            <div className="text-ink-200">
              <span className="font-medium">{e.actor}</span>{' '}
              <span className={toneFor(e.type)}>{e.action}</span>{' '}
              <span className="code">{e.target}</span>
            </div>
            <div className="text-[10.5px] text-ink-400 mt-0.5">
              {e.detail} · {relTime(e.at)}
            </div>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
