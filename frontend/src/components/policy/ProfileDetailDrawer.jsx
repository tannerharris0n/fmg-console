import { Shield, Bug, Globe, Layers, Lock, FileKey, CheckCircle2, XCircle } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Chip } from '../common/Chip';
import { Badge } from '../common/Badge';
import { useProfileDetail } from '../../hooks/useFmgData';

const TYPE_LABEL = {
  antivirus:  { label: 'Antivirus',       Icon: Shield },
  ips:        { label: 'IPS',             Icon: Bug },
  webFilter:  { label: 'Web filter',      Icon: Globe },
  appControl: { label: 'Application control', Icon: Layers },
  sslInspect: { label: 'SSL inspection',  Icon: Lock },
  dlp:        { label: 'DLP',             Icon: FileKey },
};

const sevTone = (s) => ({ critical: 'danger', high: 'warning', medium: 'info', low: 'neutral' }[s] || 'neutral');
const actionTone = (a) => a === 'block' ? 'danger' : a === 'warn' ? 'warning' : a === 'monitor' ? 'info' : 'success';

export function ProfileDetailDrawer({ profile, type, open, onClose }) {
  const { data, isLoading } = useProfileDetail(type, open ? profile?.name : null);

  if (!profile) return null;
  const meta = TYPE_LABEL[type] || TYPE_LABEL.antivirus;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={profile.name}
      subtitle={profile.note}
      width="lg"
    >
      <div className="space-y-5">
        <section>
          <h3 className="text-[12px] font-semibold mb-2 flex items-center gap-2">
            <meta.Icon className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
            Configuration
          </h3>
          <div className="bg-surface-800 rounded-md px-3 py-2 space-y-2">
            <Row label="Type" value={<Badge variant="info">{meta.label}</Badge>} />
            {profile.action && <Row label="Default action" value={<Chip variant={actionTone(profile.action)}>{profile.action}</Chip>} />}
            {profile.mode && <Row label="Mode" value={<Badge variant="info">{profile.mode}</Badge>} />}
            {profile.engine && <Row label="Engine" value={<span className="text-ink-200">{profile.engine}</span>} />}
            {profile.signatures && <Row label="Signatures" value={<span className="code">{profile.signatures}</span>} />}
            {profile.categories && <Row label="Categories" value={<span className="code">{profile.categories}</span>} />}
            {profile.cert && <Row label="Certificate authority" value={<span className="code">{profile.cert}</span>} />}
            {profile.scope && <Row label="Scope" value={<span className="text-ink-200">{profile.scope}</span>} />}
            <Row label="Policies using this profile" value={<span className="text-ink-200 tabular-nums">{profile.usedBy}</span>} />
          </div>
        </section>

        {isLoading && <div className="text-[12px] text-ink-400">Loading details...</div>}

        {data?.signatures && (
          <section>
            <h3 className="text-[12px] font-semibold mb-2 flex items-center gap-2">
              <Bug className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
              Signatures ({data.signatures.length})
            </h3>
            <ul className="bg-surface-800 rounded-md divide-y divide-surface-600/30">
              {data.signatures.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-3 py-2 text-[11.5px]">
                  <span className="font-mono text-[10.5px] text-ink-400 w-20 shrink-0 tabular-nums">{s.id}</span>
                  <Chip variant={sevTone(s.severity)}>{s.severity}</Chip>
                  <span className="text-ink-50 font-medium min-w-0 flex-1 truncate">{s.name}</span>
                  <Chip variant={actionTone(s.action)}>{s.action}</Chip>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data?.categories && (
          <section>
            <h3 className="text-[12px] font-semibold mb-2 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
              Categories ({data.categories.length})
            </h3>
            <ul className="bg-surface-800 rounded-md divide-y divide-surface-600/30">
              {data.categories.map((c) => (
                <li key={c.name} className="flex items-center gap-3 px-3 py-2 text-[12px]">
                  <Chip variant={actionTone(c.action)}>{c.action}</Chip>
                  <span className="text-ink-50 font-medium flex-1">{c.name}</span>
                  <span className="text-ink-400 text-[11px] tabular-nums">{c.count} sites</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data?.protocols && (
          <section>
            <h3 className="text-[12px] font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
              Protocols scanned
            </h3>
            <ul className="bg-surface-800 rounded-md divide-y divide-surface-600/30">
              {data.protocols.map((p) => (
                <li key={p.name} className="flex items-center gap-3 px-3 py-2 text-[12px]">
                  {p.scan === 'enabled'
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.8} />
                    : <XCircle className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />}
                  <span className="font-mono text-[11px] font-medium flex-1">{p.name}</span>
                  <span className="text-ink-400 text-[11px]">{p.scan}</span>
                  {p.action !== 'none' && <Chip variant={actionTone(p.action)}>{p.action}</Chip>}
                </li>
              ))}
            </ul>
            {data.engineStats && (
              <div className="mt-2 text-[10.5px] text-ink-400">
                Engine: {data.engineStats.vendor} · pattern {data.engineStats.patternVersion}
              </div>
            )}
          </section>
        )}

        {data?.exemptCategories && (
          <section>
            <h3 className="text-[12px] font-semibold mb-2 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
              Exempt categories
            </h3>
            <div className="bg-surface-800 rounded-md px-3 py-2">
              <div className="text-[12px] text-ink-200">These categories bypass SSL inspection:</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.exemptCategories.map((c) => <span key={c} className="code">{c}</span>)}
              </div>
            </div>
          </section>
        )}

        {data?.patterns && (
          <section>
            <h3 className="text-[12px] font-semibold mb-2 flex items-center gap-2">
              <FileKey className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
              Detection patterns ({data.patterns.length})
            </h3>
            <ul className="bg-surface-800 rounded-md divide-y divide-surface-600/30">
              {data.patterns.map((p) => (
                <li key={p.name} className="flex items-center gap-3 px-3 py-2 text-[12px]">
                  <Chip variant={actionTone(p.action)}>{p.action}</Chip>
                  <span className="text-ink-50 font-medium flex-1">{p.name}</span>
                  <span className="text-[10.5px] font-mono text-ink-400">{p.pattern}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
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
