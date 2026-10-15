import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { parseCatalog } from '../src/core/content/catalog';
import { parseJourney } from '../src/core/session/journey';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const readJson = (path: string): unknown =>
  JSON.parse(readFileSync(resolve(root, path), 'utf8'));
export const levelIds = readdirSync(resolve(root, 'game/levels'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
export const catalog = parseCatalog({
  campaign: readJson('game/campaigns/chrono-iie/campaign.json'),
  levels: levelIds.map((id) => readJson(`game/levels/${id}/level.json`)),
  sites: readdirSync(resolve(root, 'game/sites'), { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() && existsSync(resolve(root, 'game/sites', entry.name, 'site.json')),
    )
    .map((entry) => readJson(`game/sites/${entry.name}/site.json`)),
});
export const journey = parseJourney(readJson('game/campaigns/chrono-iie/journey.json'), catalog);
