import { ShieldCheck } from 'lucide-react';
import { Tile } from '../common/Tile';

export function AdminAudit({ data }) {
  if (!data) return null;
  const { successful24h, failed24h, changes24h, byAdmin = [], suspicious = [] } = data;

  return (
    <Tile title="Admin audit" subtitle="last 24h" icon={ShieldCheck}>
      <div className="flex gap-5 mb-3">
        <Stat value={successful24h} label="successful" tone="text-emerald-400" />
        <Stat value={failed24h}     label="failed"     tone="text-rose-400" />
        <Stat value={changes24h}    label="changes" />
      </div>
      <ul className="space-y-1 text-[11px]">
        {byAdmin.map((a) => (
          <li key={a.name} className="flex items-center justify-between">
            <span className="text-ink-200">{a.name}</span>
            <span className="code">{a.changes} changes</span>
          </li>
        ))}
        {suspicious.map((s) => (
          <li key={s.ip} className="flex items-center justify-between">
            <span className="text-rose-400">unknown · {s.ip}</span>
            <span className="code">{s.attempts} fail</span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div>
      <div className={`text-[20px] font-semibold tabular-nums leading-none ${tone || 'text-ink-50'}`}>
        {value}
      </div>
      <div className="text-[10.5px] text-ink-400 mt-1">{label}</div>
    </div>
  );
}
