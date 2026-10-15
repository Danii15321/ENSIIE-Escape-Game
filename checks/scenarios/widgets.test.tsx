// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import rawLevel from '../../game/levels/pro-00/level.json';
import rawSite from '../../game/sites/demo/site.json';
import { initialProgress, advance } from '../../src/core/session/engine';
import { LevelView } from '../../src/presentation/components/LevelView';
import { levelSchema, siteSchema, type Evaluation } from '../../src/core/contracts';

afterEach(cleanup);
function Example() {
  const level = levelSchema.parse(rawLevel);
  const [progress, setProgress] = useState(() => initialProgress(level));
  const [evaluation, setEvaluation] = useState<Evaluation>();
  const context = { inputs: {}, site: siteSchema.parse(rawSite) };
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
it('le prologue accepte une saisie par son label, annonce l’erreur puis la réussite', async () => {
  const user = userEvent.setup();
  render(<Example />);
  const input = screen.getByLabelText('Les six lettres');
  await user.type(input, 'faux');
  await user.click(screen.getByRole('button', { name: 'Vérifier' }));
  expect(screen.getByText('À vérifier')).toBeTruthy();
  await user.clear(input);
  await user.type(input, 'ensiie');
  await user.click(screen.getByRole('button', { name: 'Vérifier' }));
  expect(screen.getByRole('heading', { name: 'Dossier restauré' })).toBeTruthy();
});
it('l’assistance demande les trois indices puis la lecture et la confirmation', async () => {
  const user = userEvent.setup();
  render(<Example />);
  expect(screen.queryByRole('dialog')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Indice suivant' }));
  const sheet = screen.getByRole('dialog', { name: 'Indices' });
  expect(within(sheet).getByText(/noté dans le bilan, sans pénalité/)).toBeTruthy();
  expect(within(sheet).queryByRole('button', { name: 'Voir la démarche' })).toBeNull();
  for (let index = 1; index <= 3; index++)
    await user.click(within(sheet).getByRole('button', { name: `Révéler l’indice ${index}/3` }));
  expect(within(sheet).getAllByText(/^Indice \d$/)).toHaveLength(3);
  await user.click(within(sheet).getByRole('button', { name: 'Voir la démarche' }));
  expect(within(sheet).getByText(/Prenez le temps de relire la preuve/)).toBeTruthy();
  await user.click(within(sheet).getByRole('button', { name: 'J’ai compris, continuer' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Dossier restauré avec aide' })).toBeTruthy();
});
it('les indices se referment sans être consommés et rendent le focus', async () => {
  const user = userEvent.setup();
  render(<Example />);
  const opener = screen.getByRole('button', { name: 'Indice suivant' });
  await user.click(opener);
  await user.click(screen.getByRole('button', { name: 'Continuer sans indice' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener);
  await user.click(opener);
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByText('0/3')).toBeTruthy();
});
