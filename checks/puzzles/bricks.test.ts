import { describe, expect, it } from 'vitest';
import { catalog } from '../../scripts/load-content';
import { validateCatalog, validateFixture } from '../../src/core/content/catalog';
import { materialize } from '../../src/core/content/derive';
import {
  levelSchema,
  outputSchema,
  type Inputs,
  type Mechanic,
  type Site,
} from '../../src/core/contracts';
import { evaluate } from '../../src/core/validation/mechanics';
import { wordGridLayout } from '../../src/core/validation/wordgrid';

const demo = catalog.sites.demo!;
const odd: Site = { ...demo, id: 'odd', observations: { O1: 5, O2: 3 } };
const context = (inputs: Inputs = {}, site = demo) => ({ inputs, site });

const circuit: Extract<Mechanic, { kind: 'circuit' }> = {
  kind: 'circuit',
  source: { id: 'need', label: 'Besoin', type: 'BESOIN' },
  target: { id: 'demo', label: 'Démonstration', type: 'DEMO FLUIDE' },
  modules: [
    { id: 'accelerate', label: 'Accélérer', input: 'SCENE', output: 'DEMO FLUIDE' },
    { id: 'model', label: 'Modéliser', input: 'BESOIN', output: 'MODELE' },
    { id: 'interact', label: 'Faire interagir', input: 'MODELE VALIDE', output: 'SCENE' },
    { id: 'verify', label: 'Vérifier', input: 'MODELE', output: 'MODELE VALIDE' },
  ],
  expected: ['model', 'verify', 'interact', 'accelerate'],
  feedback: { link: 'LINK', incomplete: 'INCOMPLETE' },
};
const nominal = {
  'link-need': 'model',
  'link-model': 'verify',
  'link-verify': 'interact',
  'link-interact': 'accelerate',
  'link-accelerate': 'demo',
};

describe('ConnectionBoard', () => {
  it('accepte la chaîne typée et trace l’impulsion', () => {
    const result = evaluate(circuit, nominal, context());
    expect(result.status).toBe('correct');
    expect(result.trace).toEqual([
      'BESOIN',
      'Modéliser',
      'Vérifier',
      'Faire interagir',
      'Accélérer',
      'DEMO FLUIDE',
    ]);
  });
  it('refuse le contournement de la vérification par incompatibilité de type', () => {
    const result = evaluate(
      circuit,
      { ...nominal, 'link-model': 'interact', 'link-verify': '' },
      context(),
    );
    expect(result.status).toBe('partial');
    expect(result.messages).toContain('LINK');
  });
  it('signale un circuit incomplet, un cycle et une entrée doublée', () => {
    const incomplete = evaluate(circuit, { ...nominal, 'link-accelerate': '' }, context());
    expect(incomplete).toMatchObject({ status: 'partial', messages: ['INCOMPLETE'] });
    const cycle = evaluate(circuit, { ...nominal, 'link-accelerate': 'model' }, context());
    expect(cycle.status).not.toBe('correct');
    const doubled = evaluate(circuit, { ...nominal, 'link-accelerate': 'accelerate' }, context());
    expect(doubled.status).toBe('format');
    const twice = evaluate(circuit, { 'link-need': 'model', 'link-verify': 'model' }, context());
    expect(twice.messages.join(' ')).toContain('une seule liaison');
  });
  it('demande au moins une liaison et refuse une destination inconnue', () => {
    expect(evaluate(circuit, {}, context()).status).toBe('format');
    expect(evaluate(circuit, { 'link-need': 'nowhere' }, context()).status).toBe('format');
  });
  it('diagnostique une chaîne attendue mal typée ou incomplète', () => {
    const edited = structuredClone(catalog);
    edited.levels['pro-00']!.steps[0]!.mechanic = {
      ...circuit,
      expected: ['verify', 'model', 'interact', 'accelerate'],
    };
    expect(validateCatalog(edited).join(' ')).toContain('mal typée');
    edited.levels['pro-00']!.steps[0]!.mechanic = { ...circuit, expected: ['model'] };
    expect(validateCatalog(edited).join(' ')).toContain('chaîne attendue invalide');
  });
});

