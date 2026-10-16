import { z } from 'zod';
import type { Catalog } from '../content/catalog';
import { availability, isComplete, type Session } from './engine';

const id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/);
const text = z.string().min(1);
const speaker = z.enum(['ARIIE', 'Nora', 'Système']);
const line = z.object({ speaker, text });
const chapterSchema = z.object({
  id,
  label: text,
  title: text,
  era: z.enum(['prologue', 'past', 'present', 'future']),
  years: z.object({ from: z.number().int(), to: z.number().int() }),
  roll: z.object({ from: z.number().int(), to: z.number().int() }),
  icon: z.enum(['signal', 'folder', 'network', 'seed']),
  lines: z.array(line).min(1),
  questions: z.array(z.object({ label: text, speaker, text })).default([]),
  closing: line.optional(),
  images: z.array(id).default([]),
  levels: z.array(id).min(1),
});
const journeySchema = z.object({
  version: z.literal(1),
  chapters: z.array(chapterSchema).min(1),
  bonus: z.array(z.object({ level: id, after: id, label: text, image: id.optional() })).default([]),
  teasers: z.record(z.string(), text),
});
export type Journey = z.infer<typeof journeySchema>;
export type Chapter = Journey['chapters'][number];
export type Era = Chapter['era'];
export type Stop = {
  levelId: string;
  chapter: Chapter;
  index: number;
  count: number;
  optional: boolean;
};
export type StopState = 'done' | 'current' | 'open' | 'visited' | 'locked';

export function parseJourney(raw: unknown, catalog: Catalog): Journey {
  const journey = journeySchema.parse(raw);
  const errors: string[] = [];
  const main = journey.chapters.flatMap((chapter) => chapter.levels);
  const bonus = journey.bonus.map((entry) => entry.level);
  const all = [...main, ...bonus];
  const campaign = new Map(catalog.campaign.levels.map((entry) => [entry.id, entry]));
  if (new Set(journey.chapters.map((chapter) => chapter.id)).size !== journey.chapters.length)
    errors.push('Parcours : chapitre dupliqué');
  if (new Set(all).size !== all.length) errors.push('Parcours : niveau placé deux fois');
  for (const levelId of campaign.keys())
    if (!all.includes(levelId)) errors.push(`Parcours : ${levelId} absent`);
  for (const levelId of all)
    if (!campaign.has(levelId)) errors.push(`Parcours : ${levelId} inconnu de la campagne`);
  main.forEach((levelId, index) => {
    for (const required of campaign.get(levelId)?.requires ?? [])
      if (!main.slice(0, index).includes(required))
        errors.push(`Parcours : ${levelId} placé avant son prérequis ${required}`);
  });
  for (const entry of journey.bonus) {
    const after = main.indexOf(entry.after);
    if (after === -1) errors.push(`Parcours : bonus ${entry.level} après ${entry.after} inconnu`);
    for (const required of campaign.get(entry.level)?.requires ?? [])
      if (!main.slice(0, after + 1).includes(required))
        errors.push(`Parcours : bonus ${entry.level} proposé avant ${required}`);
  }
  if (!main.includes(catalog.campaign.finalLevel))
    errors.push('Parcours : le final doit appartenir au chemin principal');
  for (const levelId of all)
    if (!journey.teasers[levelId]) errors.push(`Parcours : accroche absente pour ${levelId}`);
  for (const key of Object.keys(journey.teasers))
    if (!all.includes(key)) errors.push(`Parcours : accroche inutile ${key}`);
  if (errors.length) throw new Error(errors.join('\n'));
  return journey;
}

export function stops(journey: Journey, catalog: Catalog): Stop[] {
  return journey.chapters.flatMap((chapter) =>
    chapter.levels.map((levelId, index) => ({
      levelId,
      chapter,
      index,
      count: chapter.levels.length,
      optional: Boolean(catalog.levels[levelId]?.narrative),
    })),
  );
}

export function chapterOf(journey: Journey, levelId: string): Chapter | undefined {
  return (
    journey.chapters.find((chapter) => chapter.levels.includes(levelId)) ??
    journey.chapters.find((chapter) =>
      chapter.levels.includes(journey.bonus.find((entry) => entry.level === levelId)?.after ?? ''),
    )
  );
}

const handled = (session: Session, catalog: Catalog, levelId: string) =>
  catalog.levels[levelId]?.narrative
    ? session.progress[levelId] !== undefined
    : isComplete(session.progress[levelId]);

export function nextStop(journey: Journey, session: Session, catalog: Catalog): Stop | null {
  return stops(journey, catalog).find((stop) => !handled(session, catalog, stop.levelId)) ?? null;
}

export function stopState(
  journey: Journey,
  session: Session,
  catalog: Catalog,
  levelId: string,
): StopState {
  const state = availability(session, catalog, levelId);
  if (state === 'locked' || state === 'draft') return 'locked';
  if (state === 'succeeded' || state === 'assisted') return 'done';
  if (nextStop(journey, session, catalog)?.levelId === levelId) return 'current';
  return catalog.levels[levelId]?.narrative && session.progress[levelId] ? 'visited' : 'open';
}

export function closesChapter(journey: Journey, catalog: Catalog, levelId: string): boolean {
  const chapter = journey.chapters.find((item) => item.levels.includes(levelId));
  const required = chapter?.levels.filter((id) => !catalog.levels[id]?.narrative) ?? [];
  return required.at(-1) === levelId;
}

export const INTEGRITY_STATES = [
  { min: 0, label: 'Signal fragmenté' },
  { min: 40, label: 'Mémoire en reconstruction' },
  { min: 70, label: 'Transmission presque stable' },
  { min: 100, label: 'Mémoire restaurée' },
] as const;

export function integrityState(score: number) {
  let tier = 0;
  INTEGRITY_STATES.forEach((state, index) => {
    if (score >= state.min) tier = index;
  });
  return { tier, label: INTEGRITY_STATES[tier]!.label };
}
