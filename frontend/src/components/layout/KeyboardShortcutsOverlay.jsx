import { useKeyboardShortcutsHelp } from '../../hooks/useKeyboardShortcuts';

const GROUPS = [
  {
    title: 'Navigate',
    items: [
      ['Dashboard',       ['g', 'd']],
      ['Devices',         ['g', 'v']],
      ['SD-WAN',          ['g', 's']],
      ['VPN tunnels',     ['g', 'n']],
      ['HA clusters',     ['g', 'h']],
      ['Policy packages', ['g', 'p']],
      ['Policy objects',  ['g', 'o']],
      ['Profiles',        ['g', 'f']],
      ['Analyzer',        ['g', 'a']],
      ['Threats',         ['g', 't']],
      ['CVE watch',       ['g', 'c']],
      ['Drift',           ['g', 'r']],
      ['Admin audit',     ['g', 'u']],
      ['Tasks',           ['g', 'k']],
    ],
  },
  {
    title: 'Search & actions',
    items: [
      ['Command palette',   ['⌘', 'K']],
      ['Focus search',      ['/']],
      ['Toggle preset',     ['⇧', 'P']],
      ['Show this overlay', ['?']],
      ['Close / cancel',    ['Esc']],
    ],
  },
];

function Keycap({ k }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded font-mono text-[10.5px] font-medium bg-surface-800 border border-surface-600 text-ink-200">
      {k}
    </span>
  );
}

function Row({ label, keys }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-surface-600/40 last:border-0">
      <span className="text-[12px] text-ink-200">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => <Keycap key={i} k={k} />)}
      </div>
    </div>
  );
}

export function KeyboardShortcutsOverlay() {
  const { open, setOpen } = useKeyboardShortcutsHelp();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-surface-900 border border-surface-600 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-600/60">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-accent/30 text-accent grid place-items-center text-[11px] font-semibold">F</div>
            <h2 className="text-[13px] font-semibold">Keyboard shortcuts</h2>
          </div>
          <Keycap k="Esc" />
        </div>

        <div className="p-5 grid grid-cols-2 gap-6">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h3 className="text-[10px] uppercase tracking-widest font-medium text-ink-400 border-b border-surface-600/60 pb-1 mb-1">
                {g.title}
              </h3>
              {g.items.map(([label, keys]) => (
                <Row key={label} label={label} keys={keys} />
              ))}
            </section>
          ))}
        </div>

        <div className="px-5 py-2.5 bg-surface-800/40 border-t border-surface-600/40 flex items-center justify-between text-[11px] text-ink-400">
          <span>Press <Keycap k="?" /> anywhere to show this</span>
          <span>19 shortcuts</span>
        </div>
      </div>
    </div>
  );
}
