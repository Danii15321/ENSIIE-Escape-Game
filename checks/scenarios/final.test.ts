import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { catalog, readJson } from '../../scripts/load-content';
import { validateCatalog, validateFixture, type Catalog } from '../../src/core/content/catalog';
import { answerSchema, levelSchema, type Answer, type Level } from '../../src/core/contracts';
import {
  availability,
  choicesFrozen,
  createSession,
  dispatch,
  ending,
  integrity,
  outcome,
  restoreSession,
  type Session,
} from '../../src/core/session/engine';
import { evaluate } from '../../src/core/validation/mechanics';

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
const order = ['pro-00', 'pas-01', 'pas-02', 'pas-03', 'syn-01', 'pre-01', 'pre-02', 'syn-02'];
function submit(game: Catalog, session: Session, levelId: string, answer: Answer) {
  session = dispatch(session, game, { type: 'draft', levelId, answer }).session;
  return dispatch(session, game, { type: 'submit', levelId });
}
function solve(game: Catalog, session: Session, id: string) {
  for (const answer of answersFor(id, session.siteId)) {
    const result = submit(game, session, id, answer);
    expect(result.evaluation?.status, `${id} ${session.siteId}`).toBe('correct');
    session = result.session;
  }
  return session;
}
const playUntil = (game: Catalog, ids: string[], siteId = 'demo') =>
  ids.reduce(
    (session, id) => solve(game, session, id),
    createSession(game, game.sites[siteId]!, 'final'),
  );

const council: Level = levelSchema.parse({
  ...catalog.levels['fut-c'],
  status: 'prototype',
  revision: 2,
  inputs: [],
  outputs: [],
  hints: [],
  solution: '',
  steps: [],
  narrative: {
    speaker: 'Nora',
    done: 'Vos engagements sont enregistrés.',
    questions: ['c1', 'c2', 'c3'].map((id) => ({
      id,
      prompt: `Question ${id}`,
      options: ['lucidite', 'sobriete', 'partage'].map((theme) => ({
        id: theme,
        label: `${id} ${theme}`,
        theme,
        reply: `Réponse ${id} ${theme}`,
        commitment: `Engagement ${id} ${theme}`,
      })),
    })),
  },
});
function withCouncil(): Catalog {
  const game = structuredClone(catalog);
  game.levels['fut-c'] = council;
  expect(validateCatalog(game)).toEqual([]);
  return game;
}
const choose = (game: Catalog, session: Session, questionId: string, optionId: string | null) =>
  dispatch(session, game, { type: 'choose', levelId: 'fut-c', questionId, optionId });

