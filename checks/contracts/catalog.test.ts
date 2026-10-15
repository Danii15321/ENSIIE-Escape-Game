import { describe, expect, it } from 'vitest';
import { catalog } from '../../scripts/load-content';
import { validateCatalog, validateFixture } from '../../src/core/content/catalog';
import { fragmentSchema, levelSchema } from '../../src/core/contracts';
import { localStorageAdapter } from '../../src/adapters/storage/local';

describe('Diagnostics de contenu', () => {
  it('refuse une entrée de synthèse absente ou de type incompatible', () => {
    const edited = structuredClone(catalog);
    edited.campaign.levels.find((level) => level.id === 'syn-01')!.bindings.origin = {
      level: 'pas-02',
      output: 'name',
    };
    expect(validateCatalog(edited).some((message) => message.includes('incompatible'))).toBe(true);
    expect(() => validateFixture(catalog.levels['syn-01']!, { inputs: {} })).toThrow('origin');
  });
  it('signale cycles, documents absents et nœuds sans destination', () => {
    const edited = structuredClone(catalog);
    edited.campaign.levels[0]!.requires = ['syn-01'];
    edited.levels['pro-00']!.steps[0]!.documentIds.push('missing');
    edited.levels['pro-00']!.dialogue.nodes[0]!.choices[0]!.to = 'missing';
    expect(validateCatalog(edited).join(' ')).toMatch(/cycle/);
    expect(validateCatalog(edited).join(' ')).toMatch(/document missing absent/);
    expect(validateCatalog(edited).join(' ')).toMatch(/destination missing absente/);
  });
  it('refuse une grille hors limites, un paquet incomplet ou un fragment mal typé', () => {
    const edited = structuredClone(catalog);
    const mechanic = edited.levels['fut-02']!.steps[0]!.mechanic;
    if (mechanic.kind === 'program') mechanic.start = [99, 99];
    expect(validateCatalog(edited).join(' ')).toContain('case hors grille');
    expect(levelSchema.safeParse({ id: 'empty' }).success).toBe(false);
    expect(
      fragmentSchema.safeParse({
        id: 'origin',
        type: 'OrigineHistorique',
        data: { year: '1968' },
        summary: 'test',
      }).success,
    ).toBe(false);
  });
  it('la panne du stockage reste explicite pour le contrôleur', () => {
    const storage = localStorageAdapter({
      getItem() {
        throw new Error('denied');
      },
      setItem() {
        throw new Error('full');
      },
    });
    expect(() => storage.read()).toThrow('denied');
  });
});
