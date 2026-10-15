import { expect, it } from 'vitest';
import { z } from 'zod';
import { catalog, readJson } from '../../scripts/load-content';
import { answerSchema, siteSchema } from '../../src/core/contracts';
import {
  advance,
  createSession,
  dispatch,
  initialProgress,
  integrity,
  inventory,
  resolveInputs,
  restoreSession,
} from '../../src/core/session/engine';
import { caesar } from '../../src/core/validation/mechanics';

const site = catalog.sites['evry-2026']!;
const order = [
  'pro-00',
  'pas-01',
  'pas-02',
  'pas-03',
  'syn-01',
  'pre-02',
  'pre-01',
  'syn-02',
  'fut-01',
  'fut-02',
  'syn-03',
  'ext-est',
];
const acceptance = (id: string) =>
  z
    .object({
      answers: z.array(answerSchema),
      variants: z.record(z.string(), z.array(answerSchema)).default({}),
    })
    .parse(readJson(`game/levels/${id}/acceptance.json`));

for (const secours of [false, true])
  it(`Évry atteint 100 points et CAPSULE, secours=${secours}, export/reprise à chaque étape`, () => {
    let session = createSession(catalog, site, `evry-${secours}`);
    for (const id of order) {
      if (secours)
        for (const observation of catalog.levels[id]!.observations) {
          const before = integrity(session, catalog);
          session = dispatch(session, catalog, {
            type: 'fallback',
            levelId: id,
            observation,
          }).session;
          session = dispatch(session, catalog, {
            type: 'fallback',
            levelId: id,
            observation,
          }).session;
          expect(integrity(session, catalog)).toBe(before);
          expect(session.progress[id]!.fallbackObservations).toEqual([observation]);
          expect(session.progress[id]!.hints).toBe(0);
          expect(session.progress[id]!.status).toBe('started');
          session = restoreSession(JSON.parse(JSON.stringify(session)), catalog);
        }
      const reference = acceptance(id);
      for (const answer of reference.variants[site.id] ?? reference.answers) {
        session = dispatch(session, catalog, { type: 'draft', levelId: id, answer }).session;
        const result = dispatch(session, catalog, { type: 'submit', levelId: id });
        expect(result.evaluation?.status, id).toBe('correct');
        session = restoreSession(JSON.parse(JSON.stringify(result.session)), catalog);
      }
    }
    expect(integrity(session, catalog)).toBe(100);
    expect(resolveInputs(session, catalog, 'syn-02').orientation?.data).toEqual({
      observed: 3,
      direction: 'reverse',
    });
    const notebook = inventory(session, catalog);
    expect(notebook.find((f) => f.type === 'CleTransmission')?.data.word).toBe('CAPSULE');
    expect(notebook.find((f) => f.type === 'OrientationLecture')?.fallbackObservations).toEqual(
      secours ? ['O2'] : [],
    );
    expect(new Set(notebook.map((f) => f.rewardId)).size).toBe(notebook.length);
    expect(session.siteId).toBe('evry-2026');
    expect(session.siteRevision).toBe(1);
    const changed = structuredClone(catalog);
    changed.sites[site.id]!.revision++;
    expect(() => restoreSession(session, changed)).toThrow(/site incompatible/);
  });

it('valide le relevé réel, sa provenance et le César +2 ; les DEMO restent fictifs', () => {
  expect(site.observations).toEqual({ O1: 2, O2: 3 });
  expect(site.mode).toBe('real');
  expect(site.landmarks?.O1.route).toContain('tournez à droite');
  expect(siteSchema.safeParse({ ...site, landmarks: undefined }).success).toBe(false);
  expect(siteSchema.safeParse({ ...site, testimony: undefined }).success).toBe(false);
  expect(catalog.sites.demo!.mode).toBe('demo');
  expect(catalog.sites.demo!.observations).toEqual({ O1: 3, O2: 4 });
  expect(caesar('INSTITUT INFORMATIQUE ENTREPRISE', 2)).toBe('KPUVKVWV KPHQTOCVKSWG GPVTGRTKUG');
  expect(caesar('KPUVKVWV KPHQTOCVKSWG GPVTGRTKUG', -2)).toBe('INSTITUT INFORMATIQUE ENTREPRISE');
});
it('refuse un secours pour un autre repère, un profil DEMO ou un dossier verrouillé', () => {
  const level = catalog.levels['pas-02']!;
  const progress = initialProgress(level);
  expect(
    advance(
      level,
      progress,
      { type: 'fallback', levelId: level.id, observation: 'O2' },
      { site, inputs: {} },
    ).progress,
  ).toBe(progress);
  expect(
    advance(
      level,
      progress,
      { type: 'fallback', levelId: level.id, observation: 'O1' },
      { site: catalog.sites.demo!, inputs: {} },
    ).progress,
  ).toBe(progress);
  const session = createSession(catalog, site, 'locked');
  expect(
    dispatch(session, catalog, { type: 'fallback', levelId: level.id, observation: 'O1' }).session,
  ).toBe(session);
  const invalid = createSession(catalog, catalog.sites.demo!, 'invalid');
  invalid.progress['pro-00'] = {
    ...initialProgress(catalog.levels['pro-00']!),
    fallbackObservations: ['O1'],
  };
  expect(() => restoreSession(invalid, catalog)).toThrow(/Secours incompatible/);
});
