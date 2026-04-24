import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, GitCompare, Rocket, RotateCcw, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Tile } from '../components/common/Tile';
import { Chip } from '../components/common/Chip';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { toast } from '../components/common/Toast';
import { useDriftDetail } from '../hooks/useFmgData';

function useDriftList() {
  return useQuery({
    queryKey: ['drift', 'list'],
    queryFn: () => api.get('/security/drift'),
  });
}

function DiffRow({ diff }) {
  return (
    <li className="py-3 first:pt-0 last:pb-0 border-b border-surface-600/40 last:border-0">
      <div className="text-[11px] text-ink-400 font-mono">{diff.path}</div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-md px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-emerald-400 mb-1">Package (intent)</div>
          <div className="text-[12px] text-ink-50 font-mono break-all">
            {diff.package || <span className="text-ink-600">(empty)</span>}
          </div>
        </div>
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-md px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-rose-400 mb-1">Live (on device)</div>
          <div className="text-[12px] text-ink-50 font-mono break-all">
            {diff.live || <span className="text-ink-600">(empty)</span>}
          </div>
        </div>
      </div>
      {diff.note && (
        <div className="text-[11px] text-ink-400 mt-2">{diff.note}</div>
      )}
    </li>
  );
}

export default function Drift() {
  const { data: list = [] } = useDriftList();
  const [selected, setSelected] = useState(list[0]?.device);
  const activeDevice = selected || list[0]?.device;
  const { data: detail, isLoading } = useDriftDetail(activeDevice);

  if (!list.length) {
    return (
      <Tile title="Config drift" icon={AlertTriangle}>
        <EmptyState title="No drift detected" hint="Managed devices currently match their policy packages." />
      </Tile>
    );
  }

  return (
    <div className="grid grid-cols-[220px_1fr] gap-3 animate-fade-in">
      <aside className="tile p-2 h-fit">
        <div className="text-[11px] uppercase tracking-widest text-ink-600 px-2 py-1.5">
          Diverged devices
        </div>
        <ul className="space-y-0.5">
          {list.map((d) => (
            <li key={d.device}>
              <button
                onClick={() => setSelected(d.device)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] transition ${
                  activeDevice === d.device
                    ? 'bg-surface-700 text-ink-50 font-medium'
                    : 'text-ink-200 hover:bg-surface-800'
                }`}
              >
                <span className="truncate">{d.device}</span>
                <Chip variant={d.severity}>{d.diffCount}</Chip>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <Tile
        title={`Drift: ${activeDevice || ''}`}
        subtitle={detail ? `${detail.diffs.length} settings diverged` : 'Loading...'}
        icon={GitCompare}
        action={
          detail && (
            <div className="flex gap-2 items-center">
              {activeDevice && (
                <Link
                  to={`/devices/${encodeURIComponent(activeDevice)}`}
                  className="inline-flex items-center gap-1 text-[11px] text-ink-400 hover:text-sky-300 transition"
                >
                  <ExternalLink className="h-3 w-3" strokeWidth={1.8} />
                  View device
                </Link>
              )}
              <Button
                size="sm" variant="ghost" icon={RotateCcw}
                onClick={() => toast.info('Pull is read-only in demo', { detail: `Would pull live config from ${activeDevice} into package` })}
              >
                Pull live into package
              </Button>
              <Button
                size="sm" variant="primary" icon={Rocket}
                onClick={() => toast.info('Push is read-only in demo', { detail: `Would push package to ${activeDevice}` })}
              >
                Push package to device
              </Button>
            </div>
          )
        }
      >
        {isLoading && <div className="text-[12px] text-ink-400 animate-pulse">Loading diff...</div>}
        {detail && (
          <ul>
            {detail.diffs.map((d, i) => <DiffRow key={i} diff={d} />)}
          </ul>
        )}
      </Tile>
    </div>
  );
}
