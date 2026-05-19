'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang, Person, Universe, AccentKey, ElementKey } from './types';
import type { PillarView } from './saju/profile';
import { ACCENT_PALETTE } from './tokens';
import {
  serializeMe,
  serializeUniverse,
  meSaju as deriveMeSaju,
  userPillars,
  type DbUser,
  type DbUniverse,
  type DbPerson,
} from './api/serialize';

type Tweaks = {
  vizStyle: 'constellation' | 'orbital' | 'grid';
  gaugeStyle: 'gauge' | 'stars' | 'merge';
  accent: AccentKey;
  darkMode: boolean;
  fontScale: number;
};

export type MeSaju = { pillars: PillarView[]; balance: Record<ElementKey, number> };
export type AppStatus = 'idle' | 'ready' | 'onboarding';

// Raw, persisted local data — the single source of truth. The cloud is only
// an optional backup synced when the user is signed in.
export interface LocalProfile {
  name: string;
  birthDate: string;
  birthTime: string | null;
  gender: string;
}

export interface NewPersonInput {
  universeId: string;
  name: string;
  relation: string;
  gender: string;
  birthDate: string;
  birthTime: string | null;
  emoji?: string;
}

interface State {
  // --- Device-local UI preferences (persisted) ---
  lang: Lang;
  tweaks: Tweaks;
  hydrated: boolean;

  // --- Raw app data (persisted locally; mirrored to cloud when signed in) ---
  profile: LocalProfile | null;
  rawUniverses: DbUniverse[];
  activeUniverseId: string;

  // --- Derived runtime state (not persisted) ---
  status: AppStatus;
  me: Person | null;
  meSaju: MeSaju | null;
  universes: Universe[];

  // --- Cloud state ---
  cloudEmail: string | null; // signed-in account email, or null for guests
  syncing: boolean;

  // --- UI actions ---
  setActiveUniverse: (id: string) => void;
  setLang: (l: Lang) => void;
  setTweak: <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void;
  markHydrated: () => void;

  // --- Data actions ---
  init: () => Promise<void>;
  recompute: () => void;
  addUniverse: (name: string) => string;
  addPerson: (input: NewPersonInput) => string;
  updateProfile: (patch: Partial<LocalProfile>) => void;
  findPerson: (id: string) => Person | null;

  // --- Cloud actions ---
  pushCloud: () => Promise<void>;
  signOutLocal: () => void;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const localId = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      lang: 'ko',
      tweaks: {
        vizStyle: 'constellation',
        gaugeStyle: 'gauge',
        accent: 'champagne',
        darkMode: true,
        fontScale: 1,
      },
      hydrated: false,

      profile: null,
      rawUniverses: [],
      activeUniverseId: '',

      status: 'idle',
      me: null,
      meSaju: null,
      universes: [],

      cloudEmail: null,
      syncing: false,

      setActiveUniverse: (id) => set({ activeUniverseId: id }),
      setLang: (l) => set({ lang: l }),
      setTweak: (k, v) => set({ tweaks: { ...get().tweaks, [k]: v } }),
      markHydrated: () => set({ hydrated: true }),

      // Re-derive all enriched state (me, saju, universes) from raw local data.
      recompute: () => {
        const { profile, rawUniverses, activeUniverseId } = get();
        if (!profile || !profile.birthDate) {
          set({ status: 'onboarding', me: null, meSaju: null, universes: [] });
          return;
        }
        const dbUser: DbUser = {
          id: 'me',
          name: profile.name,
          birthDate: profile.birthDate,
          birthTime: profile.birthTime,
          gender: profile.gender,
        };
        const mePil = userPillars(dbUser);
        const universes = rawUniverses.map(u => serializeUniverse(u, mePil));
        set({
          status: 'ready',
          me: serializeMe(dbUser),
          meSaju: deriveMeSaju(dbUser),
          universes,
          activeUniverseId: universes.some(u => u.id === activeUniverseId)
            ? activeUniverseId
            : (universes[0]?.id ?? ''),
        });
      },

      init: async () => {
        // Render instantly from local data, then reconcile with the cloud.
        get().recompute();
        try {
          const res = await fetch('/api/sync');
          if (!res.ok) { set({ cloudEmail: null }); return; }
          const data = await res.json();
          set({ cloudEmail: data.email ?? null });
          if (data.profile) {
            // The account already holds data — adopt it as the source of truth.
            set({ profile: data.profile, rawUniverses: data.universes ?? [] });
            get().recompute();
          } else if (get().profile) {
            // Fresh account — back up the local guest data.
            get().pushCloud();
          }
        } catch {
          set({ cloudEmail: null });
        }
      },

      addUniverse: (name) => {
        const id = localId('u');
        set({
          rawUniverses: [
            ...get().rawUniverses,
            { id, nameKo: name, nameEn: name, icon: null, accentTint: null, members: [] },
          ],
        });
        get().recompute();
        set({ activeUniverseId: id });
        get().pushCloud();
        return id;
      },

      addPerson: (input) => {
        const id = localId('p');
        const person: DbPerson = {
          id,
          nameKo: input.name,
          nameEn: input.name,
          relation: input.relation,
          gender: input.gender,
          birthDate: input.birthDate,
          birthTime: input.birthTime,
          emoji: input.emoji ?? null,
        };
        set({
          rawUniverses: get().rawUniverses.map(u =>
            u.id === input.universeId ? { ...u, members: [...u.members, person] } : u,
          ),
        });
        get().recompute();
        get().pushCloud();
        return id;
      },

      updateProfile: (patch) => {
        const cur = get().profile ?? { name: '', birthDate: '', birthTime: null, gender: 'o' };
        set({ profile: { ...cur, ...patch } });
        get().recompute();
        get().pushCloud();
      },

      findPerson: (id) => {
        if (id === 'me') return get().me;
        for (const u of get().universes) {
          const m = u.members.find(p => p.id === id);
          if (m) return m;
        }
        return null;
      },

      // Mirror local data to the cloud — only when signed in.
      pushCloud: async () => {
        const { cloudEmail, profile, rawUniverses } = get();
        if (!cloudEmail || !profile?.birthDate) return;
        set({ syncing: true });
        try {
          await fetch('/api/sync', {
            method: 'PUT',
            headers: JSON_HEADERS,
            body: JSON.stringify({ profile, universes: rawUniverses }),
          });
        } catch {
          /* offline — local data is still safe; next change retries */
        }
        set({ syncing: false });
      },

      // Drop the signed-in session's data from this device on sign-out.
      signOutLocal: () => {
        set({
          profile: null, rawUniverses: [], activeUniverseId: '',
          cloudEmail: null, me: null, meSaju: null, universes: [], status: 'onboarding',
        });
      },
    }),
    {
      name: 'contextella:v1',
      // Persist UI prefs + raw app data; derived state and cloud flags stay in memory.
      partialize: (s) => ({
        lang: s.lang,
        tweaks: s.tweaks,
        profile: s.profile,
        rawUniverses: s.rawUniverses,
        activeUniverseId: s.activeUniverseId,
      }),
      onRehydrateStorage: () => (state) => { state?.markHydrated(); },
    },
  ),
);

export function accentHex(k: AccentKey): string {
  return ACCENT_PALETTE[k]?.hex ?? '#E8D4A2';
}
