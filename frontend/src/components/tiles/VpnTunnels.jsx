import { Link2 } from 'lucide-react';
import { Tile } from '../common/Tile';
import { StatusDot } from '../common/StatusDot';

export function VpnTunnels({ data }) {
  if (!data) return null;
  const { up, total, sslActive, down = [] } = data;
  const upPct = total ? Math.round((up / total) * 100) : 0;

  return (
    <Tile title="VPN tunnels" subtitle="IPsec + SSL" icon={Link2}>
      <div className="flex items-center gap-3 mb-3">
        <div className="text-[26px] font-semibold leading-none tabular-nums">
          {up}
          <span className="text-[13px] font-normal text-ink-400">/{total}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-800">
            <div className="bg-emerald-500" style={{ width: `${upPct}%` }} />
            <div className="bg-rose-500" style={{ width: `${100 - upPct}%` }} />
          </div>
          <div className="text-[10.5px] text-ink-400 mt-1.5">
            SSL-VPN users: <span className="text-ink-200 tabular-nums">{sslActive}</span> active
          </div>
        </div>
      </div>

      {down.length > 0 && (
        <ul className="space-y-1.5 text-[11.5px]">
          {down.map((t) => (
            <li key={t.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 min-w-0">
                <StatusDot status="danger" />
                <span className="truncate text-ink-200">{t.name}</span>
              </span>
              <span className="code">down {t.downFor}</span>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}
