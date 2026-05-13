'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang, Person, Universe, AccentKey } from './types';
import { ME, SEED_UNIVERSES } from './seed';
import { ACCENT_PALETTE } from './tokens';

type Tweaks = {
  vizStyle: 'constellation' | 'orbital' | 'grid';
  gaugeStyle: 'gauge' | 'stars' | 'merge';
  accent: AccentKey;
  darkMode: boolean;
  fontScale: number;
};

interface State {
  me: Person;
  universes: Universe[];
  activeUniverseId: string;
  lang: Lang;
  tweaks: Tweaks;
  hydrated: boolean;
  setActiveUniverse: (id: string) => void;
  setLang: (l: Lang) => void;
  setTweak: <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void;
  addPerson: (universeId: string, p: Person) => void;
  addUniverse: (name: string) => string;
  findPerson: (id: string) => Person | null;
  markHydrated: () => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      me: ME,
      universes: SEED_UNIVERSES,
      activeUniverseId: 'family',
      lang: 'ko',
      tweaks: {
        vizStyle: 'constellation',
        gaugeStyle: 'gauge',
        accent: 'champagne',
        darkMode: true,
        fontScale: 1,
      },
      hydrated: false,
      setActiveUniverse: (id) => set({ activeUniverseId: id }),
      setLang: (l) => set({ lang: l }),
      setTweak: (k, v) => set({ tweaks: { ...get().tweaks, [k]: v } }),
      addPerson: (universeId, p) => set({
        universes: get().universes.map(u =>
          u.id === universeId ? { ...u, members: [...u.members, p] } : u
        ),
      }),
      addUniverse: (name) => {
        const id = 'u' + Date.now();
        set({
          universes: [...get().universes, { id, name_ko: name, name_en: name, members: [] }],
          activeUniverseId: id,
        });
        return id;
      },
      findPerson: (id) => {
        if (id === 'me') return get().me;
        for (const u of get().universes) {
          const m = u.members.find(p => p.id === id);
          if (m) return m;
        }
        return null;
      },
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'contextella:v1',
      onRehydrateStorage: () => (state) => { state?.markHydrated(); },
    }
  )
);

export function accentHex(k: AccentKey): string {
  return ACCENT_PALETTE[k]?.hex ?? '#E8D4A2';
}
