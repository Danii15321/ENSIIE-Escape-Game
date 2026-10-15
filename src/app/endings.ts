import raw from '../../game/endings/content.json';
import { parseEndingCopy } from './endingContent';
import { catalog, sourceRegistry } from './catalog';
import type { Catalog } from '../core/content/catalog';
import { ending, inventory, resolveInputs, type Session } from '../core/session/engine';
import { evaluate } from '../core/validation/mechanics';
import type { EndingCopy, EndingModel } from '../presentation/components/EndingView';

export const endingCopy = parseEndingCopy(raw, catalog.levels['fut-c']!, sourceRegistry);
export function endingModel(
  session: Session,
  game: Catalog,
  activeSeconds?: number,
): EndingModel | null {
  const result = ending(session, game);
  if (!result) return null;
  const theme =
    result.theme === 'lucidite' || result.theme === 'sobriete' || result.theme === 'partage'
      ? result.theme
      : 'horizon-commun';
  const progress = Object.values(session.progress);
  const badges = ['Mémoire restaurée'];
  const final = game.levels[game.campaign.finalLevel]!;
  const evidence = final.steps.find((step) => step.mechanic.kind === 'evidence');
  if (
    evidence &&
    evaluate(evidence.mechanic, session.progress[final.id]?.drafts[evidence.id] ?? {}, {
      site: game.sites[session.siteId]!,
      inputs: resolveInputs(session, game, final.id),
    }).status === 'correct'
  )
    badges.push('Enquête documentée');
  if (inventory(session, game).some((fragment) => fragment.type === 'ArchiveEst'))
    badges.push('Archives de l’Est');
  return {
    team: session.team,
    theme,
    commitments: result.commitments,
    missionsAssisted: progress.filter((p) => p.status === 'assisted').length,
    hints: progress.reduce((sum, p) => sum + p.hints, 0),
    observationsAssisted: progress.reduce((sum, p) => sum + p.fallbackObservations.length, 0),
    badges,
    activeMinutes:
      activeSeconds === undefined ? undefined : Math.max(1, Math.round(activeSeconds / 60)),
  };
}
export function souvenirText(copy: EndingCopy, model: EndingModel, contribution: string) {
  const variant = copy.variants[model.theme];
  return [
    copy.exportNotice,
    `Équipe : ${model.team}`,
    variant.title,
    ...copy.opening.map((l) => `${l.speaker} : ${l.text}`),
    ...variant.lines.map((l) => `${l.speaker} : ${l.text}`),
    'Engagements',
    ...model.commitments.map((text) => `- ${text}`),
    'Repères historiques',
    ...copy.timeline.map((e) => `${e.year} — ${e.text}`),
    copy.projection,
    `Missions accompagnées : ${model.missionsAssisted}`,
    `Indices consultés : ${model.hints}`,
    `Observations avec secours : ${model.observationsAssisted}`,
    model.activeMinutes === undefined
      ? 'Durée active : non mesurée'
      : `Durée active : ${model.activeMinutes} min`,
    `Badges : ${model.badges.join(', ')}`,
    ...(contribution ? ['Contribution privée conservée', contribution] : []),
    copy.closing.text.replaceAll('{equipe}', model.team),
  ].join('\n\n');
}