const rows = [
  '.LLOGICIEL',
  '.U..C....A',
  '.C.EUQISUM',
  '.LP..JEUXS',
  '.A.ELEDOM.',
  '.C.U......',
  'ROBOTIQUEL',
  'VIRTUELE..',
  '.INTERFACE',
];
const wordInputs = (direction: 'forward' | 'reverse', observed = 4): Inputs => ({
  lexicon: {
    id: 'lexicon',
    type: 'LexiqueTechnique',
    data: { words: ['MODELE', 'LOGICIEL', 'INTERFACE', 'CALCUL'] },
    summary: 'Quatre mots.',
  },
  life: {
    id: 'life',
    type: 'VieEtudiante',
    data: { words: ['MUSIQUE', 'JEUX', 'ROBOTIQUE', 'VIRTUEL'] },
    summary: 'Quatre activités.',
  },
  orientation: {
    id: 'orientation',
    type: 'OrientationLecture',
    data: { observed, direction },
    summary: 'Sens de lecture.',
  },
});
const grid: Extract<Mechanic, { kind: 'wordgrid' }> = {
  kind: 'wordgrid',
  rows,
  words: [
    { input: 'lexicon', path: 'words' },
    { input: 'life', path: 'words' },
  ],
  orientation: { input: 'orientation', path: 'direction' },
  message: 'CAPSULE',
  feedback: {
    select: 'SELECT',
    missing: 'MISSING',
    near: { forward: 'NEAR-EVEN', reverse: 'NEAR-ODD' },
    error: 'ERROR',
  },
};
const segments = [
  '5,9-5,4',
  '1,3-1,10',
  '9,2-9,10',
  '6,2-1,2',
  '3,10-3,4',
  '7,1-7,9',
  '4,6-4,9',
  '8,1-8,7',
];

describe('WordGrid', () => {
  it('retrouve les huit mots et produit CAPSULE dans les deux orientations', () => {
    for (const direction of ['forward', 'reverse'] as const) {
      const inputs = wordInputs(direction);
      const result = evaluate(grid, { segments, message: 'capsule' }, context(inputs));
      expect(result.status).toBe('correct');
      const layout = wordGridLayout(grid, inputs);
      const read = layout.residue.map(([r, c]) => layout.grid[r]![c]).join('');
      expect(direction === 'forward' ? read : [...read].reverse().join('')).toBe('CAPSULE');
    }
  });
  it('place E, L, U, S, P, A, C dans les positions normales pour un O2 impair', () => {
    const layout = wordGridLayout(grid, wordInputs('reverse', 3));
    expect(layout.residue.map(([r, c]) => layout.grid[r]![c]).join('')).toBe('ELUSPAC');
    expect(layout.residue).toEqual([
      [1, 4],
      [1, 9],
      [3, 2],
      [3, 9],
      [5, 3],
      [6, 9],
      [7, 7],
    ]);
  });
  it('accepte une sélection dans les deux sens', () => {
    const flipped = segments.map((segment) => segment.split('-').reverse().join('-'));
    expect(
      evaluate(grid, { segments: flipped, message: 'CAPSULE' }, context(wordInputs('forward')))
        .status,
    ).toBe('correct');
  });
  it('refuse diagonale, segment partiel, doublon, chevauchement et case vide', () => {
    const inputs = wordInputs('forward');
    for (const bad of ['1,1-2,2', '5,9-5,5', '1,3-1,10', '1,2-1,10', '1,1-1,3', '9,9-9,9'])
      expect(
        evaluate(grid, { segments: [...segments, bad], message: 'CAPSULE' }, context(inputs)),
      ).toMatchObject({ status: 'partial', messages: ['SELECT'] });
    expect(evaluate(grid, { segments: ['x'], message: 'CAPSULE' }, context(inputs)).status).toBe(
      'incorrect',
    );
  });
  it('exige les huit mots avant le message et distingue l’inversion', () => {
    const inputs = wordInputs('forward');
    expect(
      evaluate(grid, { segments: segments.slice(1), message: 'CAPSULE' }, context(inputs)),
    ).toMatchObject({ status: 'partial', messages: ['MISSING'] });
    expect(evaluate(grid, {}, context(inputs)).status).toBe('format');
    expect(evaluate(grid, { segments, message: 'ELUSPAC' }, context(inputs)).messages).toEqual([
      'NEAR-EVEN',
    ]);
    expect(
      evaluate(grid, { segments, message: 'ELUSPAC' }, context(wordInputs('reverse'))).messages,
    ).toEqual(['NEAR-ODD']);
    expect(evaluate(grid, { segments, message: 'CAPSUL' }, context(inputs))).toMatchObject({
      status: 'partial',
      messages: ['ERROR'],
    });
  });
  it('refuse une grille ambiguë, un message incohérent ou une entrée absente', () => {
    expect(() => wordGridLayout({ ...grid, message: 'CAPSULA' }, wordInputs('forward'))).toThrow(
      'message',
    );
    expect(() =>
      wordGridLayout({ ...grid, words: [...grid.words, 'EL'] }, wordInputs('forward')),
    ).toThrow('emplacements');
    expect(() => wordGridLayout(grid, {})).toThrow('lexicon');
  });
});

