import { useState } from 'react';
import { FileText, Rocket, GitCompare, ArrowRight } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { InstallPreview } from '../components/InstallPreview';
import { PackageDetailDrawer } from '../components/policy/PackageDetailDrawer';
import { usePolicyPackages } from '../hooks/useFmgData';
import { toast } from '../components/common/Toast';

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function needsInstall(pkg) {
  return new Date(pkg.lastModified).getTime() > new Date(pkg.lastInstalled).getTime();
}

export default function PolicyPackages() {
  const { data = [], isLoading } = usePolicyPackages();
  const [previewId, setPreviewId] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  if (isLoading) {
    return <div className="py-6 text-center text-ink-400 text-sm">Loading packages...</div>;
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <Tile
        title="Policy packages"
        subtitle={`${data.length} packages · click any package to inspect rules and devices`}
        icon={FileText}
      >
        {data.length === 0 ? (
          <EmptyState title="No policy packages" hint="Create one from the Policy menu." />
        ) : (
          <div className="divide-y divide-surface-600/40">
            {data.map((pkg) => {
              const stale = needsInstall(pkg);
              return (
                <div key={pkg.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group">
                  <button
                    onClick={() => setSelectedName(pkg.name)}
                    className="min-w-0 flex-1 text-left hover:bg-surface-800/40 -mx-2 px-2 py-1 rounded-md transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-ink-50 group-hover:text-sky-300 transition">{pkg.name}</span>
                      {stale && <Badge variant="warning">pending install</Badge>}
                      <ArrowRight className="h-3 w-3 text-ink-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition" strokeWidth={2} />
                    </div>
                    <div className="mt-1 text-[11px] text-ink-400 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span className="tabular-nums">{pkg.rules} rules</span>
                      <span>·</span>
                      <span>{pkg.devices.length} device{pkg.devices.length === 1 ? '' : 's'}</span>
                      <span>·</span>
                      <span>modified {relTime(pkg.lastModified)} by {pkg.modifiedBy}</span>
                      <span>·</span>
                      <span>last install {relTime(pkg.lastInstalled)}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {pkg.devices.slice(0, 6).map((d) => (
                        <span key={d} className="code">{d}</span>
                      ))}
                      {pkg.devices.length > 6 && (
                        <span className="code text-ink-400">+{pkg.devices.length - 6}</span>
                      )}
                    </div>
                  </button>
                  <div className="flex gap-2 shrink-0 mt-0.5">
                    <Button size="sm" variant="ghost" icon={GitCompare} onClick={() => toast.info('Compare is read-only in demo', { detail: `Would diff ${pkg.name} against another package` })}>
                      Compare
                    </Button>
                    <Button
                      size="sm"
                      variant={stale ? 'primary' : 'secondary'}
                      icon={Rocket}
                      onClick={(e) => { e.stopPropagation(); setPreviewId(pkg.id); }}
                    >
                      Install
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Tile>

      <InstallPreview
        packageId={previewId}
        open={Boolean(previewId)}
        onClose={() => setPreviewId(null)}
      />

      <PackageDetailDrawer
        name={selectedName}
        open={Boolean(selectedName)}
        onClose={() => setSelectedName(null)}
      />
    </div>
  );
}
