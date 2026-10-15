import { describe, expect, it } from 'vitest';
import { catalog, readJson } from '../../scripts/load-content';
import { validateFixture } from '../../src/core/content/catalog';
import { answerSchema, type Answer, type Mechanic } from '../../src/core/contracts';
import { caesar, evaluate, normalizeDate } from '../../src/core/validation/mechanics';
import { z } from 'zod';

describe('Contrats exécutables de chaque prototype', () => {
  for (const level of Object.values(catalog.levels).filter((level) => level.status !== 'draft')) {
    it(`${level.id} : solution, erreur, fragments simulés`, () => {
      const context = {
        inputs: validateFixture(level, readJson(`game/levels/${level.id}/fixtures.json`)),
        site: catalog.sites.demo!,
      };
      const { answers } = z
        .object({ answers: z.array(answerSchema) })
        .parse(readJson(`game/levels/${level.id}/acceptance.json`));
      level.steps.forEach((step, index) => {
        expect(evaluate(step.mechanic, answers[index]!, context).status).toBe('correct');
        expect(evaluate(step.mechanic, {}, context).status).not.toBe('correct');
      });
    });
  }
});
describe('Propriétés des mécaniques', () => {
  it('garde une seule combinaison valide parmi les vingt groupes de projets', () => {
    const mechanic = catalog.levels['fut-01']!.steps[0]!.mechanic;
    const winners: string[] = [];
    const ids = ['A', 'B', 'C', 'D', 'E', 'F'];
    let count = 0;
    for (let a = 0; a < 4; a++)
      for (let b = a + 1; b < 5; b++)
        for (let c = b + 1; c < 6; c++) {
          const projects = [ids[a]!, ids[b]!, ids[c]!];
          count++;
          if (
            evaluate(mechanic, { projects }, { inputs: {}, site: catalog.sites.demo! }).status ===
            'correct'
          )
            winners.push(projects.join(''));
        }
    expect(count).toBe(20);
    expect(winners).toEqual(['BCF']);
    expect(
      evaluate(
        mechanic,
        { projects: ['B', 'B', 'C', 'F'] },
        { inputs: {}, site: catalog.sites.demo! },
      ).status,
    ).toBe('format');
  });
  it('accepte exactement une réparation parmi seize programmes', () => {
    const mechanic = catalog.levels['fut-02']!.steps[0]!.mechanic;
    const winners: string[] = [];
    for (const a of ['UP', 'DOWN', 'LEFT', 'RIGHT'])
      for (const b of ['UP', 'DOWN', 'LEFT', 'RIGHT']) {
        if (
          evaluate(
            mechanic,
            { 'command-1': a, 'command-3': b, message: 'OUVRE' },
            { inputs: {}, site: catalog.sites.demo! },
          ).status === 'correct'
        )
          winners.push(`${a}/${b}`);
      }
    expect(winners).toEqual(['UP/DOWN']);
    expect(
      evaluate(
        mechanic,
        { 'command-1': 'UP', 'command-3': 'DOWN', message: 'DOUVRE' },
        { inputs: {}, site: catalog.sites.demo! },
      ).status,
    ).toBe('partial');
  });
  it('recalcule le César et valide les relevés pour O1 de 1 à 9', () => {
    const plaintext = 'INSTITUT INFORMATIQUE ENTREPRISE';
    const mechanic = catalog.levels['pas-02']!.steps[0]!.mechanic;
    for (let shift = 1; shift <= 9; shift++) {
      expect(caesar(caesar(plaintext, shift), -shift)).toBe(plaintext);
      const answer: Answer = {
        observation: String(shift),
        shift: String(shift),
        direction: 'back',
        plaintext,
        acronym: 'IIE',
      };
      const site = { ...catalog.sites.demo!, observations: { O1: shift, O2: 4 } };
      expect(evaluate(mechanic, answer, { inputs: {}, site }).status).toBe('correct');
      expect(
        evaluate(mechanic, { ...answer, direction: 'forward' }, { inputs: {}, site }).status,
      ).not.toBe('correct');
    }
  });
  it('normalise les quatre formats de date sans accepter les jours impossibles', () => {
    for (const date of ['01082006', '01/08/2006', '1/8/2006', '2006-08-01'])
      expect(normalizeDate(date)).toBe('2006-08-01');
    for (const date of ['31/02/2006', '29/02/2006', '2006-13-01', '01082006x'])
      expect(normalizeDate(date)).toBeNull();
    expect(normalizeDate('29/02/2004')).toBe('2004-02-29');
  });
  it('réutilise un appariement sans référence à un niveau', () => {
    const mechanic: Mechanic = {
      kind: 'match',
      items: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      targets: [
        { id: 'one', label: 'Un' },
        { id: 'two', label: 'Deux' },
      ],
      expected: { a: 'one', b: 'two' },
    };
    expect(
      evaluate(mechanic, { a: 'one', b: 'two' }, { inputs: {}, site: catalog.sites.demo! }).status,
    ).toBe('correct');
    expect(
      evaluate(mechanic, { a: 'one', b: 'one' }, { inputs: {}, site: catalog.sites.demo! }).status,
    ).toBe('partial');
  });
});
