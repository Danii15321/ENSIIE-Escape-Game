import type { Era, StopState } from '../../core/session/journey';
import type { Media } from '../theme/media';

export type StopView = {
  levelId: string;
  title: string;
  teaser: string;
  minutes: number;
  state: StopState;
  optional: boolean;
  number: number;
  assisted: boolean;
  after?: string;
};
export type BonusView = StopView & { label: string; image?: Media; afterLevelId: string };
export type ChapterView = {
  id: string;
  label: string;
  title: string;
  era: Era;
  years: { from: number; to: number };
  icon: string;
  done: number;
  total: number;
  stops: StopView[];
};
export type NextView = StopView & { chapterLabel: string; era: Era; started: boolean };
export type SiteOption = { id: string; title: string; mode: 'demo' | 'real' };
export type MemoryEntry = {
  levelId: string;
  title: string;
  state: 'restored' | 'assisted' | 'missing';
  fragments: string[];
  capsule: string;
  note?: string;
};
export type MemoryChapter = {
  id: string;
  label: string;
  title: string;
  era: Era;
  entries: MemoryEntry[];
};
