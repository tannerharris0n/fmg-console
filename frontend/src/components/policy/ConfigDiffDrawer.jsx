import { useMemo } from 'react';
import { GitCompare, User, Calendar } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { useConfigDiff } from '../../hooks/useFmgData';

/**
 * Compute a simple line-level diff using longest-common-subsequence.
 * Returns array of { kind: 'same' | 'add' | 'del', a?, b?, line? }.
 */
function diffLines(before, after) {
  const A = before.split('\n');
  const B = after.split('\n');
  const m = A.length, n = B.length;

  // LCS dp table
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (A[i] === B[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (A[i] === B[j]) { out.push({ kind: 'same', line: A[i], a: i + 1, b: j + 1 }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ kind: 'del', line: A[i], a: i + 1 }); i++; }
    else { out.push({ kind: 'add', line: B[j], b: j + 1 }); j++; }
  }
  while (i < m) { out.push({ kind: 'del', line: A[i], a: i + 1 }); i++; }
  while (j < n) { out.push({ kind: 'add', line: B[j], b: j + 1 }); j++; }
  return out;
}

// Light FortiOS-ish syntax highlight
function highlight(line) {
  const keywords = /^(\s*)(config|edit|set|next|end|unset)\b/;
  const m = line.match(keywords);
  if (!m) return <span>{line}</span>;
  const indent = m[1];
  const keyword = m[2];
  const rest = line.slice(m[0].length);
  return (
    <>
      {indent}
      <span className="text-sky-300">{keyword}</span>
      <span className="text-ink-200">{rest}</span>
    </>
  );
}

function relTime(iso) {
  if (!iso) return '';
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.round(d / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

export function ConfigDiffDrawer({ packageName, installAt, open, onClose }) {
  const { data, isLoading } = useConfigDiff(open ? packageName : null, installAt);

  const lines = useMemo(() => {
    if (!data) return [];
    return diffLines(data.before, data.after);
  }, [data]);

  const adds = lines.filter((l) => l.kind === 'add').length;
  const dels = lines.filter((l) => l.kind === 'del').length;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Config diff · ${packageName || ''}`}
      subtitle={data ? `${data.revisionFrom} → ${data.revisionTo}` : ''}
      width="xl"
    >
      {isLoading && <div className="text-[12px] text-ink-400">Loading diff...</div>}
      {data && (
        <div className="space-y-4">
          {/* Header row with metadata */}
          <div className="flex items-center gap-3 flex-wrap text-[12px]">
            <span className="inline-flex items-center gap-1.5 text-ink-400">
              <GitCompare className="h-3 w-3" strokeWidth={1.8} />
              <span className="code">{data.revisionFrom}</span>
              <span>→</span>
              <span className="code">{data.revisionTo}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink-400">
              <User className="h-3 w-3" strokeWidth={1.8} />
              {data.author}
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink-400">
              <Calendar className="h-3 w-3" strokeWidth={1.8} />
              {relTime(data.installedAt)}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <Badge variant="success">+{adds}</Badge>
              <Badge variant="danger">−{dels}</Badge>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-surface-800 border border-surface-600/60 rounded-md px-3 py-2 text-[12px] text-ink-200">
            <span className="text-ink-400 text-[10.5px] uppercase tracking-wider mr-2">Summary</span>
            {data.summary}
          </div>

          {/* Diff body */}
          <div className="rounded-md overflow-hidden border border-surface-600/60 bg-surface-950">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-surface-600/60 bg-surface-900 text-[10.5px] text-ink-400 uppercase tracking-wider">
              <span>Unified diff</span>
              <span className="font-mono normal-case text-[10px] text-ink-600">FortiOS CLI</span>
            </div>
            <div className="font-mono text-[11.5px] leading-[1.55] py-1">
              {lines.map((l, i) => {
                const bg = l.kind === 'add' ? 'bg-emerald-500/10 border-l-2 border-emerald-500/60'
                         : l.kind === 'del' ? 'bg-rose-500/10 border-l-2 border-rose-500/60'
                         : 'border-l-2 border-transparent';
                const sign = l.kind === 'add' ? '+' : l.kind === 'del' ? '−' : ' ';
                const signColor = l.kind === 'add' ? 'text-emerald-400' : l.kind === 'del' ? 'text-rose-400' : 'text-ink-600';
                return (
                  <div key={i} className={`flex ${bg} hover:bg-surface-800/40`}>
                    <div className="shrink-0 w-10 px-2 text-right text-ink-600 text-[10.5px] tabular-nums select-none">{l.a ?? ''}</div>
                    <div className="shrink-0 w-10 px-2 text-right text-ink-600 text-[10.5px] tabular-nums select-none">{l.b ?? ''}</div>
                    <div className={`shrink-0 w-4 text-center ${signColor}`}>{sign}</div>
                    <div className="flex-1 min-w-0 pr-3 whitespace-pre overflow-x-auto">{highlight(l.line)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10.5px] text-ink-400">
            This diff shows the FortiOS CLI config that was pushed for this install. Additions highlighted green, removals red, unchanged lines dim.
          </p>
        </div>
      )}
    </Drawer>
  );
}
