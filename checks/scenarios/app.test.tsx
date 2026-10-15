// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/app/App';
import { catalog } from '../../src/app/catalog';
import { SAVE_KEY } from '../../src/adapters/storage/local';
import { createSession, dispatch, type Session } from '../../src/core/session/engine';

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
});
afterEach(cleanup);

function assistedThrough(levels: string[]): Session {
  let session = createSession(catalog, catalog.sites.demo!, 'linear-ui', 'Équipe test');
  for (const levelId of levels) {
    for (let i = 0; i < 3; i++)
      session = dispatch(session, catalog, { type: 'hint', levelId }).session;
    session = dispatch(session, catalog, { type: 'assist', levelId, confirmed: true }).session;
  }
  return session;
}
const actsOneAndTwo = [
  'pro-00',
  'pas-01',
  'pas-02',
  'pas-03',
  'syn-01',
  'pre-01',
  'pre-02',
  'syn-02',
];

it('ouvre l’acte III par sa scène, ses questions facultatives puis la première mission', async () => {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(assistedThrough(actsOneAndTwo)));
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Reprendre' }));
  expect(screen.getByText('À suivre · Acte III · La transmission')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Commencer' }));
  expect(screen.getByRole('heading', { name: 'La transmission' })).toBeTruthy();
  expect(screen.queryByText(/Je suis une ancienne élève/)).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Continuer' }));
  expect(screen.getByText(/Je suis une ancienne élève de la promotion 2045/)).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Pourquoi une ancienne élève ?' }));
  expect(screen.getByText(/Le réseau des anciens relie des promotions/)).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Pourquoi une ancienne élève ?' })).toBeNull();
  expect(screen.getByText(/un Conseil facultatif et le contrôle du centenaire/)).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Commencer l’acte' }));
  expect(screen.getByRole('heading', { name: 'Le campus sous contraintes' })).toBeTruthy();
  expect(screen.getByText('Acte III · Mission 1 sur 3')).toBeTruthy();
});

it('fait passer le Conseil facultatif dans le chemin sans bloquer le contrôle final', async () => {
  window.localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(assistedThrough([...actsOneAndTwo, 'fut-01', 'fut-02'])),
  );
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Reprendre' }));
  const council = document.getElementById('open-fut-c')!.closest('li')!;
  expect(within(council).getByText('Facultatif')).toBeTruthy();
  expect(within(council).getByText('À suivre')).toBeTruthy();
  expect((document.getElementById('open-syn-03') as HTMLButtonElement).disabled).toBe(false);
  await user.click(screen.getByRole('button', { name: 'Commencer' }));
  expect(screen.getByRole('heading', { name: 'Le Conseil du futur' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Vérifier' })).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Continuer' }));
  expect(screen.getByRole('heading', { name: 'Le contrôle du centenaire' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Retour à l’acte' }));
  expect(
    within(document.getElementById('open-fut-c')!.closest('li')!).getByText(
      'Consulté, modifiable jusqu’à la capsule',
    ),
  ).toBeTruthy();
});

it('la campagne présente l’acte II verrouillé puis ouvre SYN-02 dans l’atelier', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Commencer l’enquête' }));
  await user.click(screen.getByRole('button', { name: 'Recevoir le signal' }));
  await user.click(screen.getByRole('button', { name: 'Retour à l’acte' }));
  const campaign = screen.getByRole('list', { name: 'Dossiers de la campagne' });
  for (const title of ['L’atelier des compétences', 'Les yeux d’ARIIE', 'Le mur des mots']) {
    const stop = within(campaign).getByText(title).closest('li')!;
    expect(within(stop).getByText(/^Verrouillé/)).toBeTruthy();
    expect((within(stop).getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  }
  await user.click(screen.getByRole('button', { name: 'Réglages' }));
  await user.click(screen.getByRole('button', { name: 'Atelier des niveaux' }));
  await user.selectOptions(screen.getByLabelText('Niveau'), 'syn-02');
  expect(screen.getByRole('button', { name: /^ligne 7, colonne 1 : R$/ })).toBeTruthy();
  await user.selectOptions(screen.getByLabelText('Profil'), 'demo-odd');
  expect(screen.getByRole('button', { name: /^ligne 2, colonne 5 : E$/ })).toBeTruthy();
});

it('accueille une nouvelle équipe, la nomme et propose une seule suite', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Chrono-IIE' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Reprendre' })).toBeNull();
  await user.type(screen.getByLabelText('Nom d’équipe (facultatif)'), 'Les Chronautes');
  await user.selectOptions(screen.getByLabelText('Profil de la nouvelle partie'), 'demo');
  await user.click(screen.getByRole('button', { name: 'Commencer l’enquête' }));
  const save = JSON.parse(window.localStorage.getItem(SAVE_KEY)!);
  expect(save).toMatchObject({ team: 'Les Chronautes', siteId: 'demo' });
  expect(screen.getByRole('heading', { name: 'Le Signal' })).toBeTruthy();
  expect(
    screen.getByText('Transmission entrante. Origine : 2068. Destination : votre équipe, en 2026.'),
  ).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Recevoir le signal' }));
  await user.click(screen.getByRole('button', { name: 'Retour à l’acte' }));
  const next = screen.getByText('À suivre · Prologue · Le Signal').closest('div')!;
  expect(within(next).getByRole('button', { name: 'Continuer' })).toBeTruthy();
  expect(
    screen.getByRole('progressbar', { name: 'Mémoire d’ARIIE' }).getAttribute('aria-valuetext'),
  ).toBe('0 %, Signal fragmenté');
});

it('mène du prologue à la récompense puis à l’introduction de l’acte I', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Commencer l’enquête' }));
  await user.click(screen.getByRole('button', { name: 'Recevoir le signal' }));
  await user.type(screen.getByLabelText('Les six lettres'), 'ensiie');
  await user.click(screen.getByRole('button', { name: 'Vérifier' }));
  expect(screen.getByRole('heading', { name: 'Dossier restauré' })).toBeTruthy();
  expect(screen.getByText('Prologue restauré')).toBeTruthy();
  expect(screen.getByText(/Prologue · Le Signal : restauré/)).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Continuer' }));
  expect(screen.getByRole('heading', { name: 'Les origines' })).toBeTruthy();
  expect(screen.getByRole('img', { name: /rue Saint-Martin/ })).toBeTruthy();
  expect(screen.getByText(/Hippolyte Blancard/)).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Continuer' }));
  await user.click(screen.getByRole('button', { name: 'Commencer l’acte' }));
  expect(screen.getByRole('heading', { name: 'Les archives déclassées' })).toBeTruthy();
  expect(screen.getByText('Acte I · Mission 1 sur 4')).toBeTruthy();
});

it('met en pause et applique les réglages de confort sur toute la page', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Réglages' }));
  await user.click(screen.getByRole('switch', { name: /Agrandir le texte/ }));
  expect(document.documentElement.dataset.text).toBe('large');
  await user.click(screen.getByRole('switch', { name: /Activer les sons/ }));
  expect(JSON.parse(window.localStorage.getItem('chrono-iie:prefs:v1')!)).toMatchObject({
    largeText: true,
    sound: false,
  });
  await user.click(screen.getAllByRole('button', { name: 'Mettre en pause' })[0]!);
  const pause = screen.getByRole('dialog', { name: 'Partie en pause' });
  expect(within(pause).getByText('Votre carnet reste enregistré.')).toBeTruthy();
  await user.click(within(pause).getByRole('button', { name: 'Reprendre' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});
