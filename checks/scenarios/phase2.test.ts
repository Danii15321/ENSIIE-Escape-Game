import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { catalog, readJson, root } from '../../scripts/load-content';
import { answerSchema } from '../../src/core/contracts';
import {
  advance,
  availability,
  createSession,
  dispatch,
  initialProgress,
  integrity,
  outcome,
  restoreSession,
  type Session,
} from '../../src/core/session/engine';
import { endingCopy, endingModel, souvenirText } from '../../src/app/endings';
import { parseEndingCopy } from '../../src/app/endingContent';
import { sourceRegistry } from '../../src/app/catalog';

const acceptance = (id: string) =>
  z
    .object({
      answers: z.array(answerSchema),
      variants: z.record(z.string(), z.array(answerSchema)).default({}),
    })
    .parse(readJson(`game/levels/${id}/acceptance.json`));
const order = [
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
];
function solve(session: Session, id: string) {
  const ref = acceptance(id);
  for (const answer of ref.variants[session.siteId] ?? ref.answers) {
    session = dispatch(session, catalog, { type: 'draft', levelId: id, answer }).session;
    const result = dispatch(session, catalog, { type: 'submit', levelId: id });
    expect(result.evaluation?.status, id).toBe('correct');
    session = result.session;
  }
  return session;
}
function ready() {
  return order.reduce(solve, createSession(catalog, catalog.sites['evry-2026']!, 'phase2'));
}
function choose(session: Session, questionId: string, optionId: string | null) {
  return dispatch(session, catalog, { type: 'choose', levelId: 'fut-c', questionId, optionId })
    .session;
}
for (const theme of ['lucidite', 'sobriete', 'partage', 'horizon-commun'] as const)
  it(`fin ${theme} avec les engagements exacts, reprise et choix figés`, () => {
    let session = ready();
    expect(endingModel(session, catalog)).toBeNull();
    const themes =
      theme === 'horizon-commun' ? ['lucidite', 'sobriete', 'partage'] : [theme, theme, theme];
    for (let i = 0; i < 3; i++) session = choose(session, `c${i + 1}`, themes[i]!);
    const before = integrity(session, catalog);
    session = choose(session, 'c1', themes[0]!);
    expect(integrity(session, catalog)).toBe(before);
    session = restoreSession(JSON.parse(JSON.stringify(session)), catalog);
    session = solve(session, 'syn-03');
    const model = endingModel(session, catalog)!;
    expect(model.theme).toBe(theme);
    expect(model.commitments).toEqual(
      themes.map(
        (theme, i) =>
          endingCopy.commitments.find((c) => c.questionId === `c${i + 1}` && c.optionId === theme)!
            .text,
      ),
    );
    expect(model.badges).toContain('Enquête documentée');
    expect(integrity(session, catalog)).toBe(100);
    expect(choose(session, 'c1', 'sobriete')).toBe(session);
    expect(
      endingModel(restoreSession(JSON.parse(JSON.stringify(session)), catalog), catalog),
    ).toEqual(model);
  });
it('absence, choix partiels et remplacement ne bloquent jamais la capsule', () => {
  let session = ready();
  session = choose(session, 'c1', 'partage');
  session = choose(session, 'c1', 'lucidite');
  expect(session.progress['fut-c']?.choices).toEqual({ c1: 'lucidite' });
  session = choose(session, 'c1', null);
  expect(endingModel(solve(session, 'syn-03'), catalog)?.theme).toBe('horizon-commun');
  session = choose(ready(), 'c2', 'sobriete');
  const partial = endingModel(solve(session, 'syn-03'), catalog)!;
  expect(partial.theme).toBe('sobriete');
  expect(partial.commitments).toHaveLength(1);
  const skipped = endingModel(solve(ready(), 'syn-03'), catalog)!;
  expect(skipped.theme).toBe('horizon-commun');
  expect(skipped.commitments).toEqual([]);
  const level = catalog.levels['fut-c']!;
  const choice = level.dialogue.nodes
    .find((n) => n.id === level.dialogue.entry)!
    .choices.find((c) => c.label === 'Décider plus tard')!;
  const result = advance(
    level,
    initialProgress(level),
    { type: 'dialogue', levelId: level.id, choiceId: choice.id },
    { site: catalog.sites.demo!, inputs: {} },
  );
  expect(result.progress.dialogue).toBe('C.SKIP');
  expect(result.progress.choices).toEqual({});
  expect(level.hints).toEqual([]);
  expect(level.steps).toEqual([]);
  expect(availability(ready(), catalog, 'syn-03')).toBe('available');
});
it('toutes les 64 combinaisons de choix/absence correspondent à la majorité attendue', () => {
  const themes = ['lucidite', 'sobriete', 'partage'];
  for (const a of [null, ...themes])
    for (const b of [null, ...themes])
      for (const c of [null, ...themes]) {
        const selected = [a, b, c];
        const counts = themes.map((t) => selected.filter((v) => v === t).length);
        const max = Math.max(...counts);
        const winners = themes.filter((_, i) => counts[i] === max);
        const expected = max > 0 && winners.length === 1 ? winners[0] : null;
        const result = outcome([catalog.levels['fut-c']!], {
          'fut-c': Object.fromEntries(selected.flatMap((v, i) => (v ? [[`c${i + 1}`, v]] : []))),
        });
        expect(result.theme).toBe(expected);
        expect(result.commitments).toHaveLength(selected.filter(Boolean).length);
      }
});
it('les données conservent tous les textes des fiches et les neuf engagements', () => {
  const council = readFileSync(resolve(root, 'game/levels/fut-c/TASK.md'), 'utf8');
  const final = readFileSync(resolve(root, 'game/endings/TASK.md'), 'utf8');
  const serialized = JSON.stringify({ council: catalog.levels['fut-c'], ending: endingCopy });
  for (const source of [
    council
      .split('## Conception, supports, dialogues et solutions')[1]!
      .split('## Journal de décision')[0]!,
    final.split('## Textes à intégrer')[1]!.split('## Contrat disponible')[0]!,
  ])
    for (const match of source.matchAll(/« (.*?) »/g))
      expect(serialized, match[1]).toContain(match[1]);
  expect(endingCopy.commitments).toHaveLength(9);
  expect(Object.keys(endingCopy.variants)).toHaveLength(4);
  const broken = structuredClone(endingCopy);
  broken.commitments[0]!.text = 'Incohérent';
  expect(() => parseEndingCopy(broken, catalog.levels['fut-c']!, sourceRegistry)).toThrow(
    /engagements/,
  );
  expect(() => parseEndingCopy(endingCopy, catalog.levels['fut-c']!, {})).toThrow(/Source/);
});
it('la capsule accompagnée donne Horizon commun sans inventer un badge de preuves', () => {
  let session = ready();
  for (let i = 0; i < 3; i++)
    session = dispatch(session, catalog, { type: 'hint', levelId: 'syn-03' }).session;
  session = dispatch(session, catalog, {
    type: 'assist',
    levelId: 'syn-03',
    confirmed: true,
  }).session;
  const model = endingModel(session, catalog)!;
  expect(model.theme).toBe('horizon-commun');
  expect(model.missionsAssisted).toBe(1);
  expect(model.hints).toBe(3);
  expect(model.badges).toEqual(['Mémoire restaurée']);
  const souvenir = souvenirText(endingCopy, model, 'Une idée privée.');
  expect(souvenir).toContain('Une idée privée.');
  expect(souvenir).toContain('sans valeur de diplôme officiel');
  expect(souvenir).not.toContain('{equipe}');
});
