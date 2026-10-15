// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OfflinePanel } from '../../src/app/OfflinePanel';
import type { OfflineStatus } from '../../src/core/ports/offline';

afterEach(cleanup);
function fake(results: OfflineStatus[], initial: OfflineStatus) {
  const calls: string[] = [];
  return {
    calls,
    offline: {
      inspect: async () => (calls.push('inspect'), initial),
      prepare: async (onProgress: (status: OfflineStatus) => void = () => {}) => {
        calls.push('prepare');
        onProgress({ state: 'preparing', done: 1, total: 4 });
        return results.shift()!;
      },
      clear: async () =>
        (calls.push('clear'), { state: 'none', done: 0, total: 0 }) as OfflineStatus,
    },
  };
}

it('annonce l’indisponibilité hors de la version publiée', () => {
  render(<OfflinePanel offline={null} />);
  expect(screen.getByText('Indisponible ici')).toBeTruthy();
  expect(screen.queryByRole('button')).toBeNull();
});

it('reprend après une interruption puis annonce la disponibilité', async () => {
  const user = userEvent.setup();
  const { offline, calls } = fake(
    [
      { state: 'failed', done: 2, total: 4, message: 'Préparation interrompue (2/4)' },
      { state: 'ready', done: 4, total: 4 },
    ],
    { state: 'none', done: 0, total: 4 },
  );
  render(<OfflinePanel offline={offline} />);
  expect(await screen.findByText('Non préparé')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Préparer le mode hors ligne' }));
  expect(await screen.findByText('Préparation interrompue')).toBeTruthy();
  expect(screen.getByText('Préparation interrompue (2/4)')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Reprendre la préparation' }));
  expect(await screen.findByText('Prêt hors ligne')).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Préparer|Reprendre/ })).toBeNull();
  expect(calls).toEqual(['inspect', 'prepare', 'prepare']);
});

it('demande confirmation avant de supprimer la copie et propose la mise à jour', async () => {
  const user = userEvent.setup();
  const { offline, calls } = fake([], { state: 'outdated', done: 0, total: 4, version: 'v1' });
  render(<OfflinePanel offline={offline} />);
  expect(
    await screen.findByRole('button', { name: 'Mettre à jour la copie hors ligne' }),
  ).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Supprimer la copie hors ligne' }));
  await user.click(screen.getByRole('button', { name: 'Annuler' }));
  expect(calls).toEqual(['inspect']);
  await user.click(screen.getByRole('button', { name: 'Supprimer la copie hors ligne' }));
  await user.click(screen.getByRole('button', { name: 'Supprimer la copie' }));
  expect(await screen.findByText('Non préparé')).toBeTruthy();
  expect(calls).toEqual(['inspect', 'clear']);
});
