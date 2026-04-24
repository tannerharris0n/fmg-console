import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { FileText, Search, Filter } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { Chip } from '../components/common/Chip';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useAnalyzer } from '../hooks/useFmgData';

const TYPE_LABEL = {
  dead:             'Dead',
  shadow:           'Shadow',
  redundant:        'Redundant',
  'overly-permissive': 'Overly permissive',
  override:         'Override',
};

const TYPE_TONE = {
  dead: 'danger',
  shadow: 'warning',
  redundant: 'warning',
  'overly-permissive': 'warning',
  override: 'info',
};

function SummaryCard({ label, value, tone = 'text-ink-50' }) {
  return (
    <div className="bg-surface-800 rounded-md px-3 py-2.5">
      <div className="text-[10.5px] text-ink-400">{label}</div>
      <div className={clsx('text-[20px] font-semibold tabular-nums leading-tight mt-1', tone)}>
        {value}
      </div>
    </div>
  );
}

export default function PolicyAnalyzer() {
  const { data, isLoading } = useAnalyzer();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.findings.filter((f) => {
      if (filter !== 'all' && f.type !== filter) return false;
      if (query && !(`${f.rule} ${f.package} ${f.note}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [data, filter, query]);

  if (isLoading) {
    return <div className="py-6 text-center text-ink-400 text-sm">Analyzing policies...</div>;
  }

  if (!data) return null;

  const types = ['all', ...new Set(data.findings.map((f) => f.type))];

  return (
    <div className="space-y-3 animate-fade-in">
      <Tile
        title="Policy analyzer"
        subtitle={`${data.findings.length} findings across packages`}
        icon={FileText}
      >
        <div className="grid grid-cols-5 gap-2 mb-4">
          <SummaryCard label="Dead"              value={data.summary.dead}             tone="text-rose-400" />
          <SummaryCard label="Shadow"            value={data.summary.shadow}           tone="text-amber-400" />
          <SummaryCard label="Redundant"         value={data.summary.redundant}        tone="text-amber-400" />
          <SummaryCard label="Overly permissive" value={data.summary.overlyPermissive} tone="text-amber-400" />
          <SummaryCard label="Overrides"         value={data.summary.overrides}        tone="text-sky-400" />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.7} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rule, package, note..."
              className="w-full bg-surface-800 border border-surface-600 rounded-md pl-8 pr-3 py-1.5 text-[12px] outline-none focus:border-accent placeholder:text-ink-400"
            />
          </div>
          <div className="flex items-center gap-1 bg-surface-800 rounded-md p-1 border border-surface-600">
            <Filter className="h-3 w-3 text-ink-400 ml-1" strokeWidth={1.7} />
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={clsx(
                  'text-[11px] px-2 py-0.5 rounded transition',
                  filter === t
                    ? 'bg-surface-700 text-ink-50 font-medium'
                    : 'text-ink-400 hover:text-ink-200',
                )}
              >
                {t === 'all' ? 'All' : TYPE_LABEL[t] || t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No findings match" hint="Try a different filter or clear search." />
        ) : (
          <ul className="divide-y divide-surface-600/40">
            {filtered.map((f) => (
              <li key={f.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Chip variant={TYPE_TONE[f.type]}>{TYPE_LABEL[f.type] || f.type}</Chip>
                      <span className="code">{f.rule}</span>
                      <Badge variant="neutral">in {f.package}</Badge>
                    </div>
                    <div className="text-[12px] text-ink-200">{f.note}</div>
                    <div className="text-[11px] text-ink-400 mt-1">
                      <span className="text-ink-600">Suggested:</span> {f.suggestion}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost">Open rule</Button>
                    <Button size="sm" variant="secondary">Apply fix</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tile>
    </div>
  );
}
