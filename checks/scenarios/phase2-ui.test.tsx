// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/app/App';
import { EndingPanel } from '../../src/app/EndingPanel';
import { endingCopy } from '../../src/app/endings';
import { catalog } from '../../src/app/catalog';
import { createSession, dispatch, type Session } from '../../src/core/session/engine';
import { SAVE_KEY } from '../../src/adapters/storage/local';
import {
  capsuleKey,
  readCapsule,
  saveCapsule,
  clearCapsule,
} from '../../src/adapters/storage/capsule';
import { EndingView, type EndingModel } from '../../src/presentation/components/EndingView';
const model: EndingModel = {
  team: 'Équipe test',
  theme: 'lucidite',
  commitments: [],
  missionsAssisted: 0,
  hints: 0,
  observationsAssisted: 0,
  badges: ['Mémoire restaurée'],
};
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
  vi.restoreAllMocks();
});
it('le Conseil réel affiche neuf options, permet de remplacer/retirer et de différer sans indice', async () => {
  window.history.replaceState({}, '', '/?level=fut-c');
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getAllByRole('radio')).toHaveLength(9);
  expect(screen.queryByText(/Besoin d’un indice/)).toBeNull();
  const first = within(screen.getByRole('group', { name: /^Question 1 :/ }));
  await user.click(first.getAllByRole('radio')[0]!);
  expect(screen.getByText(/Vous rendez visibles les sources/)).toBeTruthy();
  await user.click(first.getAllByRole('radio')[1]!);
  expect((first.getAllByRole('radio')[0] as HTMLInputElement).checked).toBe(false);
  await user.click(first.getByRole('button', { name: 'Retirer ma réponse' }));
  expect(first.getAllByRole('radio').some((r) => (r as HTMLInputElement).checked)).toBe(false);
  await user.click(screen.getByRole('button', { name: 'Décider plus tard' }));
  expect(screen.getByText(/La capsule s’ouvrira aussi sans ce choix/)).toBeTruthy();
  expect(window.localStorage.getItem(SAVE_KEY)).toBeNull();
});
it('la contribution privée est conservée, reprise, limitée et retirée sans appel réseau', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  const user = userEvent.setup();
  const onMemory = vi.fn();
  const view = render(
    <EndingPanel sessionId="private-test" model={model} onMemory={onMemory} onHome={() => {}} />,
  );
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'La capsule ouverte' }));
  const input = screen.getByRole('textbox', { name: 'Votre idée (facultatif)' });
  expect(input.getAttribute('maxlength')).toBe('500');
  await user.type(input, '<script>Une idée pour demain</script>');
  await user.click(screen.getByRole('button', { name: 'Conserver sur cet appareil' }));
  expect(readCapsule(window.localStorage, 'private-test').text).toBe(
    '<script>Une idée pour demain</script>',
  );
  expect(document.querySelector('script')).toBeNull();
  view.unmount();
  render(
    <EndingPanel sessionId="private-test" model={model} onMemory={onMemory} onHome={() => {}} />,
  );
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toContain('<script>');
  await user.click(screen.getByRole('button', { name: 'Ne rien ajouter' }));
  expect(window.localStorage.getItem(capsuleKey('private-test'))).toBeNull();
  expect(fetchSpy).not.toHaveBeenCalled();
});
it('exporte uniquement le message conservé et conserve le brouillon si le stockage échoue', async () => {
  const user = userEvent.setup();
  const onExport = vi.fn();
  render(
    <EndingView
      copy={endingCopy}
      model={model}
      sources={{
        S04: { title: 'Histoire', url: 'https://example.org' },
        S05: { title: 'Archives', url: 'https://example.org' },
        S15: { title: 'Anciens', url: 'https://example.org' },
        S06: { title: 'Décret', url: 'https://example.org' },
        S07: { title: 'Publication', url: 'https://example.org' },
      }}
      initialMessage="Conservé"
      initialNotice=""
      onSaveMessage={() => ({ ok: false, notice: 'Écriture impossible' })}
      onClearMessage={() => ({ ok: false, notice: 'Retrait impossible' })}
      onExport={onExport}
      onMemory={() => {}}
      onHome={() => {}}
    />,
  );
  await user.clear(screen.getByRole('textbox'));
  await user.type(screen.getByRole('textbox'), 'Brouillon');
  await user.click(screen.getByRole('button', { name: 'Conserver sur cet appareil' }));
  expect(screen.getByText('Écriture impossible')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Exporter le souvenir' }));
  expect(onExport).toHaveBeenCalledWith('Conservé');
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Brouillon');
});
it('le stockage privé refuse les données invalides et isole les parties', () => {
  saveCapsule(window.localStorage, 'a', 'Idée A');
  expect(readCapsule(window.localStorage, 'b').text).toBe('');
  expect(saveCapsule(window.localStorage, 'a', 'x'.repeat(501)).ok).toBe(false);
  expect(readCapsule(window.localStorage, 'a').text).toBe('Idée A');
  window.localStorage.setItem(capsuleKey('b'), 'malformed');
  expect(readCapsule(window.localStorage, 'b').notice).toContain('ne peut pas être lue');
  expect(window.localStorage.getItem(capsuleKey('b'))).toBe('malformed');
  const fail = {
    getItem: () => {
      throw new Error();
    },
    setItem: () => {
      throw new Error();
    },
    removeItem: () => {
      throw new Error();
    },
  };
  expect(readCapsule(fail, 'a').text).toBe('');
  expect(saveCapsule(fail, 'a', 'idée').ok).toBe(false);
  expect(clearCapsule(fail, 'a').ok).toBe(false);
});
function finishedSession(): Session {
  let session = createSession(catalog, catalog.sites['evry-2026']!, 'end-ui');
  for (const entry of catalog.campaign.levels) {
    const level = catalog.levels[entry.id]!;
    if (level.narrative || entry.id === 'ext-est') continue;
    for (let i = 0; i < 3; i++)
      session = dispatch(session, catalog, { type: 'hint', levelId: entry.id }).session;
    session = dispatch(session, catalog, {
      type: 'assist',
      levelId: entry.id,
      confirmed: true,
    }).session;
  }
  return session;
}
it('la fin s’ouvre après le final restauré, le carnet et l’accueil restent accessibles', async () => {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(finishedSession()));
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Ouvrir la capsule' }));
  expect(screen.getByRole('heading', { name: 'La capsule ouverte' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Une école à construire ensemble' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Relire le carnet' }));
  expect(screen.getByRole('heading', { name: 'Carnet de fragments' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'La capsule' }));
  await user.click(screen.getByRole('button', { name: 'Revenir à l’accueil' }));
  expect(screen.getByRole('list', { name: 'Dossiers de la campagne' })).toBeTruthy();
});
it('aucune ouverture de fin avant le final et les radios sont figées après', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.queryByRole('button', { name: 'La capsule' })).toBeNull();
  cleanup();
  const session = finishedSession();
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(session));
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Ouvrir la capsule' }));
  await user.click(screen.getByRole('button', { name: 'Revenir à l’accueil' }));
  await user.click(document.getElementById('open-fut-c')!);
  expect(screen.getAllByRole('radio').every((r) => (r as HTMLInputElement).disabled)).toBe(true);
});
