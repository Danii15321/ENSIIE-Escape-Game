import {
  campaignSchema,
  fixtureSchema,
  levelSchema,
  siteSchema,
  type Campaign,
  type Level,
  type Site,
} from '../contracts';
import { normalizeDate } from '../validation/mechanics';

export type Catalog = {
  campaign: Campaign;
  levels: Record<string, Level>;
  sites: Record<string, Site>;
};

export function validateCatalog(catalog: Catalog): string[] {
  const errors: string[] = [];
  const { levels, campaign } = catalog;
  const unique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length) errors.push(`${label} : identifiant dupliqué`);
  };
  unique(
    campaign.levels.map((level) => level.id),
    'Campagne',
  );
  const entries = new Map(campaign.levels.map((entry) => [entry.id, entry]));
  if (!entries.has(campaign.finalLevel)) errors.push('Final de campagne absent');
  for (const level of Object.values(levels)) {
    const prefix = level.id;
    unique(
      level.steps.map((step) => step.id),
      `${prefix}/étapes`,
    );
    unique(
      level.documents.map((doc) => doc.id),
      `${prefix}/documents`,
    );
    unique(
      level.inputs.map((input) => input.id),
      `${prefix}/entrées`,
    );
    unique(
      level.outputs.map((output) => output.id),
      `${prefix}/sorties`,
    );
    unique(
      level.dialogue.nodes.map((node) => node.id),
      `${prefix}/dialogues`,
    );
    const nodeIds = new Set(level.dialogue.nodes.map((node) => node.id));
    if (!nodeIds.has(level.dialogue.entry)) errors.push(`${prefix} : nœud d’entrée absent`);
    for (const node of level.dialogue.nodes) {
      unique(
        node.choices.map((choice) => choice.id),
        `${prefix}/${node.id}/choix`,
      );
      for (const choice of node.choices)
        if (choice.to !== null && !nodeIds.has(choice.to))
          errors.push(`${prefix}/${node.id} : destination ${choice.to} absente`);
    }
    const reachable = new Set<string>();
    const pending = [level.dialogue.entry];
    while (pending.length) {
      const nodeId = pending.pop()!;
      if (reachable.has(nodeId)) continue;
      reachable.add(nodeId);
      for (const choice of level.dialogue.nodes.find((node) => node.id === nodeId)?.choices ?? [])
        if (choice.to !== null) pending.push(choice.to);
    }
    for (const node of level.dialogue.nodes)
      if (!reachable.has(node.id)) errors.push(`${prefix}/${node.id} : nœud inaccessible`);
    for (const step of level.steps) {
      for (const doc of step.documentIds)
        if (!level.documents.some((document) => document.id === doc))
          errors.push(`${prefix}/${step.id} : document ${doc} absent`);
      const mechanic = step.mechanic;
      if (mechanic.kind === 'form' || mechanic.kind === 'order') {
        unique(
          mechanic.fields.map((field) => field.id),
          `${prefix}/${step.id}/champs`,
        );
        for (const field of mechanic.fields) {
          unique(
            field.options.map((option) => option.id),
            `${prefix}/${step.id}/${field.id}/options`,
          );
          if (mechanic.kind === 'order' && field.id === 'order')
            errors.push(`${prefix} : champ réservé order`);
          const expected = field.expected;
          if (
            field.format === 'set' &&
            (!Array.isArray(expected) ||
              new Set(expected).size !== expected.length ||
              expected.some((id) => !field.options.some((option) => option.id === id)))
          )
            errors.push(`${prefix}/${field.id} : ensemble attendu invalide`);
          if (field.format !== 'set' && Array.isArray(expected))
            errors.push(`${prefix}/${field.id} : réponse scalaire attendue`);
          if (
            field.format === 'choice' &&
            typeof expected === 'string' &&
            !field.options.some((option) => option.id === expected)
          )
            errors.push(`${prefix}/${field.id} : option attendue absente`);
          if (field.format === 'date' && typeof expected === 'string' && !normalizeDate(expected))
            errors.push(`${prefix}/${field.id} : date attendue impossible`);
          if (typeof expected === 'object' && !Array.isArray(expected)) {
            if ('input' in expected && !level.inputs.some((input) => input.id === expected.input))
              errors.push(`${prefix} : entrée ${expected.input} non déclarée`);
            if ('observation' in expected && !level.observations.includes(expected.observation))
              errors.push(`${prefix} : observation ${expected.observation} non déclarée`);
          }
        }
      }
      if (mechanic.kind === 'order') {
        unique(
          mechanic.cards.map((card) => card.id),
          `${prefix}/cartes`,
        );
        if (
          mechanic.expected.length !== mechanic.cards.length ||
          new Set(mechanic.expected).size !== mechanic.cards.length ||
          mechanic.expected.some((id) => !mechanic.cards.some((card) => card.id === id))
        )
          errors.push(`${prefix} : permutation invalide`);
      }
      if (
        mechanic.kind === 'match' &&
        mechanic.items.some(
          (item) => !mechanic.targets.some((target) => target.id === mechanic.expected[item.id]),
        )
      )
        errors.push(`${prefix} : association sans cible`);
      if (mechanic.kind === 'constraints') {
        unique(
          mechanic.projects.map((project) => project.id),
          `${prefix}/projets`,
        );
        if (
          mechanic.count > mechanic.projects.length ||
          mechanic.required.some((id) => !mechanic.projects.some((project) => project.id === id))
        )
          errors.push(`${prefix} : contraintes impossibles`);
      }
      if (mechanic.kind === 'program') {
        const width = mechanic.grid[0]?.length;
        if (mechanic.grid.some((row) => row.length !== width))
          errors.push(`${prefix} : grille non rectangulaire`);
        for (const [r, c] of [mechanic.start, mechanic.goal, ...mechanic.blocked])
          if (!mechanic.grid[r]?.[c]) errors.push(`${prefix} : case hors grille`);
        if (
          mechanic.blocked.some(([r, c]) =>
            [mechanic.start, mechanic.goal].some(([a, b]) => r === a && c === b),
          )
        )
          errors.push(`${prefix} : départ ou arrivée verrouillé`);
      }
    }
  }
  const ancestors = (id: string, visiting = new Set<string>()): Set<string> => {
    if (visiting.has(id)) {
      errors.push(`Campagne : cycle à ${id}`);
      return new Set();
    }
    const next = new Set(visiting).add(id);
    const required = entries.get(id)?.requires ?? [];
    return new Set(required.flatMap((parent) => [parent, ...ancestors(parent, next)]));
  };
  for (const entry of campaign.levels) {
    const level = levels[entry.id];
    if (!level) {
      errors.push(`Niveau absent : ${entry.id}`);
      continue;
    }
    const parents = ancestors(entry.id);
    for (const required of entry.requires)
      if (!entries.has(required)) errors.push(`${entry.id} : prérequis ${required} absent`);
    for (const input of level.inputs) {
      const binding = entry.bindings[input.id];
      const output =
        binding && levels[binding.level]?.outputs.find((output) => output.id === binding.output);
      if (!output || output.type !== input.type)
        errors.push(`${entry.id}/${input.id} : port absent ou incompatible`);
      if (binding && !parents.has(binding.level))
        errors.push(`${entry.id}/${input.id} : producteur non garanti par les prérequis`);
    }
    for (const input of Object.keys(entry.bindings))
      if (!level.inputs.some((port) => port.id === input))
        errors.push(`${entry.id}/${input} : binding sans entrée`);
  }
  return [...new Set(errors)];
}

