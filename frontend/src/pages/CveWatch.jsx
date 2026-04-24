import { useState } from 'react';
import { Lock, ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { Chip } from '../components/common/Chip';
import { Button } from '../components/common/Button';
import { Drawer } from '../components/common/Drawer';
import { EmptyState } from '../components/common/EmptyState';
import { useCves, useCveDetail } from '../hooks/useFmgData';

const severityFor = (s) => ({
  critical: 'danger', high: 'warning', medium: 'info', low: 'neutral',
}[s] || 'neutral');

function CveDetailDrawer({ id, open, onClose }) {
  const { data, isLoading } = useCveDetail(open ? id : null);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={id || ''}
      subtitle={data?.title}
      width="lg"
      footer={
        <Button variant="primary" icon={ShieldCheck} onClick={onClose}>
          Schedule upgrade
        </Button>
      }
    >
      {isLoading && <div className="text-[12px] text-ink-400">Loading...</div>}
      {data && (
        <div className="space-y-5">
          <section className="flex items-center gap-3">
            <Chip variant={severityFor(data.severity)}>
              {data.severity.toUpperCase()} · {data.score}
            </Chip>
            <span className="text-[12px] text-ink-400">
              Fixed in <span className="code">{data.fixedIn}</span>
            </span>
          </section>

          <section>
            <h3 className="text-[12px] font-semibold mb-1.5">Description</h3>
            <p className="text-[12.5px] text-ink-200 leading-relaxed">{data.description}</p>
          </section>

          <section>
            <h3 className="text-[12px] font-semibold mb-2">Affected versions</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.affectedVersions.map((v) => (
                <span key={v} className="code">{v}</span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[12px] font-semibold mb-2">
              Affected devices
              <span className="text-[11px] text-ink-400 font-normal ml-2 tabular-nums">
                {data.affectedDevices.length}
              </span>
            </h3>
            <ul className="bg-surface-800 rounded-md px-3 py-2 space-y-1">
              {data.affectedDevices.map((d) => (
                <li key={d} className="flex items-center justify-between text-[12px]">
                  <span className="text-ink-50">{d}</span>
                  <Button size="sm" variant="ghost">View</Button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[12px] font-semibold mb-2">Remediation</h3>
            <ol className="space-y-1.5 text-[12.5px] text-ink-200">
              {data.remediation.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-ink-400 shrink-0 tabular-nums">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="text-[12px] font-semibold mb-2">References</h3>
            <ul className="space-y-1">
              {data.references.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] text-sky-400 hover:text-sky-300"
                  >
                    <ExternalLink className="h-3 w-3" strokeWidth={1.8} />
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </Drawer>
  );
}

export default function CveWatch() {
  const { data = [], isLoading } = useCves();
  const [selected, setSelected] = useState(null);

  if (isLoading) return <div className="py-6 text-center text-ink-400 text-sm">Loading advisories...</div>;

  return (
    <div className="space-y-3 animate-fade-in">
      <Tile title="CVE watchlist" subtitle={`${data.length} affecting your fleet`} icon={Lock}>
        {data.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No active advisories"
            hint="Your fleet is running versions without known open CVEs."
          />
        ) : (
          <ul className="divide-y divide-surface-600/40">
            {data.map((c) => (
              <li key={c.id} className="py-3 first:pt-0 last:pb-0">
                <button
                  onClick={() => setSelected(c.id)}
                  className="w-full text-left group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Chip variant={severityFor(c.severity)}>
                          {c.severity.toUpperCase()} · {c.score}
                        </Chip>
                        <span className="code">{c.id}</span>
                        <span className="text-[12.5px] text-ink-50 font-medium group-hover:text-sky-300 transition">
                          {c.title}
                        </span>
                      </div>
                      <div className="text-[11.5px] text-ink-400 mt-1.5">{c.detail}</div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[11px] text-rose-400 tabular-nums font-medium">
                        {c.affectedDevices} devices
                      </span>
                      <ShieldAlert className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.7} />
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Tile>

      <CveDetailDrawer
        id={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
