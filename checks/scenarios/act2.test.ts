import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { catalog, readJson } from '../../scripts/load-content';
import { answerSchema, type Answer } from '../../src/core/contracts';
import {
  availability,
  createSession,
  dispatch,
  integrity,
  inventory,
  resolveInputs,
  restoreSession,
  type Session,
} from '../../src/core/session/engine';

const acceptance = (id: string) =>
  z
    .object({
      answers: z.array(answerSchema),
      variants: z.record(z.string(), z.array(answerSchema)).default({}),
    })
    .parse(readJson(`game/levels/${id}/acceptance.json`));
function answersFor(id: string, siteId: string): Answer[] {
  const { answers, variants } = acceptance(id);
  if (variants[siteId]) return variants[siteId];
  if (id !== 'pas-02') return answers;
  const shift = String(catalog.sites[siteId]!.observations.O1);
  return answers.map((answer) => ({ ...answer, observation: shift, shift }));
}

function submit(session: Session, levelId: string, answer: Answer) {
  session = dispatch(session, catalog, { type: 'draft', levelId, answer }).session;
  return dispatch(session, catalog, { type: 'submit', levelId });
}
function solve(session: Session, id: string) {
  for (const answer of answersFor(id, session.siteId)) {
    const result = submit(session, id, answer);
    expect(result.evaluation?.status, `${id} ${session.siteId}`).toBe('correct');
    session = result.session;
  }
  return session;
}
function throughActOne(siteId: string) {
  let session = createSession(catalog, catalog.sites[siteId]!, `act2-${siteId}`);
  for (const id of ['pro-00', 'pas-01', 'pas-02', 'pas-03', 'syn-01']) session = solve(session, id);
  return session;
}

describe('Acte II en campagne', () => {
  for (const [siteId, direction] of [
    ['demo', 'forward'],
    ['demo-odd', 'reverse'],
  ] as const)
    it(`${siteId} : PRE-01 puis PRE-02 dans l’ordre, puis CAPSULE`, () => {
      let session = throughActOne(siteId);
      expect(availability(session, catalog, 'pre-02')).toBe('locked');
      session = solve(session, 'pre-01');
      expect(availability(session, catalog, 'syn-02')).toBe('locked');
      session = solve(session, 'pre-02');
      const inputs = resolveInputs(session, catalog, 'syn-02');
      expect(inputs.orientation?.data).toEqual({
        observed: catalog.sites[siteId]!.observations.O2,
        direction,
      });
      session = solve(session, 'syn-02');
      expect(integrity(session, catalog)).toBe(70);
      expect(availability(session, catalog, 'fut-01')).toBe('available');
      expect(availability(session, catalog, 'fut-02')).toBe('locked');
      const key = inventory(session, catalog).find((item) => item.rewardId === 'syn-02:key');
      expect(key?.data).toEqual({ word: 'CAPSULE' });
      const orientation = inventory(session, catalog).find(
        (item) => item.rewardId === 'pre-02:orientation',
      );
      expect(orientation?.data.direction).toBe(direction);
      expect(dispatch(session, catalog, { type: 'submit', levelId: 'syn-02' }).session).toBe(
        session,
      );
      expect(restoreSession(JSON.parse(JSON.stringify(session)), catalog)).toEqual(session);
    });

  it('PRE-01 exige les domaines avant le circuit et conserve la première étape', () => {
    let session = throughActOne('demo');
    const [domains, circuit] = acceptance('pre-01').answers as [Answer, Answer];
    const swapped = submit(session, 'pre-01', { ...domains, model: 'software', verify: 'maths' });
    expect(swapped.evaluation?.status).toBe('partial');
    expect(swapped.evaluation?.messages.join(' ')).toContain('action principale du module');
    expect(swapped.session.progress['pre-01']?.step).toBe(0);
    session = submit(session, 'pre-01', domains).session;
    const bypass = submit(session, 'pre-01', {
      ...circuit,
      'link-need': 'model',
      'link-model': 'interact',
      'link-verify': '',
    });
    expect(bypass.evaluation?.messages.join(' ')).toContain('même type de donnée');
    const short = submit(session, 'pre-01', { ...circuit, 'link-interact': 'demo' });
    expect(short.evaluation?.status).not.toBe('correct');
    expect(short.session.progress['pre-01']?.status).toBe('started');
    const restored = restoreSession(JSON.parse(JSON.stringify(short.session)), catalog);
    expect(restored.progress['pre-01']?.step).toBe(1);
  });

  it('PRE-02 garde les réponses justes et refuse un relevé ou une parité faux', () => {
    const session = solve(throughActOne('demo'), 'pre-01');
    const [nominal] = acceptance('pre-02').answers as [Answer];
    const observation = submit(session, 'pre-02', { ...nominal, observation: '5' });
    expect(observation.evaluation?.status).toBe('partial');
    expect(observation.evaluation?.messages).toHaveLength(1);
    expect(observation.evaluation?.messages[0]).toContain('repère exact');
    expect(observation.session.progress['pre-02']?.drafts.eyes?.robot).toBe('origine');
    const parity = submit(session, 'pre-02', { ...nominal, parity: 'odd', reading: 'reverse' });
    expect(parity.evaluation?.messages.join(' ')).toContain('deux parts entières');
    const invitation = submit(session, 'pre-02', { ...nominal, robot: 'realitiie' });
    expect(invitation.evaluation?.messages.join(' ')).toContain('activité décrite');
    const odd = createSession(catalog, catalog.sites['demo-odd']!, 'odd');
    expect(odd.siteId).toBe('demo-odd');
  });

  it('SYN-02 refuse le mot final sans les huit mots et l’ordre inversé', () => {
    let session = solve(solve(throughActOne('demo'), 'pre-01'), 'pre-02');
    const [nominal] = acceptance('syn-02').answers as [Answer];
    const segments = nominal.segments as string[];
    const early = submit(session, 'syn-02', { segments: segments.slice(0, 3), message: 'CAPSULE' });
    expect(early.evaluation?.messages.join(' ')).toContain('après les huit mots');
    const near = submit(session, 'syn-02', { segments, message: 'ELUSPAC' });
    expect(near.evaluation?.messages.join(' ')).toContain('repère pair');
    const diagonal = submit(session, 'syn-02', {
      segments: [...segments, '1,2-2,3'],
      message: 'CAPSULE',
    });
    expect(diagonal.evaluation?.messages.join(' ')).toContain('diagonales');
    session = early.session;
    expect(
      restoreSession(JSON.parse(JSON.stringify(session)), catalog).progress['syn-02']?.drafts.wall,
    ).toEqual({ segments: segments.slice(0, 3), message: 'CAPSULE' });
  });

  it('l’aide complète débloque SYN-02 sans points supplémentaires ni double récompense', () => {
    let session = solve(throughActOne('demo'), 'pre-01');
    for (let i = 0; i < 3; i++)
      session = dispatch(session, catalog, { type: 'hint', levelId: 'pre-02' }).session;
    session = dispatch(session, catalog, {
      type: 'assist',
      levelId: 'pre-02',
      confirmed: true,
    }).session;
    expect(session.progress['pre-02']?.status).toBe('assisted');
    expect(availability(session, catalog, 'syn-02')).toBe('available');
    expect(integrity(session, catalog)).toBe(60);
    const rewards = inventory(session, catalog).map((item) => item.rewardId);
    expect(new Set(rewards).size).toBe(rewards.length);
    expect(restoreSession(JSON.parse(JSON.stringify(session)), catalog)).toEqual(session);
  });
});
