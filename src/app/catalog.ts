import { parseCatalog } from '../core/content/catalog';
import campaign from '../../game/campaigns/chrono-iie/campaign.json';
import sources from '../../game/shared/sources/index.json';

const packages = import.meta.glob('../../game/levels/*/level.json', {
  eager: true,
  import: 'default',
});
const sites = import.meta.glob('../../game/sites/*/site.json', { eager: true, import: 'default' });
export const catalog = parseCatalog({
  campaign,
  levels: Object.values(packages),
  sites: Object.values(sites),
});
export const sourceRegistry: Record<string, { title: string; url: string }> = sources;
