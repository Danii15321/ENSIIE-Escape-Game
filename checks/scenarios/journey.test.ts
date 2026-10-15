import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { catalog, journey, readJson } from '../../scripts/load-content';
import { answerSchema } from '../../src/core/contracts';
import { createSession, dispatch, type Session } from '../../src/core/session/engine';
import {
  closesChapter,
  integrityState,
  nextStop,
  parseJourney,
  stopState,
  stops,
} from '../../src/core/session/journey';

const raw = readJson('game/campaigns/chrono-iie/journey.json') as {
  chapters: { levels: string[] }[];
  bonus: { level: string; after: string }[];
  teasers: Record<string, string>;
};
const solve = (session: Session, levelId: string) => {
  for (const answer of z
    .object({ answers: z.array(answerSchema) })
    .parse(readJson(`game/levels/${levelId}/acceptance.json`)).answers) {
    session = dispatch(session, catalog, { type: 'draft', levelId, answer }).session;
    session = dispatch(session, catalog, { type: 'submit', levelId }).session;
  }
  return session;
};

describe('Parcours linéaire', () => {
  it('place chaque niveau une fois, dans l’ordre des prérequis', () => {
    expect(stops(journey, catalog).map((stop) => stop.levelId)).toEqual([
      'pro-00',
      'pas-01',
      'pas-02',
      'pas-03',
      'syn-01',
      'pre-01',
      'pre-02',
      'syn-02',
      'fut-01',
      'fut-02',
      'fut-c',
      'syn-03',
    ]);
    expect(stops(journey, catalog).find((stop) => stop.levelId === 'fut-c')?.optional).toBe(true);
    expect(journey.bonus.map((entry) => entry.level)).toEqual(['ext-est']);
  });

  it('refuse un niveau oublié, déplacé, dupliqué ou sans accroche', () => {
    const swapped = structuredClone(raw);
    swapped.chapters[1]!.levels = ['pas-02', 'pas-01', 'pas-03', 'syn-01'];
    expect(() => parseJourney(swapped, catalog)).toThrow('pas-02 placé avant son prérequis pas-01');
    const missing = structuredClone(raw);
    missing.chapters[2]!.levels = ['pre-01', 'syn-02'];
    expect(() => parseJourney(missing, catalog)).toThrow('pre-02 absent');
    const twice = structuredClone(raw);
    twice.bonus.push({ level: 'pas-01', after: 'syn-01', label: 'Bonus' } as never);
    expect(() => parseJourney(twice, catalog)).toThrow('placé deux fois');
    const early = structuredClone(raw);
    early.bonus[0]!.after = 'pas-01';
    expect(() => parseJourney(early, catalog)).toThrow('proposé avant syn-01');
    const silent = structuredClone(raw);
    delete silent.teasers['syn-02'];
    expect(() => parseJourney(silent, catalog)).toThrow('accroche absente pour syn-02');
  });

  it('propose toujours une seule suite, le Conseil compris, jusqu’à la capsule', () => {
    let session = createSession(catalog, catalog.sites.demo!, 'journey');
    const seen: string[] = [];
    for (let guard = 0; guard < 20; guard++) {
      const next = nextStop(journey, session, catalog);
      if (!next) break;
      seen.push(next.levelId);
      expect(stopState(journey, session, catalog, next.levelId)).toBe('current');
      const path = stops(journey, catalog);
      for (const stop of path.slice(path.findIndex((s) => s.levelId === next.levelId) + 1))
        if (!(next.levelId === 'fut-c' && stop.levelId === 'syn-03'))
          expect(stopState(journey, session, catalog, stop.levelId), stop.levelId).toBe('locked');
      session = next.optional
        ? dispatch(session, catalog, { type: 'open', levelId: next.levelId }).session
        : solve(session, next.levelId);
    }
    expect(seen).toEqual(stops(journey, catalog).map((stop) => stop.levelId));
    expect(stopState(journey, session, catalog, 'fut-c')).toBe('visited');
    expect(stopState(journey, session, catalog, 'syn-03')).toBe('done');
  });

  it('laisse le Conseil facultatif sans bloquer le contrôle final', () => {
    let session = createSession(catalog, catalog.sites.demo!, 'skip');
    for (const levelId of ['pro-00', 'pas-01', 'pas-02', 'pas-03', 'syn-01'])
      session = solve(session, levelId);
    for (const levelId of ['pre-01', 'pre-02', 'syn-02', 'fut-01', 'fut-02'])
      session = solve(session, levelId);
    expect(nextStop(journey, session, catalog)?.levelId).toBe('fut-c');
    expect(stopState(journey, session, catalog, 'syn-03')).toBe('open');
    session = dispatch(session, catalog, { type: 'open', levelId: 'fut-c' }).session;
    expect(stopState(journey, session, catalog, 'fut-c')).toBe('visited');
    expect(nextStop(journey, session, catalog)?.levelId).toBe('syn-03');
  });

  it('repère la fin de chaque acte et nomme les quatre états d’intégrité', () => {
    expect(
      journey.chapters.flatMap((chapter) =>
        chapter.levels.filter((levelId) => closesChapter(journey, catalog, levelId)),
      ),
    ).toEqual(['pro-00', 'syn-01', 'syn-02', 'syn-03']);
    expect([0, 39, 40, 69, 70, 99, 100].map((score) => integrityState(score).label)).toEqual([
      'Signal fragmenté',
      'Signal fragmenté',
      'Mémoire en reconstruction',
      'Mémoire en reconstruction',
      'Transmission presque stable',
      'Transmission presque stable',
      'Mémoire restaurée',
    ]);
  });
});