describe('SYN-03 et campagne complète', () => {
  for (const siteId of ['demo', 'demo-odd'])
    it(`${siteId} : la campagne atteint 100 points et fige l’issue`, () => {
      let session = playUntil(catalog, [...order, 'fut-02', 'fut-01'], siteId);
      expect(availability(session, catalog, 'syn-03')).toBe('available');
      expect(ending(session, catalog)).toBeNull();
      session = solve(catalog, session, 'syn-03');
      expect(integrity(session, catalog)).toBe(100);
      expect(choicesFrozen(session, catalog)).toBe(true);
      expect(ending(session, catalog)).toEqual({ theme: null, commitments: [] });
      expect(restoreSession(JSON.parse(JSON.stringify(session)), catalog)).toEqual(session);
    });

  it('n’ouvre pas le cadran sans les cinq preuves et garde les affirmations justifiées', () => {
    let session = playUntil(catalog, [...order, 'fut-01', 'fut-02']);
    const [claims] = acceptance('syn-03').answers as [Answer];
    const early = submit(catalog, session, 'syn-03', { year: '2068' });
    expect(early.evaluation?.status).toBe('format');
    expect(early.session.progress['syn-03']?.step).toBe(0);
    const wrong = submit(catalog, session, 'syn-03', {
      ...claims,
      'decision-evry': 'correct',
      'proofs-decree': ['publication'],
    });
    expect(wrong.evaluation?.status).toBe('partial');
    expect(wrong.evaluation?.messages).toEqual([
      expect.stringContaining('passage au nom ENSIIE intervient en 2006'),
      expect.stringContaining('La notice Lieux permet de trancher'),
      expect.stringContaining('sélectionnez la preuve'),
      expect.stringContaining('modélisation'),
      expect.stringContaining('8, 4 et 9'),
    ]);
    session = submit(catalog, wrong.session, 'syn-03', claims).session;
    expect(session.progress['syn-03']?.step).toBe(1);
    const trap = submit(catalog, session, 'syn-03', { year: '2106' });
    expect(trap.evaluation?.messages[0]).toContain('cent ans à 2006');
    const generic = submit(catalog, session, 'syn-03', { year: '2006' });
    expect(generic.evaluation?.messages[0]).toContain('année d’origine');
    expect(generic.session.progress['syn-03']?.status).toBe('started');
  });

  it('refuse une preuve en trop, un doublon et une décision absente', () => {
    const level = catalog.levels['syn-03']!;
    const context = {
      inputs: validateFixture(level, readJson('game/levels/syn-03/fixtures.json')),
      site: catalog.sites.demo!,
    };
    const mechanic = level.steps[0]!.mechanic;
    const [claims] = acceptance('syn-03').answers as [Answer];
    const extra = { ...claims, 'proofs-bcf': ['bcf'], 'proofs-simulation': ['bcf', 'route'] };
    expect(evaluate(mechanic, extra, context).messages[4]).toContain('sélectionnez la preuve');
    const doubled = { ...claims, 'proofs-evry': ['chronology', 'chronology'] };
    expect(evaluate(mechanic, doubled, context).status).toBe('partial');
    const missing = { ...claims, 'decision-name': '' };
    expect(evaluate(mechanic, missing, context).messages[0]).toContain('choisissez une décision');
    expect(evaluate(mechanic, {}, context).status).toBe('format');
    expect(() => evaluate(mechanic, claims, { ...context, inputs: {} })).toThrow('absente');
    const broken = structuredClone(context.inputs);
    broken.transition!.data.evidence = ['Publication'];
    expect(() => evaluate(mechanic, claims, { ...context, inputs: broken })).toThrow('Règle');
  });

  it('diagnostique preuves inconnues, décisions absentes et pièges égaux à la réponse', () => {
    const game = structuredClone(catalog);
    const [claimsStep, dialStep] = game.levels['syn-03']!.steps;
    if (claimsStep!.mechanic.kind === 'evidence') {
      claimsStep!.mechanic.claims[0]!.proofs.push('nowhere');
      claimsStep!.mechanic.claims[1]!.decision = 'maybe';
      claimsStep!.mechanic.proofs[0]!.source.input = 'ghost';
    }
    if (dialStep!.mechanic.kind === 'form') dialStep!.mechanic.fields[0]!.traps[0]!.value = '2068';
    const errors = validateCatalog(game).join(' ');
    expect(errors).toContain('preuve attendue absente');
    expect(errors).toContain('décision attendue absente');
    expect(errors).toContain('entrée ghost non déclarée');
    expect(errors).toContain('piège identique');
  });
});

