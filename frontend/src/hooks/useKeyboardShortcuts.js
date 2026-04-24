import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { useUiStore } from '../stores/uiStore';

/**
 * Global keyboard shortcut handler.
 *
 *   g d   -> Dashboard
 *   g v   -> Devices
 *   g s   -> SD-WAN
 *   g n   -> VPN
 *   g h   -> HA clusters
 *   g p   -> Policy packages
 *   g o   -> Policy objects
 *   g a   -> Analyzer
 *   g t   -> Threats
 *   g c   -> CVE watchlist
 *   g u   -> Admin audit
 *   g r   -> Drift
 *   g k   -> Tasks
 *   /     -> focus page search input
 *   ⇧P    -> toggle Network/Security preset
 *   ?     -> toggle keyboard shortcut help
 *
 * cmd+K / ctrl+K is handled by CommandPalette directly (preserved for backward compat).
 *
 * Ignores keys when typing in inputs, textareas, or contenteditable elements.
 */

const NAV_MAP = {
  d: '/',
  v: '/devices',
  s: '/fabric/sdwan',
  n: '/fabric/vpn',
  h: '/fabric/ha',
  p: '/policy/packages',
  o: '/policy/objects',
  f: '/policy/profiles',
  a: '/policy/analyzer',
  t: '/security/threats',
  c: '/security/cve',
  u: '/security/audit',
  r: '/security/drift',
  k: '/tasks',
};

const useHelpStore = create((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));

export function useKeyboardShortcutsHelp() {
  return useHelpStore();
}

function isTyping(e) {
  const t = e.target;
  if (!t) return false;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const setPreset = useUiStore((s) => s.setPreset);
  const preset = useUiStore((s) => s.preset);
  const toggleHelp = useHelpStore((s) => s.toggle);
  const setHelp = useHelpStore((s) => s.setOpen);

  useEffect(() => {
    let gArmed = false;
    let gTimer = null;

    const disarm = () => {
      gArmed = false;
      clearTimeout(gTimer);
    };

    const onKey = (e) => {
      if (isTyping(e)) {
        // Only Esc in inputs is of general interest; let page-level handlers catch it.
        return;
      }

      // ? shows help (shift + /)
      if (e.key === '?') {
        e.preventDefault();
        toggleHelp();
        disarm();
        return;
      }

      // / focuses a search input on the page
      if (e.key === '/' && !gArmed && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const searchEl = document.querySelector('input[type="search"], input[placeholder*="Search" i]');
        if (searchEl) searchEl.focus();
        return;
      }

      // Shift+P toggles preset
      if (e.shiftKey && e.key.toLowerCase() === 'p' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setPreset(preset === 'network' ? 'security' : 'network');
        disarm();
        return;
      }

      // Two-key g-prefix navigation
      if (gArmed && NAV_MAP[e.key.toLowerCase()]) {
        e.preventDefault();
        navigate(NAV_MAP[e.key.toLowerCase()]);
        disarm();
        return;
      }

      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        gArmed = true;
        gTimer = setTimeout(disarm, 1200);
        return;
      }

      // Any other key cancels an armed g
      if (gArmed) disarm();
    };

    const onEsc = (e) => {
      if (e.key === 'Escape') setHelp(false);
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keydown', onEsc);
      clearTimeout(gTimer);
    };
  }, [navigate, setPreset, preset, toggleHelp, setHelp]);
}