describe('Sorties dérivées et parité', () => {
  const output = outputSchema.parse({
    id: 'orientation',
    type: 'OrientationLecture',
    data: { observed: 4, direction: 'forward' },
    summary: 'Réservation DEMO.',
    derive: { rule: 'orientation-parity', observation: 'O2' },
  });
  it('dérive la valeur observée et le sens depuis le profil figé', () => {
    expect(materialize(output, demo).data).toEqual({ observed: 4, direction: 'forward' });
    expect(materialize(output, odd).data).toEqual({ observed: 3, direction: 'reverse' });
    expect(materialize(output, odd).summary).toContain('impair');
    expect('derive' in materialize(output, odd)).toBe(false);
  });
  it('refuse une règle incompatible avec le type ou une observation non déclarée', () => {
    const edited = structuredClone(catalog);
    edited.levels['pro-00']!.outputs.push({
      ...output,
      type: 'CleTransmission',
      data: { word: 'X' },
    });
    const errors = validateCatalog(edited).join(' ');
    expect(errors).toContain('incompatible');
    expect(errors).toContain('observation O2 non déclarée');
  });
  it('compare la parité à des options déclarées', () => {
    const mechanic: Mechanic = {
      kind: 'form',
      fields: [
        {
          id: 'parity',
          label: 'Parité',
          format: 'choice',
          options: [
            { id: 'even', label: 'Pair' },
            { id: 'odd', label: 'Impair' },
          ],
          expected: { parityOf: 'O2', even: 'even', odd: 'odd' },
          error: 'Parité',
        },
      ],
    };
    expect(evaluate(mechanic, { parity: 'even' }, context()).status).toBe('correct');
    expect(evaluate(mechanic, { parity: 'even' }, context({}, odd)).status).toBe('incorrect');
    expect(evaluate(mechanic, { parity: 'odd' }, context({}, odd)).status).toBe('correct');
  });
  it('applique les fixtures propres à un profil sans changer les autres', () => {
    const level = levelSchema.parse({
      ...catalog.levels['pro-00'],
      inputs: [{ id: 'orientation', type: 'OrientationLecture' }],
    });
    const fixture = {
      inputs: { orientation: wordInputs('forward').orientation },
      sites: { 'demo-odd': { orientation: wordInputs('reverse', 3).orientation } },
    };
    expect(validateFixture(level, fixture).orientation?.data.direction).toBe('forward');
    expect(validateFixture(level, fixture, 'demo-odd').orientation?.data.direction).toBe('reverse');
    expect(() =>
      validateFixture(level, {
        ...fixture,
        sites: { x: { orientation: wordInputs('forward').lexicon } },
      }),
    ).toThrow('incompatible');
  });
});