describe('Choix narratifs remplaçables', () => {
  it('interdit un Conseil prérequis, payant ou final', () => {
    const game = withCouncil();
    game.campaign.levels.find((entry) => entry.id === 'syn-03')!.requires.push('fut-c');
    game.campaign.levels.find((entry) => entry.id === 'fut-c')!.points = 10;
    game.campaign.finalLevel = 'fut-c';
    const errors = validateCatalog(game).join(' ');
    expect(errors).toContain('ne peut pas être un prérequis');
    expect(errors).toContain('ne donne aucun point');
    expect(errors).toContain('ne peut pas être le final');
  });

  it('refuse les niveaux mixtes et les puzzles incomplets', () => {
    expect(
      levelSchema.safeParse({ ...council, steps: catalog.levels['pro-00']!.steps }).success,
    ).toBe(false);
    expect(levelSchema.safeParse({ ...catalog.levels['pro-00'], hints: [] }).success).toBe(false);
    expect(levelSchema.safeParse({ ...catalog.levels['pro-00'], steps: [] }).success).toBe(false);
  });

  it('remplace une réponse, la retire, refuse les choix inconnus et toute validation', () => {
    const game = withCouncil();
    let session = playUntil(game, order);
    expect(availability(session, game, 'fut-c')).toBe('available');
    session = choose(game, session, 'c1', 'partage').session;
    session = choose(game, session, 'c1', 'lucidite').session;
    expect(session.progress['fut-c']?.choices).toEqual({ c1: 'lucidite' });
    const unknown = choose(game, session, 'c1', 'invented');
    expect(unknown.session).toBe(session);
    expect(unknown.message).toContain('pas proposé');
    expect(choose(game, session, 'c9', 'partage').session).toBe(session);
    const submit = dispatch(session, game, { type: 'submit', levelId: 'fut-c' });
    expect(submit.session).toBe(session);
    expect(dispatch(session, game, { type: 'hint', levelId: 'fut-c' }).session).toBe(session);
    session = choose(game, session, 'c1', null).session;
    expect(session.progress['fut-c']?.choices).toEqual({});
    expect(integrity(session, game)).toBe(70);
    expect(restoreSession(JSON.parse(JSON.stringify(session)), game)).toEqual(session);
  });

  it('refuse un choix sur un puzzle et une sauvegarde aux choix falsifiés', () => {
    const game = withCouncil();
    let session = playUntil(game, order);
    expect(
      dispatch(session, game, {
        type: 'choose',
        levelId: 'pre-01',
        questionId: 'c1',
        optionId: 'partage',
      }).message,
    ).toBeDefined();
    session = choose(game, session, 'c2', 'sobriete').session;
    const forged = structuredClone(session);
    forged.progress['fut-c']!.choices.c2 = 'invented';
    expect(() => restoreSession(forged, game)).toThrow('Choix narratif incohérent');
    const onPuzzle = structuredClone(session);
    onPuzzle.progress['pre-01']!.choices = { c1: 'partage' };
    expect(() => restoreSession(onPuzzle, game)).toThrow('Choix inattendu');
  });

  it('fige les choix à l’ouverture de la capsule et calcule l’issue', () => {
    const game = withCouncil();
    let session = playUntil(game, [...order, 'fut-01', 'fut-02']);
    session = choose(game, session, 'c1', 'partage').session;
    session = choose(game, session, 'c3', 'partage').session;
    session = choose(game, session, 'c2', 'sobriete').session;
    expect(ending(session, game)).toBeNull();
    session = solve(game, session, 'syn-03');
    const frozen = choose(game, session, 'c2', 'partage');
    expect(frozen.session).toBe(session);
    expect(frozen.message).toContain('figés');
    expect(ending(session, game)).toEqual({
      theme: 'partage',
      commitments: ['Engagement c1 partage', 'Engagement c2 sobriete', 'Engagement c3 partage'],
    });
    expect(integrity(session, game)).toBe(100);
  });

  it('calcule majorité, égalité, absence et réponses partielles sans accumulation', () => {
    const levels = [council];
    expect(outcome(levels, {})).toEqual({ theme: null, commitments: [] });
    expect(outcome(levels, { 'fut-c': { c2: 'sobriete' } })).toEqual({
      theme: 'sobriete',
      commitments: ['Engagement c2 sobriete'],
    });
    expect(outcome(levels, { 'fut-c': { c1: 'lucidite', c3: 'partage' } }).theme).toBeNull();
    expect(
      outcome(levels, { 'fut-c': { c1: 'lucidite', c2: 'sobriete', c3: 'partage' } }).theme,
    ).toBeNull();
    expect(
      outcome(levels, { 'fut-c': { c1: 'lucidite', c2: 'lucidite', c3: 'partage' } }).theme,
    ).toBe('lucidite');
    expect(outcome(levels, { 'fut-c': { c1: 'ghost' } })).toEqual({
      theme: null,
      commitments: [],
    });
  });
});
