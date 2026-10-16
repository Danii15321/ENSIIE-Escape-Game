// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import journeyRaw from '../../game/campaigns/chrono-iie/journey.json';
import sourcesRaw from '../../game/shared/sources/index.json';
import { media } from '../../src/presentation/theme/media';
import { qrPath, QrCode, SourceLink } from '../../src/presentation/components/QrCode';
import { App } from '../../src/app/App';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
});

const cells = (value: string) => {
  const { size, path } = qrPath(value);
  const dark = new Set([...path.matchAll(/M(\d+) (\d+)/g)].map(([, c, r]) => `${r},${c}`));
  return { size, dark };
};

describe('Codes QR', () => {
  it('encode chaque source avec les trois motifs de repérage', () => {
    for (const { url } of Object.values(sourcesRaw)) {
      const { size, dark } = cells(url);
      expect(size).toBeGreaterThanOrEqual(21);
      for (const [r0, c0] of [
        [0, 0],
        [0, size - 7],
        [size - 7, 0],
      ] as [number, number][])
        for (let i = 0; i < 7; i++) {
          expect(dark.has(`${r0},${c0 + i}`)).toBe(true);
          expect(dark.has(`${r0 + 6},${c0 + i}`)).toBe(true);
          expect(dark.has(`${r0 + i},${c0}`)).toBe(true);
          expect(dark.has(`${r0 + 2},${c0 + 2}`)).toBe(true);
        }
    }
    expect(qrPath('https://example.org/a').path).not.toBe(qrPath('https://example.org/b').path);
  });

  it('affiche le code QR d’une source à la demande, sans quitter le jeu', async () => {
    const user = userEvent.setup();
    render(<SourceLink title="Décret" url="https://www.legifrance.gouv.fr/x" />);
    expect(screen.queryByRole('img', { name: 'Code QR : Décret' })).toBeNull();
    const toggle = screen.getByRole('button', { name: 'Afficher le code QR : Décret' });
    await user.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('img', { name: 'Code QR : Décret' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Masquer le code QR : Décret' }));
    expect(screen.queryByRole('img', { name: 'Code QR : Décret' })).toBeNull();
  });

  it('dessine un SVG sans HTML injecté', () => {
    const { container } = render(<QrCode value="https://example.org" label="test" />);
    expect(container.querySelector('svg path')?.getAttribute('d')).toMatch(/^M\d/);
    expect(container.innerHTML).not.toContain('<img');
  });

  it('propose l’adresse du jeu en QR dans les réglages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Réglages' }));
    expect(screen.getByRole('img', { name: 'Code QR : adresse du jeu' })).toBeTruthy();
    expect(
      screen.getByText(/Cette adresse locale ne fonctionne que sur cet ordinateur/),
    ).toBeTruthy();
  });
});

describe('Photos', () => {
  it('chaque image citée par le parcours existe et porte un texte alternatif', () => {
    const ids = [
      ...journeyRaw.chapters.flatMap((chapter) =>
        'images' in chapter ? (chapter.images as string[]) : [],
      ),
      ...journeyRaw.bonus.flatMap((entry) => (entry.image ? [entry.image as string] : [])),
    ];
    expect(ids).toEqual(['cnam-1890', 'cnam-exterior', 'ensiie-exterior', 'isu-illkirch-2011']);
    for (const id of ids) {
      expect(media[id]?.url).toBeTruthy();
      expect(media[id]!.alt.length).toBeGreaterThan(20);
      expect(media[id]!.credit).toBeTruthy();
    }
  });

  it('montre les photos du repère seulement avec le secours, sur le site réel', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/?level=pre-02&site=evry-2026');
    render(<App />);
    expect(screen.queryByAltText(/salle de TP du premier étage/)).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Utiliser le secours textuel O2' }));
    expect(screen.getAllByAltText(/salle de TP du premier étage/)).toHaveLength(3);
  });
});
