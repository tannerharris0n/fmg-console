import { Settings as SettingsIcon, Server, Keyboard, Info, Database, Clock, ExternalLink, Share2, ShieldCheck } from 'lucide-react';
import { Tile } from '../components/common/Tile';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useSettings } from '../hooks/useFmgData';
import { useKeyboardShortcutsHelp } from '../hooks/useKeyboardShortcuts';
import { useUiStore } from '../stores/uiStore';

function Row({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-surface-600/40 last:border-0">
      <span className="text-[12px] text-ink-400">{label}</span>
      <span className={`text-[12.5px] text-ink-200 ${mono ? 'font-mono text-[11.5px]' : ''} text-right`}>{value}</span>
    </div>
  );
}

function FmgInfoCard({ fmg }) {
  return (
    <Tile title="FortiManager" subtitle={fmg.hostname} icon={Server}>
      <Row label="IP address"  value={<span className="code">{fmg.ipAddress}</span>} />
      <Row label="Version"     value={<Badge variant="success">{fmg.version}</Badge>} />
      <Row label="Serial"      value={fmg.serial} mono />
      <Row label="Uptime"      value={fmg.uptime} />
      <Row label="Mode"        value={fmg.mode} />
      <Row label="Timezone"    value={fmg.timezone} />
      <Row label="NTP servers" value={fmg.ntp.join(', ')} mono />
    </Tile>
  );
}

function AdomsCard({ adoms }) {
  return (
    <Tile title="ADOMs" subtitle={`${adoms.length} administrative domains`} icon={Database}>
      <table className="w-full text-left text-[12px]">
        <thead className="text-ink-400 text-[11px] border-b border-surface-600/60">
          <tr>
            <th className="py-2 pr-2 font-medium">Name</th>
            <th className="py-2 px-2 font-medium text-right">Devices</th>
            <th className="py-2 px-2 font-medium text-right">Packages</th>
            <th className="py-2 pl-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-800">
          {adoms.map((a) => (
            <tr key={a.name} className="hover:bg-surface-800/50 transition">
              <td className="py-2 pr-2 font-medium">
                <span className="code">{a.name}</span>
              </td>
              <td className="py-2 px-2 text-ink-200 tabular-nums text-right">{a.devices}</td>
              <td className="py-2 px-2 text-ink-200 tabular-nums text-right">{a.pkgs}</td>
              <td className="py-2 pl-2">
                <Badge variant={a.status === 'active' ? 'success' : 'neutral'}>{a.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Tile>
  );
}

function AppearanceCard() {
  const preset = useUiStore((s) => s.preset);
  const setPreset = useUiStore((s) => s.setPreset);
  return (
    <Tile title="Appearance" icon={SettingsIcon}>
      <div className="flex items-center justify-between py-2 border-b border-surface-600/40">
        <div>
          <div className="text-[12px] font-medium">Dashboard preset</div>
          <div className="text-[11px] text-ink-400 mt-0.5">Switch between network- and security-focused layouts</div>
        </div>
        <div className="inline-flex bg-surface-800 rounded-md p-1 gap-0.5 ring-1 ring-surface-600/60">
          {[
            { v: 'network',  l: 'Network',  I: Share2 },
            { v: 'security', l: 'Security', I: ShieldCheck },
          ].map(({ v, l, I }) => (
            <button
              key={v}
              onClick={() => setPreset(v)}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-medium rounded transition ${
                preset === v ? 'bg-surface-700 text-ink-50' : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              <I className="h-3 w-3" strokeWidth={1.8} />
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between py-2">
        <div>
          <div className="text-[12px] font-medium">Theme</div>
          <div className="text-[11px] text-ink-400 mt-0.5">Dark mode — light mode is planned for v0.7</div>
        </div>
        <Badge variant="neutral">Dark</Badge>
      </div>
    </Tile>
  );
}

function ShortcutsCard() {
  const { setOpen } = useKeyboardShortcutsHelp();
  return (
    <Tile title="Keyboard shortcuts" icon={Keyboard}>
      <div className="text-[12px] text-ink-400 mb-3 leading-relaxed">
        Navigate faster with two-key prefixes like <span className="kbd">g</span> <span className="kbd">d</span> for
        Dashboard or <span className="kbd">g</span> <span className="kbd">s</span> for SD-WAN. Press <span className="kbd">?</span> anywhere
        to see the full list.
      </div>
      <Button size="sm" variant="ghost" icon={Keyboard} onClick={() => setOpen(true)}>
        Open shortcut reference
      </Button>
    </Tile>
  );
}

function AboutCard({ about }) {
  return (
    <Tile title="About" icon={Info}>
      <Row label="Product"      value={about.product} />
      <Row label="Version"      value={<Badge variant="info">{about.version}</Badge>} />
      <Row label="Channel"      value={<Badge variant="neutral">{about.channel}</Badge>} />
      <Row label="Build"         value={about.commit} mono />
      <Row label="API base"     value={<span className="code">{about.apiBase}</span>} />
      <Row
        label="Documentation"
        value={
          <a
            href={about.docs}
            target="_blank"
            rel="noreferrer"
            className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 text-[12px]"
          >
            <ExternalLink className="h-3 w-3" strokeWidth={1.8} />
            FortiManager API
          </a>
        }
      />
    </Tile>
  );
}

export default function Settings() {
  const { data, isLoading } = useSettings();
  if (isLoading || !data) return <div className="py-6 text-center text-ink-400 text-sm">Loading settings...</div>;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <FmgInfoCard fmg={data.fmg} />
        <AdomsCard adoms={data.adoms} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AppearanceCard />
        <ShortcutsCard />
      </div>

      <AboutCard about={data.about} />
    </div>
  );
}
