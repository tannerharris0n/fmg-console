import { Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Tile } from '../common/Tile';

export function ThreatActivity({ data }) {
  if (!data) return null;
  const { total24h, points, top } = data;

  return (
    <Tile title="Threat activity" subtitle="last 24h" icon={Activity}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[22px] font-semibold tabular-nums">{total24h.toLocaleString()}</div>
        <div className="text-[11px] text-ink-400">blocks</div>
      </div>
      <div className="h-12 -mx-1 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points}>
            <defs>
              <linearGradient id="thr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#378ADD" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#378ADD" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="count"
              stroke="#378ADD"
              strokeWidth={1.5}
              fill="url(#thr)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 text-[11px]">
        {top.map((t) => (
          <li key={t.name} className="flex items-center justify-between">
            <span className="text-ink-200 truncate">
              <span className="text-ink-400 text-[10px] mr-1.5">{t.category}</span>
              {t.name}
            </span>
            <span className="code">{t.count.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
