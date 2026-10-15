import { z } from 'zod';
import {
  answerSchema,
  type Answer,
  type Context,
  type Evaluation,
  type Inputs,
  type Level,
  type Site,
} from '../contracts';
import type { Catalog } from '../content/catalog';
import { evaluate } from '../validation/mechanics';

export const progressSchema = z.object({
  status: z.enum(['started', 'succeeded', 'assisted']),
  step: z.number().int().nonnegative(),
  drafts: z.record(z.string(), answerSchema),
  hints: z.number().int().min(0).max(3),
  dialogue: z.string().nullable(),
});
export type Progress = z.infer<typeof progressSchema>;
export const sessionSchema = z.object({
  contractVersion: z.literal(1),
  campaignId: z.string(),
  campaignRevision: z.number().int(),
  siteId: z.string(),
  siteRevision: z.number().int(),
  levelRevisions: z.record(z.string(), z.number().int()),
  id: z.string(),
  team: z.string().min(1).max(24),
  revision: z.number().int().nonnegative(),
  progress: z.record(z.string(), progressSchema),
});
export type Session = z.infer<typeof sessionSchema>;
export type Command =
  | { type: 'open'; levelId: string }
  | { type: 'draft'; levelId: string; answer: Answer }
  | { type: 'submit'; levelId: string }
  | { type: 'hint'; levelId: string }
  | { type: 'dialogue'; levelId: string; choiceId: string }
  | { type: 'assist'; levelId: string; confirmed: true };
export type Result = { session: Session; evaluation?: Evaluation; message?: string };

export const isComplete = (progress?: Progress) =>
  progress?.status === 'succeeded' || progress?.status === 'assisted';
export function initialProgress(level: Level): Progress {
  return { status: 'started', step: 0, drafts: {}, hints: 0, dialogue: level.dialogue.entry };
}
export function createSession(
  catalog: Catalog,
  site: Site,
  id: string,
  team = 'Équipe Chrono',
): Session {
  if (!site.verified) throw new Error('Profil de site non vérifié');
  return {
    contractVersion: 1,
    campaignId: catalog.campaign.id,
    campaignRevision: catalog.campaign.revision,
    siteId: site.id,
    siteRevision: site.revision,
    levelRevisions: Object.fromEntries(
      Object.values(catalog.levels).map((level) => [level.id, level.revision]),
    ),
    id,
    team: team.trim().slice(0, 24) || 'Équipe Chrono',
    revision: 0,
    progress: {},
  };
}
export function availability(
  session: Session,
  catalog: Catalog,
  levelId: string,
): 'draft' | 'locked' | 'available' | 'started' | 'succeeded' | 'assisted' {
  const level = catalog.levels[levelId];
  const entry = catalog.campaign.levels.find((entry) => entry.id === levelId);
  if (!level || !entry || level.status === 'draft') return 'draft';
  if (!entry.requires.every((id) => isComplete(session.progress[id]))) return 'locked';
  return session.progress[levelId]?.status ?? 'available';
}
export function resolveInputs(session: Session, catalog: Catalog, levelId: string): Inputs {
  const entry = catalog.campaign.levels.find((entry) => entry.id === levelId);
  const inputs: Inputs = {};
  for (const [port, binding] of Object.entries(entry?.bindings ?? {})) {
    if (!isComplete(session.progress[binding.level]))
      throw new Error(`Fragment non acquis : ${port}`);
    const output = catalog.levels[binding.level]?.outputs.find(
      (output) => output.id === binding.output,
    );
    if (!output) throw new Error(`Fragment absent : ${port}`);
    inputs[port] = output;
  }
  return inputs;
}
export function integrity(session: Session, catalog: Catalog): number {
  return catalog.campaign.levels.reduce(
    (total, entry) => total + (isComplete(session.progress[entry.id]) ? entry.points : 0),
    0,
  );
}
export function inventory(session: Session, catalog: Catalog) {
  return catalog.campaign.levels.flatMap((entry) =>
    isComplete(session.progress[entry.id])
      ? (catalog.levels[entry.id]?.outputs ?? []).map((fragment) => ({
          ...fragment,
          rewardId: `${entry.id}:${fragment.id}`,
          provenance: entry.id,
          version: session.levelRevisions[entry.id],
        }))
      : [],
  );
}

