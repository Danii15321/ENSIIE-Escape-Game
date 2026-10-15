import { describe, expect, it } from 'vitest';
import { catalog, readJson } from '../../scripts/load-content';
import { answerSchema, type Answer } from '../../src/core/contracts';
import {
  availability,
  createSession,
  dispatch,
  integrity,
  inventory,
  restoreSession,
  resolveInputs,
  type Session,
} from '../../src/core/session/engine';
import { z } from 'zod';

const create = () => createSession(catalog, catalog.sites.demo!, 'test-session');
const references = (id: string) =>
  z.object({ answers: z.array(answerSchema) }).parse(readJson(`game/levels/${id}/acceptance.json`))
    .answers;
function solve(session: Session, id: string) {
  for (const answer of references(id)) {
    session = dispatch(session, catalog, { type: 'draft', levelId: id, answer }).session;
    const result = dispatch(session, catalog, { type: 'submit', levelId: id });
    expect(result.evaluation?.status).toBe('correct');
    session = result.session;
  }
  return session;
}
describe('Campagne et sauvegarde', () => {
  it('ne permet pas de sauter les prérequis avec un code deviné', () => {
    const session = create();
    expect(
      dispatch(session, catalog, { type: 'draft', levelId: 'syn-01', answer: { key: '2101' } })
        .session,
    ).toBe(session);
    expect(
      dispatch(session, catalog, { type: 'assist', levelId: 'syn-01', confirmed: true }).session,
    ).toBe(session);
    expect(availability(session, catalog, 'pas-01')).toBe('locked');
  });
  it('impose l’ordre du premier acte, reprend et attribue une seule fois', () => {
    let session = solve(create(), 'pro-00');
    expect(integrity(session, catalog)).toBe(0);
    expect(availability(session, catalog, 'pas-01')).toBe('available');
    for (const id of ['pas-02', 'pas-03', 'syn-01'])
      expect(availability(session, catalog, id)).toBe('locked');
    const skipped = dispatch(session, catalog, { type: 'open', levelId: 'pas-03' });
    expect(skipped.session).toBe(session);
    expect(skipped.message).toContain('prérequis');
    for (const id of ['pas-01', 'pas-02', 'pas-03']) {
      session = solve(session, id);
      expect(availability(session, catalog, id)).toBe('succeeded');
    }
    expect(availability(session, catalog, 'syn-01')).toBe('available');
    expect(resolveInputs(session, catalog, 'syn-01').origin?.data.year).toBe(1968);
    session = solve(session, 'syn-01');
    expect(integrity(session, catalog)).toBe(40);
    expect(inventory(session, catalog)).toHaveLength(4);
    const again = dispatch(session, catalog, { type: 'submit', levelId: 'syn-01' }).session;
    expect(again).toBe(session);
    expect(restoreSession(JSON.parse(JSON.stringify(session)), catalog)).toEqual(session);
    expect(availability(session, catalog, 'pre-01')).toBe('available');
    expect(availability(session, catalog, 'syn-02')).toBe('locked');
  });
  it('conserve la première étape de la synthèse et le brouillon de la seconde', () => {
    let session = solve(create(), 'pro-00');
    for (const id of ['pas-01', 'pas-02', 'pas-03']) session = solve(session, id);
    session = dispatch(session, catalog, {
      type: 'draft',
      levelId: 'syn-01',
      answer: references('syn-01')[0]!,
    }).session;
    session = dispatch(session, catalog, { type: 'submit', levelId: 'syn-01' }).session;
    session = dispatch(session, catalog, {
      type: 'draft',
      levelId: 'syn-01',
      answer: { key: '21' },
    }).session;
    const restored = restoreSession(JSON.parse(JSON.stringify(session)), catalog);
    expect(restored.progress['syn-01']?.step).toBe(1);
    expect(restored.progress['syn-01']?.drafts.archive).toEqual({ key: '21' });
  });
  it('exige trois indices pour l’aide complète et ne donne pas de points au prologue', () => {
    let session = create();
    session = dispatch(session, catalog, {
      type: 'assist',
      levelId: 'pro-00',
      confirmed: true,
    }).session;
    expect(session.progress['pro-00']?.status).toBe('started');
    for (let i = 0; i < 4; i++)
      session = dispatch(session, catalog, { type: 'hint', levelId: 'pro-00' }).session;
    expect(session.progress['pro-00']?.hints).toBe(3);
    session = dispatch(session, catalog, {
      type: 'assist',
      levelId: 'pro-00',
      confirmed: true,
    }).session;
    expect(session.progress['pro-00']?.status).toBe('assisted');
    expect(integrity(session, catalog)).toBe(0);
    expect(restoreSession(session, catalog)).toEqual(session);
  });
  it('refuse un import incompatible, une fausse réussite ou une date impossible', () => {
    const session = solve(create(), 'pro-00');
    expect(() => restoreSession({ ...session, siteRevision: 99 }, catalog)).toThrow();
    const modified = structuredClone(session);
    modified.progress['pro-00']!.drafts.signal = { name: 'FAUX' };
    expect(() => restoreSession(modified, catalog)).toThrow('Preuve');
    const invalid: Answer = { date: '31/02/2006', evidence: ['publication', 'rule'] };
    const ready = solve(solve(session, 'pas-01'), 'pas-02');
    const draft = dispatch(ready, catalog, {
      type: 'draft',
      levelId: 'pas-03',
      answer: invalid,
    }).session;
    expect(dispatch(draft, catalog, { type: 'submit', levelId: 'pas-03' }).evaluation?.status).toBe(
      'format',
    );
  });
  it('refuse un choix de dialogue absent sans changer le nœud', () => {
    const result = dispatch(create(), catalog, {
      type: 'dialogue',
      levelId: 'pro-00',
      choiceId: 'invented',
    });
    expect(result.session.progress['pro-00']?.dialogue).toBe(
      catalog.levels['pro-00']!.dialogue.entry,
    );
    expect(result.message).toContain('pas disponible');
  });
});
