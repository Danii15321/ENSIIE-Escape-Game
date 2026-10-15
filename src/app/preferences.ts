import { useEffect, useState } from 'react';
import { z } from 'zod';

export const PREFS_KEY = 'chrono-iie:prefs:v1';
export const prefsSchema = z.object({
  reduceMotion: z.boolean().nullable().default(null),
  instantText: z.boolean().default(false),
  sound: z.boolean().default(true),
  largeText: z.boolean().default(false),
  helpNudges: z.boolean().default(true),
});
export type Prefs = z.infer<typeof prefsSchema>;
type Store = Pick<Storage, 'getItem' | 'setItem'>;

export function readPrefs(storage: Store | null): Prefs {
  try {
    return prefsSchema.parse(JSON.parse(storage?.getItem(PREFS_KEY) ?? '{}'));
  } catch {
    return prefsSchema.parse({});
  }
}

export function writePrefs(storage: Store | null, prefs: Prefs): boolean {
  try {
    storage?.setItem(PREFS_KEY, JSON.stringify(prefs));
    return Boolean(storage);
  } catch {
    return false;
  }
}

export function systemReducedMotion(): boolean {
  return (
    typeof window.matchMedia !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const storage = (): Store | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export function usePreferences() {
  const [prefs, setPrefs] = useState<Prefs>(() => readPrefs(storage()));
  const reducedMotion = prefs.reduceMotion ?? systemReducedMotion();
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = reducedMotion ? 'reduced' : 'full';
    root.dataset.text = prefs.largeText ? 'large' : 'normal';
  }, [reducedMotion, prefs.largeText]);
  return {
    prefs,
    reducedMotion,
    update(patch: Partial<Prefs>) {
      setPrefs((current) => {
        const next = { ...current, ...patch };
        writePrefs(storage(), next);
        return next;
      });
    },
  };
}
