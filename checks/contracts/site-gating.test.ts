import { expect, it } from 'vitest';
import { catalog } from '../../scripts/load-content';
import { createSession, dispatch, restoreSession } from '../../src/core/session/engine';
import { siteSchema } from '../../src/core/contracts';

it('un relevé réel non vérifié ne peut ni démarrer, ni reprendre, ni être joué', () => {
  const real = catalog.sites['evry-2026']!;
  expect(real.mode).toBe('real');
  const unverified = { ...real, verified: false };
  const game = structuredClone(catalog);
  game.sites['evry-2026'] = unverified;
  expect(() => createSession(game, unverified, 'x')).toThrow('non vérifié');
  const session = createSession(catalog, real, 'x');
  expect(() => restoreSession(session, game)).toThrow('incompatible');
  expect(dispatch(session, game, { type: 'open', levelId: 'pro-00' }).message).toContain(
    'indisponible',
  );
  expect(siteSchema.safeParse({ ...real, landmarks: undefined }).success).toBe(false);
});
