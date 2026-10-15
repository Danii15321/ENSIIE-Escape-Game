// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import syn03 from '../../game/levels/syn-03/level.json';
import syn03Fixtures from '../../game/levels/syn-03/fixtures.json';
import futC from '../../game/levels/fut-c/level.json';
import demo from '../../game/sites/demo/site.json';
import { validateFixture } from '../../src/core/content/catalog';
import { advance, initialProgress, type Progress } from '../../src/core/session/engine';
import { LevelView } from '../../src/presentation/components/LevelView';
import { levelSchema, siteSchema, type Evaluation, type Level } from '../../src/core/contracts';

afterEach(cleanup);
const site = siteSchema.parse(demo);
function Play({
  level,
  inputs = {},
  frozen = false,
}: {
  level: Level;
  inputs?: object;
  frozen?: boolean;
}) {
  const [progress, setProgress] = useState<Progress>(() => ({
    ...initialProgress(level),
    dialogue: null,
  }));
  const [evaluation, setEvaluation] = useState<Evaluation>();
  const [message, setMessage] = useState<string>();
  const context = { inputs: validateFixture(level, { inputs }), site };
  return (
    <LevelView
      level={level}
      progress={progress}
      context={context}
      evaluation={evaluation}
      message={message}
      sources={{}}
      frozen={frozen}
      onCommand={(command) => {
        const result = advance(level, progress, command, context, frozen);
        setProgress(result.progress);
        setEvaluation(result.evaluation);
        setMessage(result.message);
      }}
    />
  );
}

it('SYN-03 se résout au clavier : décisions, preuves, piège 2106 puis 2068', async () => {
  const user = userEvent.setup();
  render(<Play level={levelSchema.parse(syn03)} inputs={syn03Fixtures.inputs} />);
  const plan: [string, string[]][] = [
    ['Corriger', ['Frise des origines', 'Dossier du changement de nom']],
    ['Confirmer', ['Frise des origines']],
    ['Corriger', ['publication au Journal officiel', 'règle d’entrée en vigueur']],
    ['Corriger', ['Mots et fiches de l’atelier']],
    ['Confirmer', ['Calcul BCF']],
  ];
  for (const [index, [decision, proofs]] of plan.entries()) {
    const group = screen.getByRole('radiogroup', { name: `Décision ${index + 1}` });
    await user.click(within(group).getByLabelText(decision));
    const box = screen.getByRole('group', { name: `Preuves pour l’affirmation ${index + 1}` });
    for (const proof of proofs) await user.click(within(box).getByLabelText(new RegExp(proof)));
  }
  await user.click(screen.getByRole('button', { name: 'Vérifier cette étape' }));
  expect(screen.getByText('Étape 2/2')).toBeTruthy();
  const year = screen.getByLabelText('Année du centenaire');
  await user.type(year, '2106');
  await user.click(screen.getByRole('button', { name: 'Vérifier cette étape' }));
  expect(screen.getByText(/cent ans à 2006/)).toBeTruthy();
  await user.clear(year);
  await user.type(year, '2068');
  await user.click(screen.getByRole('button', { name: 'Vérifier cette étape' }));
  expect(screen.getByRole('heading', { name: 'Dossier restauré' })).toBeTruthy();
});

const council = levelSchema.parse({
  ...futC,
  status: 'prototype',
  inputs: [],
  outputs: [],
  hints: [],
  solution: '',
  steps: [],
  narrative: {
    speaker: 'Nora',
    done: 'Vos engagements sont enregistrés.',
    questions: [
      {
        id: 'c1',
        prompt: 'Que doit comprendre une personne ?',
        options: [
          { id: 'a', label: 'Les sources', theme: 'lucidite', reply: 'Réponse A', commitment: 'A' },
          {
            id: 'b',
            label: 'Les ressources',
            theme: 'sobriete',
            reply: 'Réponse B',
            commitment: 'B',
          },
        ],
      },
    ],
  },
});

it('le Conseil remplace une réponse, la retire et affiche la conclusion', async () => {
  const user = userEvent.setup();
  render(<Play level={council} />);
  expect(screen.queryByRole('button', { name: 'Vérifier cette étape' })).toBeNull();
  await user.click(screen.getByLabelText('Les sources'));
  expect(screen.getByText('Réponse A')).toBeTruthy();
  expect(screen.getByText('Vos engagements sont enregistrés.')).toBeTruthy();
  await user.click(screen.getByLabelText('Les ressources'));
  expect(screen.queryByText('Réponse A')).toBeNull();
  expect(screen.getByText('Réponse B')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Retirer ma réponse' }));
  expect(screen.queryByText('Réponse B')).toBeNull();
});

it('le Conseil figé reste lisible mais n’est plus modifiable', () => {
  render(<Play level={council} frozen />);
  expect(screen.getByText(/choix sont figés/)).toBeTruthy();
  expect((screen.getByLabelText('Les sources') as HTMLInputElement).disabled).toBe(true);
});
