// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { LevelView } from '../../src/presentation/components/LevelView';
import {
  EditorialProvider,
  parsePresentationCatalog,
} from '../../src/presentation/components/EditorialCopy';
import { DocumentCard, MissionCard } from '../../src/presentation/components/Cards';
import { advance, initialProgress } from '../../src/core/session/engine';
import { levelSchema, siteSchema, type Evaluation } from '../../src/core/contracts';
import rawLevel from '../../game/levels/pas-03/level.json';
import rawCopy from '../../game/levels/pas-03/presentation.json';
import rawSite from '../../game/sites/demo/site.json';
import rawPrologue from '../../game/levels/pro-00/level.json';
import { App } from '../../src/app/App';
const level = levelSchema.parse(rawLevel);
const site = siteSchema.parse(rawSite);
const copies = parsePresentationCatalog({ 'game/levels/pas-03/presentation.json': rawCopy });
afterEach(cleanup);
function Example() {
  const [progress, setProgress] = useState(() => initialProgress(level));
  const [evaluation, setEvaluation] = useState<Evaluation>();
  return (
    <EditorialProvider copies={copies} team="Équipe Chrono">
      <LevelView
        level={level}
        progress={progress}
        evaluation={evaluation}
        context={{ inputs: {}, site }}
        sources={{}}
        onCommand={(command) => {
          const result = advance(level, progress, command, { inputs: {}, site });
          setProgress(result.progress);
          setEvaluation(result.evaluation);
        }}
      />
    </EditorialProvider>
  );
}
it('place le focus sur le titre à l’ouverture, sans le voler pendant une saisie', async () => {
  const user = userEvent.setup();
  render(<Example />);
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: level.title }));
  const input = screen.getByLabelText('Date d’entrée en vigueur');
  await user.type(input, '05/07/2006');
  expect(document.activeElement).toBe(input);
  await user.click(screen.getByRole('button', { name: 'Vérifier' }));
  expect(
    screen.getByText('C’est la date du décret. Cherchez le début de son application.'),
  ).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'Dossier restauré' })).toBeNull();
});
it('les lettres du tutoriel sont encadrées sans interprétation HTML', async () => {
  const user = userEvent.setup();
  const prologue = levelSchema.parse(rawPrologue);
  render(<DocumentCard document={prologue.documents[0]!} sources={{}} />);
  await user.click(screen.getByText('Signal fragmenté'));
  expect(
    screen
      .getAllByLabelText(/Lettre encadrée/)
      .map((element) => element.textContent)
      .join(''),
  ).toBe('ENSIIE');
});
it('une carte de dossier verrouillé expose son état et une action désactivée', () => {
  render(
    <MissionCard
      level={level}
      status="locked"
      requirements={['pro-00']}
      blocked={false}
      onOpen={() => {
        throw new Error('locked');
      }}
    />,
  );
  expect(
    (screen.getByRole('button', { name: 'Ouvrir le dossier' }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect(screen.getByText('Prérequis : PRO-00')).toBeTruthy();
});
it('rend le focus à la carte de campagne quand on referme son dossier', async () => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Commencer l’enquête' }));
  await user.click(screen.getByRole('button', { name: 'Recevoir le signal' }));
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Le Signal' }));
  await user.click(screen.getByRole('button', { name: 'Retour à l’acte' }));
  expect(document.activeElement).toBe(document.getElementById('open-pro-00'));
  await user.click(document.getElementById('open-pro-00')!);
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Le Signal' }));
  await user.click(screen.getByRole('button', { name: 'Retour à l’acte' }));
  expect(document.activeElement).toBe(document.getElementById('open-pro-00'));
  window.localStorage.clear();
});
