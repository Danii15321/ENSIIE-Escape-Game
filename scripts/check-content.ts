import { z } from 'zod';
import { catalog, readJson, levelIds, journey } from './load-content';
import { validateFixture } from '../src/core/content/catalog';
import { answerSchema } from '../src/core/contracts';
import { evaluate } from '../src/core/validation/mechanics';
import { parseEndingCopy } from '../src/app/endingContent';

const acceptanceSchema = z.object({
  siteId: z.string(),
  answers: z.array(answerSchema),
  variants: z.record(z.string(), z.array(answerSchema)).default({}),
  status: z.enum(['todo', 'executable']),
  cases: z.array(z.string()).min(1),
});
const sources = z
  .record(z.string(), z.object({ title: z.string(), url: z.url() }))
  .parse(readJson('game/shared/sources/index.json'));
parseEndingCopy(readJson('game/endings/content.json'), catalog.levels['fut-c']!, sources);
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
  const raw = readJson(`game/levels/${level.id}/fixtures.json`);
  validateFixture(level, raw);
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
  const runs = [
    [acceptance.siteId, acceptance.answers] as const,
    ...Object.entries(acceptance.variants),
  ];
  for (const [siteId, answers] of runs) {
    const site = catalog.sites[siteId];
    if (!site?.verified) throw new Error(`${level.id} : site de test ${siteId} non vérifié`);
    if (answers.length !== level.steps.length)
      throw new Error(`${level.id} : réponses ${siteId} incomplètes`);
    const siteInputs = validateFixture(level, raw, siteId);
    level.steps.forEach((step, index) => {
      const result = evaluate(step.mechanic, answers[index]!, { inputs: siteInputs, site });
      if (result.status !== 'correct')
        throw new Error(
          `${level.id}/${step.id} (${siteId}) : solution refusée, ${result.messages.join('; ')}`,
        );
    });
  }
  executable++;
}
console.log(
  `Contenus valides : ${executable} prototypes exécutables, ${drafts} dossiers à réaliser. Graphe, bindings et parcours linéaire (${journey.chapters.length} chapitres) vérifiés.`,
);
