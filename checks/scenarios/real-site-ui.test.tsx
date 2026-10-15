// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/app/App';
import { catalog } from '../../src/app/catalog';
import { createSession, dispatch } from '../../src/core/session/engine';
import { SAVE_KEY } from '../../src/adapters/storage/local';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
});
it('affiche les trajets et cache le secours jusqu’au clic, pour O1 et O2 dans l’atelier réel', async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, '', '/?level=pas-02&site=evry-2026');
  render(<App />);
  expect(
    screen.getByText('Entrez dans l’école, tournez à droite et rejoignez le foyer.'),
  ).toBeTruthy();
  expect(screen.queryByText(/Saisissez 2 comme valeur/)).toBeNull();
  expect(screen.queryByText(/DEMO fictive/)).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Nous allons observer.' }));
  expect(screen.queryByText(/Nous sommes en démonstration/)).toBeNull();
  expect(screen.getByText(/Rendez-vous/).textContent).not.toContain('{O1.');
  await user.click(screen.getByRole('button', { name: 'Utiliser le secours textuel O1' }));
  expect(screen.getByText(/Saisissez 2 comme valeur/)).toBeTruthy();
  expect(window.localStorage.getItem(SAVE_KEY)).toBeNull();
  await user.selectOptions(screen.getByRole('combobox', { name: 'Niveau' }), 'pre-02');
  expect(screen.getByText('Depuis l’entrée de l’école, rejoignez le premier étage.')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Utiliser le secours textuel O2' }));
  expect(screen.getByText(/Saisissez 3 comme valeur/)).toBeTruthy();
  await user.selectOptions(screen.getByRole('combobox', { name: 'Profil' }), 'demo');
  expect(screen.getByText('Carte O2 · DEMO fictive')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Utiliser le secours textuel O2' })).toBeNull();
});
it('sauvegarde le secours en campagne et le retrouve après remontage', async () => {
  let session = createSession(catalog, catalog.sites['evry-2026']!, 'campaign-ui');
  for (const levelId of ['pro-00', 'pas-01']) {
    for (let i = 0; i < 3; i++)
      session = dispatch(session, catalog, { type: 'hint', levelId }).session;
    session = dispatch(session, catalog, { type: 'assist', levelId, confirmed: true }).session;
  }
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(session));
  const user = userEvent.setup();
  const view = render(<App />);
  await user.click(document.getElementById('open-pas-02')!);
  await user.click(screen.getByRole('button', { name: 'Utiliser le secours textuel O1' }));
  expect(
    JSON.parse(window.localStorage.getItem(SAVE_KEY)!).progress['pas-02'].fallbackObservations,
  ).toEqual(['O1']);
  view.unmount();
  render(<App />);
  await user.click(document.getElementById('open-pas-02')!);
  expect(screen.getByText(/Saisissez 2 comme valeur/)).toBeTruthy();
});
it('préserve une partie DEMO et change de profil seulement à la création confirmée', async () => {
  window.localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(createSession(catalog, catalog.sites.demo!, 'demo-ui')),
  );
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByText('Profil : DEMO — observations fictives')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Nouvelle partie' }));
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Profil de la nouvelle partie' }),
    'evry-2026',
  );
  expect(JSON.parse(window.localStorage.getItem(SAVE_KEY)!).siteId).toBe('demo');
  await user.click(screen.getByRole('button', { name: 'Créer la nouvelle partie' }));
  expect(JSON.parse(window.localStorage.getItem(SAVE_KEY)!).siteId).toBe('evry-2026');
  expect(screen.getByText('Profil : Évry 2026 — parcours dans l’école')).toBeTruthy();
});
