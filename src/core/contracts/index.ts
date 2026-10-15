import { z } from 'zod';

const id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/);
const text = z.string().min(1);
export const answerSchema = z.record(z.string(), z.union([z.string(), z.array(z.string())]));
export type Answer = z.infer<typeof answerSchema>;

const fragmentData = {
  OrigineHistorique: z.object({
    year: z.number().int(),
    institution: text,
    chronology: z.array(text),
    proof: text,
  }),
  NomHistorique: z.object({ acronym: text, plaintext: text }),
  TransitionInstitutionnelle: z.object({
    date: z.iso.date(),
    decree: text,
    evidence: z.array(text),
  }),
  ArchiveAnnonce: z.object({ date: z.iso.date(), location: text, key: text }),
  LexiqueTechnique: z.object({ words: z.array(text).length(4) }),
  VieEtudiante: z.object({ words: z.array(text).length(4) }),
  OrientationLecture: z.object({
    observed: z.number().int(),
    direction: z.enum(['forward', 'reverse']),
  }),
  CleTransmission: z.object({ word: text }),
  SelectionProjets: z.object({
    ids: z.array(text),
    budget: z.number(),
    pressure: z.number(),
    service: z.number(),
    fictional: z.literal(true),
  }),
  ProgrammeTransmission: z.object({ commands: z.array(text), trace: z.array(text), message: text }),
  MemoireRestauree: z.object({ year: z.literal(2068) }),
  ArchiveEst: z.object({ postalCode: text, historical: z.literal(true) }),
};
export const fragmentTypeSchema = z.enum(
  Object.keys(fragmentData) as [keyof typeof fragmentData, ...(keyof typeof fragmentData)[]],
);
export const fragmentSchema = z
  .object({
    id,
    type: fragmentTypeSchema,
    data: z.record(z.string(), z.unknown()),
    summary: text,
  })
  .superRefine((value, ctx) => {
    const result = fragmentData[value.type].safeParse(value.data);
    if (!result.success)
      for (const issue of result.error.issues)
        ctx.addIssue({ code: 'custom', path: ['data', ...issue.path], message: issue.message });
  });
export type Fragment = z.infer<typeof fragmentSchema>;
export const expectedSchema = z.union([
  z.string(),
  z.object({ input: id, path: id }),
  z.object({ observation: z.enum(['O1', 'O2']) }),
]);
const optionSchema = z.object({ id, label: text });
const fieldSchema = z.object({
  id,
  label: text,
  format: z.enum(['text', 'code', 'date', 'integer', 'choice', 'set']),
  options: z.array(optionSchema).default([]),
  expected: z.union([expectedSchema, z.array(z.string())]),
  error: text,
});
const formSchema = z.object({ kind: z.literal('form'), fields: z.array(fieldSchema).min(1) });
const orderSchema = z.object({
  kind: z.literal('order'),
  cards: z.array(optionSchema).min(2),
  expected: z.array(id).min(2),
  fields: z.array(fieldSchema).default([]),
});
const matchSchema = z.object({
  kind: z.literal('match'),
  items: z.array(optionSchema).min(1),
  targets: z.array(optionSchema).min(1),
  expected: z.record(z.string(), id),
});
const constraintSchema = z.object({
  kind: z.literal('constraints'),
  projects: z
    .array(
      z.object({
        id,
        label: text,
        budget: z.number().nonnegative(),
        pressure: z.number().nonnegative(),
        service: z.number().nonnegative(),
      }),
    )
    .min(1),
  count: z.number().int().positive(),
  required: z.array(id),
  maxBudget: z.number(),
  maxPressure: z.number(),
  minService: z.number(),
});
export const directionSchema = z.enum(['UP', 'DOWN', 'LEFT', 'RIGHT']);
export type Direction = z.infer<typeof directionSchema>;
const cell = z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]);
const programSchema = z.object({
  kind: z.literal('program'),
  grid: z.array(z.array(text).min(1)).min(1),
  start: cell,
  goal: cell,
  blocked: z.array(cell),
  program: z.array(directionSchema.nullable()).min(1),
  noRevisit: z.boolean(),
});
export const mechanicSchema = z.discriminatedUnion('kind', [
  formSchema,
  orderSchema,
  matchSchema,
  constraintSchema,
  programSchema,
]);
export type Mechanic = z.infer<typeof mechanicSchema>;
export type Field = z.infer<typeof fieldSchema>;
export const documentSchema = z.object({
  id,
  title: text,
  body: text,
  sourceIds: z.array(id),
  badge: z.enum(['fact', 'reconstruction', 'fiction']),
});
const dialogueNode = z.object({
  id,
  speaker: z.enum(['ARIIE', 'Nora', 'Système']),
  text,
  choices: z.array(z.object({ id, label: text, to: id.nullable() })).default([]),
});
export const levelSchema = z.object({
  contractVersion: z.literal(1),
  revision: z.number().int().positive(),
  id,
  title: text,
  era: z.enum(['prologue', 'past', 'present', 'future', 'extension']),
  status: z.enum(['draft', 'prototype', 'ready']),
  minutes: z.number().positive(),
  inputs: z.array(z.object({ id, type: fragmentTypeSchema })),
  observations: z.array(z.enum(['O1', 'O2'])),
  documents: z.array(documentSchema),
  dialogue: z.object({
    entry: id,
    nodes: z.array(dialogueNode).min(1),
    success: text,
    return: text,
  }),
  hints: z.array(text).length(3),
  solution: text,
  capsule: text,
  outputs: z.array(fragmentSchema),
  steps: z
    .array(
      z.object({
        id,
        title: text,
        instruction: text,
        documentIds: z.array(id),
        mechanic: mechanicSchema,
      }),
    )
    .min(1),
});
export type Level = z.infer<typeof levelSchema>;
export const campaignSchema = z.object({
  id,
  revision: z.number().int().positive(),
  title: text,
  finalLevel: id,
  levels: z
    .array(
      z.object({
        id,
        requires: z.array(id),
        points: z.union([z.literal(0), z.literal(10)]),
        bindings: z.record(z.string(), z.object({ level: id, output: id })),
      }),
    )
    .min(1),
});
export type Campaign = z.infer<typeof campaignSchema>;
export const siteSchema = z.object({
  id,
  revision: z.number().int().positive(),
  title: text,
  verified: z.boolean(),
  observations: z.object({
    O1: z.number().int().min(1).max(9),
    O2: z.number().int().nonnegative(),
  }),
});
export type Site = z.infer<typeof siteSchema>;
export const fixtureSchema = z.object({ inputs: z.record(z.string(), fragmentSchema) });
export type Inputs = z.infer<typeof fixtureSchema>['inputs'];
export type Context = { inputs: Inputs; site: Site };
export type Evaluation = {
  status: 'format' | 'incorrect' | 'partial' | 'correct';
  messages: string[];
  trace?: string[];
};
