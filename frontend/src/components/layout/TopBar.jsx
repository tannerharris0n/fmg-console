import { Share2, ShieldCheck, Search, Clock } from 'lucide-react';
import { Segmented } from '../common/Segmented';
import { useUiStore } from '../../stores/uiStore';
import { useAuth } from '../../hooks/useAuth';

function Avatar({ user }) {
  const initials = (user?.email || 'U')
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-7 w-7 rounded-full bg-accent-soft grid place-items-center text-[11px] font-semibold text-sky-200">
      {initials}
    </div>
  );
}

export function TopBar({ title = 'Dashboard', subtitle, showPreset = true }) {
  const preset = useUiStore((s) => s.preset);
  const setPreset = useUiStore((s) => s.setPreset);
  const toggleCmdk = useUiStore((s) => s.toggleCmdk);
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-surface-600/60 bg-surface-950/60 backdrop-blur">
      <div className="min-w-0">
        <h1 className="text-[16px] font-semibold tracking-tight leading-none">{title}</h1>
        {subtitle !== undefined ? (
          <div className="text-[11px] text-ink-400 mt-1">{subtitle}</div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-ink-400 mt-1">
            <Clock className="h-3 w-3" strokeWidth={1.7} />
            <span>auto refresh · every 30s</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showPreset && (
          <Segmented
            value={preset}
            onChange={setPreset}
            options={[
              { value: 'network',  label: 'Network',  icon: Share2 },
              { value: 'security', label: 'Security', icon: ShieldCheck },
            ]}
          />
        )}

        <button
          onClick={toggleCmdk}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-600 bg-surface-900 text-[12px] text-ink-400 hover:text-ink-200 hover:border-surface-500 transition"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={1.8} />
          Search
          <span className="kbd ml-1">⌘K</span>
        </button>

        <Avatar user={user} />
      </div>
    </header>
  );
}