export function parseCatalog(raw: {
  campaign: unknown;
  levels: unknown[];
  sites: unknown[];
}): Catalog {
  const parsedLevels = raw.levels.map((value) => levelSchema.parse(value));
  const parsedSites = raw.sites.map((value) => siteSchema.parse(value));
  if (new Set(parsedLevels.map((level) => level.id)).size !== parsedLevels.length)
    throw new Error('Identifiant de niveau dupliqué');
  if (new Set(parsedSites.map((site) => site.id)).size !== parsedSites.length)
    throw new Error('Identifiant de site dupliqué');
  const catalog: Catalog = {
    campaign: campaignSchema.parse(raw.campaign),
    levels: Object.fromEntries(parsedLevels.map((level) => [level.id, level])),
    sites: Object.fromEntries(parsedSites.map((site) => [site.id, site])),
  };
  const errors = validateCatalog(catalog);
  if (errors.length) throw new Error(errors.join('\n'));
  return catalog;
}

export function validateFixture(level: Level, raw: unknown) {
  const fixture = fixtureSchema.parse(raw);
  for (const input of level.inputs)
    if (fixture.inputs[input.id]?.type !== input.type)
      throw new Error(`${level.id} : fixture manquante ou incompatible pour ${input.id}`);
  return fixture.inputs;
}
