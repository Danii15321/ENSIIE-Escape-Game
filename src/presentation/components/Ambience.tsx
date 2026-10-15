import { createContext, useContext, type ReactNode } from 'react';

export type Cue = 'connexion' | 'fragment' | 'acte' | 'capsule';
export type Ambience = {
  reducedMotion: boolean;
  instantText: boolean;
  integrity: number;
  cue: (name: Cue) => void;
};

const AmbienceContext = createContext<Ambience>({
  reducedMotion: true,
  instantText: true,
  integrity: 50,
  cue: () => {},
});

export function AmbienceProvider({ value, children }: { value: Ambience; children: ReactNode }) {
  return <AmbienceContext.Provider value={value}>{children}</AmbienceContext.Provider>;
}

export const useAmbience = () => useContext(AmbienceContext);
