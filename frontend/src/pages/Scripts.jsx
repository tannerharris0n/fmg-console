import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Code2, Search, Play, Copy, CheckCircle2, XCircle, Clock, Terminal, FileCode2 } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Chip } from '../components/common/Chip';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useSortable, SortableTh } from '../components/common/SortableTable';
import { useScripts } from '../hooks/useFmgData';
import { toast } from '../components/common/Toast';

function relTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

function ScriptBody({ body, type }) {
  const lines = body.split('\n');
  const onCopy = () => {
    navigator.clipboard.writeText(body).catch(() => {});
    toast.success('Script copied to clipboard');
  };
  return (
    <div className="rounded-md overflow-hidden border border-surface-600/60 bg-surface-950">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-surface-600/60 bg-surface-900">
        <div className="flex items-center gap-2">
          <Terminal className="h-3 w-3 text-ink-400" strokeWidth={1.7} />
          <span className="text-[10.5px] text-ink-400 uppercase tracking-wider">{type}</span>
        </div>
        <button onClick={onCopy} className="text-[11px] text-ink-400 hover:text-ink-200 transition inline-flex items-center gap-1">
          <Copy className="h-3 w-3" strokeWidth={1.8} />
          copy
        </button>
      </div>
      <pre className="text-[11.5px] font-mono leading-relaxed p-3 text-ink-200 overflow-x-auto">
        {lines.map((l, i) => (
          <div key={i} className="flex">
            <span className="select-none text-ink-600 tabular-nums pr-3 text-right" style={{ minWidth: 30 }}>{i + 1}</span>
            <span>{l || ' '}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

function ScriptDetail({ script }) {
  if (!script) return <EmptyState icon={FileCode2} title="Select a script" hint="Pick from the library on the left to view its body and run history." />;

  const onRun = () => toast.info('Script run is read-only in demo', {
    detail: `Would queue "${script.name}" for device selection`,
  });
  const onDryRun = () => toast.info('Dry run is read-only in demo', {
    detail: `Would simulate "${script.name}" against staged devices without committing`,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[15px] font-semibold text-ink-50">{script.name}</h2>
            <Badge variant={script.type === 'CLI' ? 'info' : 'warning'}>{script.type}</Badge>
          </div>
          <p className="text-[12px] text-ink-400">{script.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {script.tags.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-ink-400">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="ghost" icon={Play} onClick={onDryRun}>Dry run</Button>
          <Button size="sm" variant="primary" icon={Play} onClick={onRun}>Run on devices</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MetaBox label="Last run"    value={relTime(script.lastRun)} />
        <MetaBox label="Total runs"  value={script.runCount} mono />
        <MetaBox label="Script ID"    value={script.id} mono />
      </div>

      <ScriptBody body={script.body} type={script.type} />
    </div>
  );
}

function MetaBox({ label, value, mono }) {
  return (
    <div className="bg-surface-800 rounded-md px-3 py-2">
      <div className="text-[10px] text-ink-400 uppercase tracking-wider">{label}</div>
      <div className={clsx('text-[12.5px] mt-0.5 text-ink-50 font-medium', mono && 'font-mono')}>{value}</div>
    </div>
  );
}

function RunHistory({ runs }) {
  const { sorted, sort, toggle } = useSortable(runs, { key: 'startedAt', dir: 'desc' });
  return (
    <table className="w-full text-left text-[11.5px]">
      <thead className="text-ink-400 text-[10.5px] border-b border-surface-600/60">
        <tr>
          <SortableTh sortKey="startedAt" sort={sort} onToggle={toggle}>Time</SortableTh>
          <SortableTh sortKey="script"    sort={sort} onToggle={toggle}>Script</SortableTh>
          <SortableTh sortKey="device"    sort={sort} onToggle={toggle}>Device</SortableTh>
          <SortableTh sortKey="duration"  sort={sort} onToggle={toggle}>Duration</SortableTh>
          <SortableTh sortKey="result"    sort={sort} onToggle={toggle}>Result</SortableTh>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-800">
        {sorted.map((r) => (
          <tr key={r.id} className="hover:bg-surface-800/50 transition">
            <td className="py-1.5 px-2 text-ink-400 tabular-nums">{relTime(r.startedAt)}</td>
            <td className="py-1.5 px-2 font-medium">{r.script}</td>
            <td className="py-1.5 px-2"><span className="code">{r.device}</span></td>
            <td className="py-1.5 px-2 text-ink-400 tabular-nums">{r.result === 'fail' ? '—' : `${r.duration}s`}</td>
            <td className="py-1.5 px-2">
              {r.result === 'success' ? (
                <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3 w-3" strokeWidth={1.8} />success</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-400" title={r.error || ''}><XCircle className="h-3 w-3" strokeWidth={1.8} />fail</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Scripts() {
  const { data, isLoading } = useScripts();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!query) return data.library;
    const l = query.toLowerCase();
    return data.library.filter((s) =>
      s.name.toLowerCase().includes(l) ||
      s.description.toLowerCase().includes(l) ||
      s.tags.some((t) => t.includes(l))
    );
  }, [data, query]);

  const selected = useMemo(() => {
    if (!data) return null;
    return data.library.find((s) => s.id === selectedId) || data.library[0];
  }, [data, selectedId]);

  if (isLoading || !data) return <div className="py-6 text-center text-ink-400 text-sm">Loading scripts...</div>;

  const totalRuns = data.library.reduce((a, s) => a + s.runCount, 0);
  const recentFails = data.recentRuns.filter((r) => r.result === 'fail').length;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Scripts in library" value={data.library.length} icon={Code2} iconTone="info" />
        <KpiCard label="Total executions" value={totalRuns} icon={Play} iconTone="muted" />
        <KpiCard label="Recent runs (7d)" value={data.recentRuns.length} icon={Clock} iconTone="muted" />
        <KpiCard
          label="Recent failures"
          value={recentFails}
          icon={XCircle}
          iconTone={recentFails ? 'danger' : 'ok'}
          delta={recentFails ? 'investigate' : 'all clear'}
          deltaTone={recentFails ? 'danger' : 'ok'}
        />
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-3">
        <Tile title="Library" subtitle={`${filtered.length} of ${data.library.length}`} icon={FileCode2}>
          <div className="relative mb-2">
            <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.7} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search scripts..."
              className="w-full bg-surface-800 border border-surface-600 rounded-md pl-7 pr-2 py-1 text-[11.5px] outline-none focus:border-accent placeholder:text-ink-400"
            />
          </div>
          <ul className="space-y-0.5">
            {filtered.map((s) => {
              const active = selected?.id === s.id;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSelectedId(s.id)}
                    className={clsx(
                      'w-full text-left px-2.5 py-2 rounded-md transition',
                      active ? 'bg-surface-700 text-ink-50' : 'hover:bg-surface-800 text-ink-200'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-medium truncate">{s.name}</span>
                      <Chip variant={s.type === 'CLI' ? 'info' : 'warning'}>{s.type}</Chip>
                    </div>
                    <div className="text-[10.5px] text-ink-400 mt-0.5 truncate">{s.description}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Tile>

        <Tile title="Script" icon={Code2}>
          <ScriptDetail script={selected} />
        </Tile>
      </div>

      <Tile title="Recent runs" subtitle={`last 7 days · ${data.recentRuns.length} executions`} icon={Clock}>
        <div className="overflow-x-auto">
          <RunHistory runs={data.recentRuns} />
        </div>
      </Tile>
    </div>
  );
}
