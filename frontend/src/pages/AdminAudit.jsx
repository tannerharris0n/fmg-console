import { useState, useMemo } from 'react';
import { ShieldCheck, Search, Download } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { KpiCard } from '../components/common/KpiCard';
import { Chip } from '../components/common/Chip';
import { Button } from '../components/common/Button';
import { useSortable, SortableTh } from '../components/common/SortableTable';
import { useAuditLog } from '../hooks/useFmgData';
import { toast } from '../components/common/Toast';

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const ACTION_TONE = {
  'login-fail':       'danger',
  'login':            'success',
  'logout':           'neutral',
  'policy-edit':      'info',
  'object-create':    'info',
  'install':          'info',
  'script-run':       'info',
  'config-export':    'warning',
  'password-change':  'info',
  'mfa-challenge':    'info',
};

export default function AdminAudit() {
  const { data = [], isLoading } = useAuditLog();
  const [q, setQ] = useState('');
  const [action, setAction] = useState('all');
  const [result, setResult] = useState('all');

  const actions = useMemo(() => ['all', ...new Set(data.map((r) => r.action))], [data]);

  const filtered = useMemo(() => data.filter((r) => {
    if (action !== 'all' && r.action !== action) return false;
    if (result !== 'all' && r.result !== result) return false;
    if (q) {
      const l = q.toLowerCase();
      return (
        r.admin.toLowerCase().includes(l) ||
        r.target.toLowerCase().includes(l) ||
        r.ip.includes(l) ||
        (r.detail || '').toLowerCase().includes(l)
      );
    }
    return true;
  }), [data, q, action, result]);

  const { sorted, sort, toggle } = useSortable(filtered, { key: 'at', dir: 'desc' });

  const handleExport = () => {
    toast.info('CSV export is read-only in demo', { detail: `${filtered.length} rows would be exported` });
  };

  const success = data.filter((r) => r.result === 'success').length;
  const fail = data.filter((r) => r.result === 'fail').length;
  const admins = new Set(data.map((r) => r.admin)).size;

  if (isLoading) return <div className="py-6 text-center text-ink-400 text-sm">Loading audit log...</div>;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Events"       value={data.length}  icon={ShieldCheck} iconTone="muted" />
        <KpiCard label="Successful"   value={success}      icon={ShieldCheck} iconTone="ok"     delta={`${Math.round(success / data.length * 100)}%`} deltaTone="ok" />
        <KpiCard label="Failed"       value={fail}         icon={ShieldCheck} iconTone="danger" delta="login attempts"     deltaTone="danger" />
        <KpiCard label="Unique admins" value={admins}       icon={ShieldCheck} iconTone="info" />
      </div>

      <Tile
        title="Admin audit log"
        subtitle={`${filtered.length} of ${data.length}`}
        icon={ShieldCheck}
        action={<Button size="sm" variant="ghost" icon={Download} onClick={handleExport}>Export CSV</Button>}
      >
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.7} />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search admin, target, IP, detail..."
              className="w-full bg-surface-800 border border-surface-600 rounded-md pl-8 pr-3 py-1.5 text-[12px] outline-none focus:border-accent placeholder:text-ink-400"
            />
          </div>

          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="bg-surface-800 border border-surface-600 rounded-md px-2.5 py-1.5 text-[12px] outline-none focus:border-accent"
          >
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          <div className="inline-flex bg-surface-800 rounded-md p-0.5 gap-0.5 ring-1 ring-surface-600/60">
            {['all','success','fail'].map((r) => (
              <button
                key={r}
                onClick={() => setResult(r)}
                className={
                  'text-[11px] px-2.5 py-1 rounded font-medium transition ' +
                  (result === r ? 'bg-surface-700 text-ink-50' : 'text-ink-400 hover:text-ink-200')
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11.5px]">
            <thead className="text-ink-400 text-[10.5px] border-b border-surface-600/60">
              <tr>
                <SortableTh sortKey="at"     sort={sort} onToggle={toggle}>Time</SortableTh>
                <SortableTh sortKey="admin"  sort={sort} onToggle={toggle}>Admin</SortableTh>
                <SortableTh sortKey="ip"     sort={sort} onToggle={toggle}>IP</SortableTh>
                <SortableTh sortKey="action" sort={sort} onToggle={toggle}>Action</SortableTh>
                <SortableTh sortKey="target" sort={sort} onToggle={toggle}>Target</SortableTh>
                <SortableTh sortKey="result" sort={sort} onToggle={toggle}>Result</SortableTh>
                <th className="py-2 px-2 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {sorted.map((r) => (
                <tr key={r.id} className="hover:bg-surface-800/50 transition">
                  <td className="py-1.5 px-2 text-ink-400 font-mono tabular-nums whitespace-nowrap">{fmtTime(r.at)}</td>
                  <td className="py-1.5 px-2 font-medium">{r.admin}</td>
                  <td className="py-1.5 px-2"><span className="code">{r.ip}</span></td>
                  <td className="py-1.5 px-2"><Chip variant={ACTION_TONE[r.action] || 'neutral'}>{r.action}</Chip></td>
                  <td className="py-1.5 px-2 text-ink-200"><span className="code">{r.target}</span></td>
                  <td className="py-1.5 px-2">
                    <span className={r.result === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
                      {r.result}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-ink-400">{r.detail || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tile>
    </div>
  );
}
