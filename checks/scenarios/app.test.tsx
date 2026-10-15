// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/app/App';

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

it('la campagne présente l’acte II verrouillé puis ouvre SYN-02 dans l’atelier', async () => {
  const user = userEvent.setup();
  render(<App />);
  const campaign = screen.getByRole('region', { name: 'Dossiers de la campagne' });
  for (const title of ['L’atelier des compétences', 'Les yeux d’ARIIE', 'Le mur des mots']) {
    const card = within(campaign).getByRole('heading', { name: title }).closest('article')!;
    expect(within(card).getByText('Verrouillé')).toBeTruthy();
  }
  await user.click(screen.getByRole('button', { name: 'Atelier des niveaux' }));
  await user.selectOptions(screen.getByLabelText('Niveau'), 'syn-02');
  expect(screen.getByRole('button', { name: /^ligne 7, colonne 1 : R$/ })).toBeTruthy();
  await user.selectOptions(screen.getByLabelText('Profil'), 'demo-odd');
  expect(screen.getByRole('button', { name: /^ligne 2, colonne 5 : E$/ })).toBeTruthy();
});
