import { z } from 'zod';
import { catalog, readJson, levelIds } from './load-content';
import { validateFixture } from '../src/core/content/catalog';
import { answerSchema } from '../src/core/contracts';
import { evaluate } from '../src/core/validation/mechanics';

const acceptanceSchema = z.object({
  siteId: z.string(),
  answers: z.array(answerSchema),
  status: z.enum(['todo', 'executable']),
  cases: z.array(z.string()).min(1),
});
const sources = z
  .record(z.string(), z.object({ title: z.string(), url: z.url() }))
  .parse(readJson('game/shared/sources/index.json'));
let executable = 0;
let drafts = 0;
const requested = process.argv[2];
for (const id of levelIds)
  if (
    z.object({ id: z.literal(id) }).safeParse(readJson(`game/levels/${id}/level.json`)).success ===
    false
  )
    throw new Error(`${id} : l’identifiant du niveau doit correspondre au dossier`);
if (catalog.campaign.levels.reduce((sum, entry) => sum + entry.points, 0) !== 100)
  throw new Error('Chrono-IIE doit attribuer exactement 100 points au total');
if (requested && !catalog.levels[requested]) throw new Error(`Niveau inconnu : ${requested}`);
for (const level of Object.values(catalog.levels).filter(
  (level) => !requested || level.id === requested,
)) {
  const inputs = validateFixture(level, readJson(`game/levels/${level.id}/fixtures.json`));
  const acceptance = acceptanceSchema.parse(readJson(`game/levels/${level.id}/acceptance.json`));
  for (const document of level.documents)
    for (const source of document.sourceIds)
      if (!sources[source]) throw new Error(`${level.id} : source absente ${source}`);
  if (level.status === 'draft') {
    drafts++;
    continue;
  }
  if (acceptance.status !== 'executable' || acceptance.answers.length !== level.steps.length)
    throw new Error(`${level.id} : réponse de référence manquante`);
  const site = catalog.sites[acceptance.siteId];
  if (!site?.verified) throw new Error(`${level.id} : site de test non vérifié`);
  level.steps.forEach((step, index) => {
    const result = evaluate(step.mechanic, acceptance.answers[index]!, { inputs, site });
    if (result.status !== 'correct')
      throw new Error(`${level.id}/${step.id} : solution refusée — ${result.messages.join('; ')}`);
  });
  executable++;
}
console.log(
  `Contenus valides : ${executable} prototypes exécutables, ${drafts} dossiers à réaliser. Graphe et bindings vérifiés.`,
);