/** Pure transition shared by the campaign and the isolated authoring preview. */
export function advance(
  level: Level,
  progress: Progress,
  command: Command,
  context: Context,
): { progress: Progress; evaluation?: Evaluation; message?: string } {
  if (isComplete(progress)) return { progress, message: level.dialogue.return };
  const next = structuredClone(progress);
  const step = level.steps[next.step];
  if (!step) throw new Error(`${level.id} : étape absente`);
  switch (command.type) {
    case 'open':
      return { progress: next };
    case 'draft':
      next.drafts[step.id] = answerSchema.parse(command.answer);
      break;
    case 'hint':
      next.hints = Math.min(3, next.hints + 1);
      break;
    case 'dialogue': {
      const choice = level.dialogue.nodes
        .find((node) => node.id === next.dialogue)
        ?.choices.find((choice) => choice.id === command.choiceId);
      if (!choice) return { progress, message: 'Ce choix de dialogue n’est pas disponible.' };
      next.dialogue = choice.to;
      break;
    }
    case 'assist':
      if (next.hints < 3 || command.confirmed !== true)
        return {
          progress,
          message: 'Consultez les trois indices, puis confirmez la solution expliquée.',
        };
      next.status = 'assisted';
      next.step = level.steps.length;
      next.dialogue = null;
      break;
    case 'submit': {
      const evaluation = evaluate(step.mechanic, next.drafts[step.id] ?? {}, context);
      if (evaluation.status === 'correct') {
        next.step++;
        next.dialogue = null;
        if (next.step === level.steps.length) next.status = 'succeeded';
      }
      return { progress: next, evaluation };
    }
  }
  return { progress: next };
}

export function dispatch(session: Session, catalog: Catalog, command: Command): Result {
  const state = availability(session, catalog, command.levelId);
  if (state === 'locked' || state === 'draft')
    return {
      session,
      message:
        state === 'draft' ? 'Niveau en préparation.' : 'Les prérequis ne sont pas encore acquis.',
    };
  const level = catalog.levels[command.levelId]!;
  if (isComplete(session.progress[level.id])) return { session, message: level.dialogue.return };
  const site = catalog.sites[session.siteId];
  if (!site || !site.verified) return { session, message: 'Profil de site indisponible.' };
  const result = advance(level, session.progress[level.id] ?? initialProgress(level), command, {
    site,
    inputs: resolveInputs(session, catalog, level.id),
  });
  return {
    session: {
      ...session,
      revision: session.revision + 1,
      progress: { ...session.progress, [level.id]: result.progress },
    },
    evaluation: result.evaluation,
    message: result.message,
  };
}

export function restoreSession(raw: unknown, catalog: Catalog): Session {
  const session = sessionSchema.parse(raw);
  const site = catalog.sites[session.siteId];
  if (
    session.campaignId !== catalog.campaign.id ||
    session.campaignRevision !== catalog.campaign.revision ||
    !site?.verified ||
    session.siteRevision !== site.revision
  )
    throw new Error('Campagne ou site incompatible. La sauvegarde originale est conservée.');
  for (const level of Object.values(catalog.levels))
    if (session.levelRevisions[level.id] !== level.revision)
      throw new Error(`Révision incompatible : ${level.id}`);
  for (const [id, progress] of Object.entries(session.progress)) {
    const level = catalog.levels[id];
    if (
      !level ||
      availability(session, catalog, id) === 'draft' ||
      availability(session, catalog, id) === 'locked'
    )
      throw new Error(`Progression incompatible : ${id}`);
    if (
      progress.step > level.steps.length ||
      isComplete(progress) !== (progress.step === level.steps.length)
    )
      throw new Error(`Étape incohérente : ${id}`);
    if (
      progress.dialogue !== null &&
      !level.dialogue.nodes.some((node) => node.id === progress.dialogue)
    )
      throw new Error(`Dialogue absent : ${id}`);
    for (const stepId of Object.keys(progress.drafts))
      if (!level.steps.some((step) => step.id === stepId))
        throw new Error(`Brouillon inconnu : ${id}/${stepId}`);
    if (progress.status !== 'assisted') {
      const context = { inputs: resolveInputs(session, catalog, id), site };
      for (const step of level.steps.slice(0, progress.step))
        if (evaluate(step.mechanic, progress.drafts[step.id] ?? {}, context).status !== 'correct')
          throw new Error(`Preuve d’étape invalide : ${id}/${step.id}`);
    } else if (progress.hints !== 3) throw new Error(`Assistance incohérente : ${id}`);
  }
  return session;
}
