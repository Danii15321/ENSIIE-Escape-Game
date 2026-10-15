import {
  campaignSchema,
  deriveRules,
  fixtureSchema,
  levelSchema,
  siteSchema,
  type Campaign,
  type Inputs,
  type Level,
  type Mechanic,
  type Site,
} from '../contracts';
import { normalizeDate, normalizeText } from '../validation/mechanics';

export type Catalog = {
  campaign: Campaign;
  levels: Record<string, Level>;
  sites: Record<string, Site>;
};

function circuitErrors(mechanic: Extract<Mechanic, { kind: 'circuit' }>, prefix: string) {
  const errors: string[] = [];
  const ids = mechanic.modules.map((module) => module.id);
  if (new Set([...ids, mechanic.source.id, mechanic.target.id]).size !== ids.length + 2)
    errors.push(`${prefix} : identifiant de circuit dupliqué`);
  if (
    mechanic.expected.length !== ids.length ||
    new Set(mechanic.expected).size !== ids.length ||
    mechanic.expected.some((id) => !ids.includes(id))
  )
    errors.push(`${prefix} : chaîne attendue invalide`);
  else {
    const chain = mechanic.expected.map((id) => mechanic.modules.find((m) => m.id === id)!);
    const types = [mechanic.source.type, ...chain.flatMap((m) => [m.input, m.output])];
    types.push(mechanic.target.type);
    for (let i = 0; i < types.length; i += 2)
      if (types[i] !== types[i + 1]) errors.push(`${prefix} : chaîne attendue mal typée`);
  }
  return errors;
}

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
          if (
            typeof expected === 'string' &&
            field.traps.some((trap) => normalizeText(trap.value) === normalizeText(expected))
          )
            errors.push(`${prefix}/${field.id} : piège identique à la réponse`);
          if (typeof expected === 'object' && !Array.isArray(expected)) {
            if ('input' in expected && !level.inputs.some((input) => input.id === expected.input))
              errors.push(`${prefix} : entrée ${expected.input} non déclarée`);
            if ('observation' in expected && !level.observations.includes(expected.observation))
              errors.push(`${prefix} : observation ${expected.observation} non déclarée`);
            if ('parityOf' in expected) {
              if (!level.observations.includes(expected.parityOf))
                errors.push(`${prefix} : observation ${expected.parityOf} non déclarée`);
              if (
                field.format === 'choice' &&
                [expected.even, expected.odd].some(
                  (value) => !field.options.some((option) => option.id === value),
                )
              )
                errors.push(`${prefix}/${field.id} : option de parité absente`);
            }
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
      if (mechanic.kind === 'circuit') errors.push(...circuitErrors(mechanic, prefix));
      if (mechanic.kind === 'evidence') {
        unique(
          mechanic.proofs.map((proof) => proof.id),
          `${prefix}/preuves`,
        );
        unique(
          mechanic.claims.map((claim) => claim.id),
          `${prefix}/affirmations`,
        );
        for (const proof of mechanic.proofs)
          if (!level.inputs.some((input) => input.id === proof.source.input))
            errors.push(`${prefix} : entrée ${proof.source.input} non déclarée`);
        for (const claim of mechanic.claims) {
          if (!mechanic.decisions.some((decision) => decision.id === claim.decision))
            errors.push(`${prefix}/${claim.id} : décision attendue absente`);
          if (
            new Set(claim.proofs).size !== claim.proofs.length ||
            claim.proofs.some((id) => !mechanic.proofs.some((proof) => proof.id === id))
          )
            errors.push(`${prefix}/${claim.id} : preuve attendue absente ou dupliquée`);
        }
      }
      if (mechanic.kind === 'wordgrid') {
        if (mechanic.rows.some((row) => row.length !== mechanic.rows[0]!.length))
          errors.push(`${prefix} : grille de mots non rectangulaire`);
        const refs = [...mechanic.words, mechanic.orientation].filter(
          (ref) => typeof ref === 'object',
        );
        for (const ref of refs)
          if (!level.inputs.some((input) => input.id === ref.input))
            errors.push(`${prefix} : entrée ${ref.input} non déclarée`);
      }
    }
    if (level.narrative) {
      unique(
        level.narrative.questions.map((question) => question.id),
        `${prefix}/questions`,
      );
      for (const question of level.narrative.questions)
        unique(
          question.options.map((option) => option.id),
          `${prefix}/${question.id}/options`,
        );
    }
    for (const output of level.outputs)
      if (output.derive) {
        if (deriveRules[output.derive.rule] !== output.type)
          errors.push(`${prefix}/${output.id} : règle ${output.derive.rule} incompatible`);
        if (!level.observations.includes(output.derive.observation))
          errors.push(
            `${prefix}/${output.id} : observation ${output.derive.observation} non déclarée`,
          );
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
    for (const required of entry.requires) {
      if (!entries.has(required)) errors.push(`${entry.id} : prérequis ${required} absent`);
      if (levels[required]?.narrative)
        errors.push(`${entry.id} : un niveau narratif ne peut pas être un prérequis`);
    }
    if (level.narrative && entry.points !== 0)
      errors.push(`${entry.id} : un niveau narratif ne donne aucun point`);
    if (level.narrative && entry.id === campaign.finalLevel)
      errors.push(`${entry.id} : un niveau narratif ne peut pas être le final`);
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

export function validateFixture(level: Level, raw: unknown, siteId?: string): Inputs {
  const fixture = fixtureSchema.parse(raw);
  for (const [site, overrides] of Object.entries(fixture.sites))
    for (const [port, fragment] of Object.entries(overrides)) {
      const input = level.inputs.find((input) => input.id === port);
      if (input?.type !== fragment.type)
        throw new Error(`${level.id} : fixture ${site} incompatible pour ${port}`);
    }
  const inputs = { ...fixture.inputs, ...(siteId ? fixture.sites[siteId] : undefined) };
  for (const input of level.inputs)
    if (inputs[input.id]?.type !== input.type)
      throw new Error(`${level.id} : fixture manquante ou incompatible pour ${input.id}`);
  return inputs;
}
