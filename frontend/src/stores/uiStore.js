import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUiStore = create(
  persist(
    (set) => ({
      preset: 'network',        // 'network' | 'security'
      cmdkOpen: false,
      hiddenTiles: [],
      setPreset: (preset) => set({ preset }),
      toggleCmdk: () => set((s) => ({ cmdkOpen: !s.cmdkOpen })),
      setCmdk: (open) => set({ cmdkOpen: open }),
      hideTile: (id) => set((s) => ({ hiddenTiles: [...new Set([...s.hiddenTiles, id])] })),
      showTile: (id) => set((s) => ({ hiddenTiles: s.hiddenTiles.filter((t) => t !== id) })),
    }),
    { name: 'fmg-console-ui' }
  )
);
