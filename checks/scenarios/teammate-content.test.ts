import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { catalog, readJson, root } from '../../scripts/load-content';
import { answerSchema } from '../../src/core/contracts';
import {
  advance,
  availability,
  createSession,
  dispatch,
  initialProgress,
  integrity,
  inventory,
  restoreSession,
  type Session,
} from '../../src/core/session/engine';
import { evaluate } from '../../src/core/validation/mechanics';
import {
  feedbackLine,
  parsePresentationCatalog,
} from '../../src/presentation/components/EditorialCopy';
import { z } from 'zod';

const ids = ['pro-00', 'pas-01', 'pas-02', 'pas-03', 'syn-01', 'ext-est'];
const copies = parsePresentationCatalog(
  Object.fromEntries(
    ids.map((id) => [
      `game/levels/${id}/presentation.json`,
      readJson(`game/levels/${id}/presentation.json`),
    ]),
  ),
);
const context = { inputs: {}, site: catalog.sites.demo! };
const references = (id: string) =>
  z.object({ answers: z.array(answerSchema) }).parse(readJson(`game/levels/${id}/acceptance.json`))
    .answers;
function solve(session: Session, id: string) {
  for (const answer of references(id)) {
    session = dispatch(session, catalog, { type: 'draft', levelId: id, answer }).session;
    session = dispatch(session, catalog, { type: 'submit', levelId: id }).session;
  }
  return session;
}

describe('Livraison Teammate — contenu', () => {
  for (const id of ids)
    it(`${id} : toutes les répliques de la fiche sont conservées`, () => {
      const task = readFileSync(resolve(root, `game/levels/${id}/TASK.md`), 'utf8');
      const serialized = JSON.stringify({ level: catalog.levels[id], presentation: copies[id] });
      for (const line of task
        .split('\n')
        .filter((line) => /^\| (?:PRO\.|P[123]\.|S1\.|EST\.|Erreur |Indice [123] )/.test(line))) {
        for (const match of line.matchAll(/« (.*?) »/g))
          expect(serialized, `${id} : ${match[1]}`).toContain(match[1]);
      }
    });

  it('toutes les conditions éditoriales ciblent une étape et un champ existants', () => {
    for (const [id, copy] of Object.entries(copies))
      for (const rule of copy.feedback) {
        const step = catalog.levels[id]!.steps.find((step) => step.id === rule.when.step);
        expect(step).toBeDefined();
        if (rule.when.field && (step?.mechanic.kind === 'form' || step?.mechanic.kind === 'order'))
          expect(step.mechanic.fields.some((field) => field.id === rule.when.field)).toBe(true);
      }
  });

  it('choisit les retours spécifiques aux dates et à la preuve', () => {
    for (const [value, id] of [
      ['5/7/2006', 'P3.NEAR1'],
      ['07072006', 'P3.NEAR2'],
      ['2006-08-01', 'P3.PROOF'],
      ['31/02/2006', 'P3.DATE'],
    ])
      expect(feedbackLine(copies['pas-03'], 'date', { date: value! }, context)?.id).toBe(id);
    expect(
      feedbackLine(copies['pas-01'], 'timeline', { 'creation-year': '1972' }, context)?.id,
    ).toBe('P1.NEAR');
    expect(feedbackLine(copies['pas-02'], 'decode', { observation: '4' }, context)?.id).toBe(
      'P2.OBSERROR',
    );
    expect(feedbackLine(copies['syn-01'], 'archive', { key: '1712' }, context)?.id).toBe(
      'S1.NEAR1',
    );
    expect(feedbackLine(copies['syn-01'], 'archive', { key: '2005' }, context)?.id).toBe(
      'S1.NEAR2',
    );
    expect(feedbackLine(copies['syn-01'], 'calibrate', { capture: '17122004' }, context)?.id).toBe(
      'S1.SLOT',
    );
    expect(feedbackLine(copies['syn-01'], 'calibrate', { capture: '1712' }, context)?.id).toBe(
      'S1.DATE',
    );
  });

  it('les choix de questions du prologue reviennent au menu sans gagner le niveau', () => {
    const level = catalog.levels['pro-00']!;
    let progress = initialProgress(level);
    for (const label of [
      'Recevoir le message',
      'Qui t’a créée ?',
      'Revenir aux questions',
      'Pourquoi nous ?',
      'Revenir aux questions',
      'Comment t’aider ?',
      'Garder {equipe}',
      'Rétablir le canal',
      'Examiner le signal',
    ]) {
      const choice = level.dialogue.nodes
        .find((node) => node.id === progress.dialogue)!
        .choices.find((choice) => choice.label === label)!;
      expect(choice).toBeDefined();
      progress = advance(
        level,
        progress,
        { type: 'dialogue', levelId: level.id, choiceId: choice.id },
        context,
      ).progress;
    }
    expect(progress.dialogue).toBeNull();
    expect(progress.status).toBe('started');
  });

  it('EXT-EST exige le code postal et le classement historique', () => {
    const mechanic = catalog.levels['ext-est']!.steps[0]!.mechanic;
    expect(
      evaluate(mechanic, { 'postal-code': '67400', epoch: 'historical' }, context).status,
    ).toBe('correct');
    for (const epoch of ['current', 'fiction', ''])
      expect(evaluate(mechanic, { 'postal-code': '67400', epoch }, context).status).not.toBe(
        'correct',
      );
    for (const value of ['67000', '2014', 'Strasbourg', ''])
      expect(
        evaluate(mechanic, { 'postal-code': value, epoch: 'historical' }, context).status,
      ).not.toBe('correct');
  });

  it('EXT-EST se débloque après SYN-01, se reprend, et ne modifie pas les points', () => {
    let session = createSession(catalog, context.site, 'extension-test');
    expect(availability(session, catalog, 'ext-est')).toBe('locked');
    for (const id of ['pro-00', 'pas-01', 'pas-02', 'pas-03', 'syn-01'])
      session = solve(session, id);
    expect(availability(session, catalog, 'ext-est')).toBe('available');
    session = dispatch(session, catalog, {
      type: 'draft',
      levelId: 'ext-est',
      answer: { 'postal-code': '67400', epoch: 'current' },
    }).session;
    session = restoreSession(JSON.parse(JSON.stringify(session)), catalog);
    expect(session.progress['ext-est']!.drafts.classify).toEqual({
      'postal-code': '67400',
      epoch: 'current',
    });
    session = solve(session, 'ext-est');
    expect(integrity(session, catalog)).toBe(40);
    expect(inventory(session, catalog).filter((item) => item.type === 'ArchiveEst')).toHaveLength(
      1,
    );
    expect(dispatch(session, catalog, { type: 'submit', levelId: 'ext-est' }).session).toBe(
      session,
    );
    expect(restoreSession(session, catalog)).toEqual(session);
  });

  it('EXT-EST peut être accompagné sans bloquer le parcours', () => {
    const level = catalog.levels['ext-est']!;
    let progress = initialProgress(level);
    for (let i = 0; i < 3; i++)
      progress = advance(level, progress, { type: 'hint', levelId: level.id }, context).progress;
    expect(
      advance(level, progress, { type: 'assist', levelId: level.id, confirmed: true }, context)
        .progress.status,
    ).toBe('assisted');
  });
});
