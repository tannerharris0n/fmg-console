import { Link } from 'react-router-dom';
import { Package, ArrowRight, Info } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Chip } from '../common/Chip';
import { Badge } from '../common/Badge';
import { useObjectUsage } from '../../hooks/useFmgData';

const roleTone = (r) => r === 'src' ? 'info' : r === 'dst' ? 'warning' : r === 'service' ? 'success' : 'neutral';

export function ObjectDetailDrawer({ object, open, onClose }) {
  const { data = [], isLoading } = useObjectUsage(open ? object?.name : null);

  if (!object) return null;

  const typeLabel = object.type === 'ipmask' ? 'IP / Subnet'
    : object.type === 'fqdn' ? 'FQDN'
    : object.type === 'group' ? 'Group'
    : object.type === 'geo' ? 'Geo / Dynamic'
    : object.type;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={object.name}
      subtitle={typeLabel}
      width="lg"
    >
      <div className="space-y-5">
        <section>
          <h3 className="text-[12px] font-semibold mb-2">Definition</h3>
          <div className="bg-surface-800 rounded-md px-3 py-2 space-y-2">
            <Row label="Type" value={<Badge variant="info">{object.type}</Badge>} />
            {object.value && <Row label="Value" value={<span className="code">{object.value}</span>} />}
            {object.members && (
              <Row label={`Members (${object.members.length})`} value={
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                  {object.members.map((m) => <span key={m} className="code">{m}</span>)}
                </div>
              } />
            )}
            {object.protocol && <Row label="Protocol" value={<span className="code">{object.protocol}</span>} />}
            {object.ports && <Row label="Ports" value={<span className="code">{object.ports}</span>} />}
            {object.spec && <Row label="Spec" value={<span className="text-ink-200">{object.spec}</span>} />}
            <Row label="Times used" value={<span className="text-ink-200 tabular-nums">{object.usedBy}</span>} />
          </div>
        </section>

        <section>
          <h3 className="text-[12px] font-semibold mb-2 flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
            Referenced by ({data.length})
          </h3>
          {isLoading && <div className="text-[12px] text-ink-400">Loading references...</div>}
          {!isLoading && data.length === 0 && (
            <div className="bg-surface-800 rounded-md px-4 py-6 text-center text-[11.5px] text-ink-400">
              <Info className="h-4 w-4 mx-auto mb-1 text-ink-400" strokeWidth={1.7} />
              No rule references found in tracked packages.
            </div>
          )}
          {data.length > 0 && (
            <ul className="bg-surface-800 rounded-md divide-y divide-surface-600/30">
              {data.map((u, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2 text-[12px]">
                  <Chip variant={roleTone(u.role)}>{u.role}</Chip>
                  <span className="font-mono text-[10.5px] text-ink-400 tabular-nums w-8 shrink-0">#{u.ruleId}</span>
                  <span className="text-ink-50 font-medium min-w-0 flex-1 truncate">{u.ruleName}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-ink-400 shrink-0">
                    <span className="code">{u.pkg}</span>
                    <ArrowRight className="h-3 w-3" strokeWidth={2} />
                  </span>
                </li>
              ))}
            </ul>
          )}
          {data.length > 0 && (
            <p className="text-[10.5px] text-ink-400 mt-2">
              Click a package name in <Link to="/policy/packages" className="text-sky-300 hover:text-sky-200">Policy packages</Link> to see the full rule.
            </p>
          )}
        </section>
      </div>
    </Drawer>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12px]">
      <span className="text-ink-400 shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
