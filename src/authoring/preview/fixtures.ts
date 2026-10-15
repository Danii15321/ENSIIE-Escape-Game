import { validateFixture } from '../../core/content/catalog';
import type { Level } from '../../core/contracts';

const fixtures = import.meta.glob('../../../game/levels/*/fixtures.json', {
  eager: true,
  import: 'default',
});
const acceptance = import.meta.glob('../../../game/levels/*/acceptance.json', {
  eager: true,
  import: 'default',
});
export function inputsFor(level: Level, siteId: string) {
  return validateFixture(level, fixtures[`../../../game/levels/${level.id}/fixtures.json`], siteId);
}
export function referenceFor(levelId: string): unknown {
  return acceptance[`../../../game/levels/${levelId}/acceptance.json`];
}
