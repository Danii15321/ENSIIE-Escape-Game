// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import pre01 from '../../game/levels/pre-01/level.json';
import pre01Fixtures from '../../game/levels/pre-01/fixtures.json';
import syn02 from '../../game/levels/syn-02/level.json';
import syn02Fixtures from '../../game/levels/syn-02/fixtures.json';
import demo from '../../game/sites/demo/site.json';
import demoOdd from '../../game/sites/demo-odd/site.json';
import { validateFixture } from '../../src/core/content/catalog';
import { advance, initialProgress, type Progress } from '../../src/core/session/engine';
import { LevelView } from '../../src/presentation/components/LevelView';
import { levelSchema, siteSchema, type Evaluation } from '../../src/core/contracts';

afterEach(cleanup);
const packages = {
  'pre-01': [levelSchema.parse(pre01), pre01Fixtures],
  'syn-02': [levelSchema.parse(syn02), syn02Fixtures],
} as const;
const sites = { demo: siteSchema.parse(demo), 'demo-odd': siteSchema.parse(demoOdd) };
function Play({
  levelId,
  siteId = 'demo',
}: {
  levelId: keyof typeof packages;
  siteId?: keyof typeof sites;
}) {
  const [level, fixtures] = packages[levelId];
  const [progress, setProgress] = useState<Progress>(() => ({
    ...initialProgress(level),
    dialogue: null,
  }));
  const [evaluation, setEvaluation] = useState<Evaluation>();
  const context = { inputs: validateFixture(level, fixtures, siteId), site: sites[siteId] };
  return (
    <LevelView
      level={level}
      progress={progress}
      context={context}
      evaluation={evaluation}
      sources={{}}
      onCommand={(command) => {
        const result = advance(level, progress, command, context);
        setProgress(result.progress);
        setEvaluation(result.evaluation);
      }}
    />
  );
}
const cell = (row: number, col: number) =>
  screen.getByRole('button', { name: new RegExp(`^ligne ${row}, colonne ${col} :`) });
const words: [number, number, number, number][] = [
  [5, 9, 5, 4],
  [1, 3, 1, 10],
  [9, 2, 9, 10],
  [6, 2, 1, 2],
  [3, 10, 3, 4],
  [7, 1, 7, 9],
  [4, 6, 4, 9],
  [8, 1, 8, 7],
];

for (const siteId of ['demo', 'demo-odd'] as const)
  it(`SYN-02 (${siteId}) se joue au clic, refuse une diagonale et révèle CAPSULE`, async () => {
    const user = userEvent.setup();
    render(<Play levelId="syn-02" siteId={siteId} />);
    await user.click(cell(1, 2));
    await user.click(cell(3, 4));
    expect(screen.getByRole('status').textContent).toContain('diagonales');
    for (const [r1, c1, r2, c2] of words) {
      await user.click(cell(r1, c1));
      await user.click(cell(r2, c2));
    }
    expect(screen.getByText(/VIRTUEL \(retiré\)/)).toBeTruthy();
    expect(cell(1, 3).getAttribute('aria-label')).toContain('barrée');
    const remaining = [
      [2, 5],
      [2, 10],
      [4, 3],
      [4, 10],
      [6, 4],
      [7, 10],
      [8, 8],
    ].map(([r, c]) => cell(r!, c!).textContent);
    const read = siteId === 'demo' ? remaining : [...remaining].reverse();
    expect(read.join('')).toBe('CAPSULE');
    await user.type(screen.getByLabelText('Message des cases restantes'), 'capsule');
    await user.click(screen.getByRole('button', { name: 'Vérifier cette étape' }));
    expect(screen.getByRole('heading', { name: 'Dossier restauré' })).toBeTruthy();
  });

it('SYN-02 permet de retirer un segment choisi', async () => {
  const user = userEvent.setup();
  render(<Play levelId="syn-02" />);
  await user.click(cell(4, 6));
  await user.click(cell(4, 9));
  const list = screen.getByRole('list', { name: 'Segments retenus' });
  expect(within(list).getByText(/JEUX/)).toBeTruthy();
  await user.click(within(list).getByRole('button', { name: 'Retirer' }));
  expect(screen.queryByRole('list', { name: 'Segments retenus' })).toBeNull();
  expect(screen.getByText(/JEUX \(à trouver\)/)).toBeTruthy();
});

it('PRE-01 enchaîne les domaines puis le circuit au clavier', async () => {
  const user = userEvent.setup();
  render(<Play levelId="pre-01" />);
  const domains: Record<string, string> = {
    'Faire interagir': 'Interactions numériques',
    Accélérer: 'Calcul intensif et données massives',
    Modéliser: 'Mathématiques appliquées',
    Vérifier: 'Ingénierie logicielle',
  };
  for (const [module, domain] of Object.entries(domains))
    await user.selectOptions(screen.getByLabelText(new RegExp(`^${module} :`)), domain);
  await user.click(screen.getByRole('button', { name: 'Vérifier cette étape' }));
  expect(screen.getByText('Étape 2/2')).toBeTruthy();
  const links: [string, string][] = [
    ['Besoin', 'Modéliser (entrée BESOIN)'],
    ['Modéliser', 'Faire interagir (entrée MODELE VALIDE)'],
  ];
  for (const [from, to] of links)
    await user.selectOptions(screen.getByLabelText(new RegExp(`« ${from} »`)), to);
  await user.click(screen.getByRole('button', { name: 'Vérifier cette étape' }));
  expect(screen.getByText(/même type de donnée/)).toBeTruthy();
  const fixed: [string, string][] = [
    ['Modéliser', 'Vérifier (entrée MODELE)'],
    ['Vérifier', 'Faire interagir (entrée MODELE VALIDE)'],
    ['Faire interagir', 'Accélérer (entrée SCENE)'],
    ['Accélérer', 'Démonstration (entrée DEMO FLUIDE)'],
  ];
  for (const [from, to] of fixed)
    await user.selectOptions(screen.getByLabelText(new RegExp(`« ${from} »`)), to);
  await user.click(screen.getByRole('button', { name: 'Vérifier cette étape' }));
  expect(screen.getByRole('heading', { name: 'Dossier restauré' })).toBeTruthy();
});
