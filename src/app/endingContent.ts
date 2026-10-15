import { z } from 'zod';
import type { Level } from '../core/contracts';
import type { EndingCopy } from '../presentation/components/EndingView';

const text = z.string().min(1);
const line = z.object({ speaker: z.enum(['ARIIE', 'Nora']), text });
const variant = z.object({ title: text, lines: z.array(line).length(2) });
const schema = z.object({
  version: z.literal(1),
  title: text,
  fictionNotice: text,
  opening: z.array(line.extend({ id: text })).length(3),
  variants: z.object({
    lucidite: variant,
    sobriete: variant,
    partage: variant,
    'horizon-commun': variant,
  }),
  commitments: z
    .array(
      z.object({
        questionId: text,
        optionId: text,
        theme: z.enum(['lucidite', 'sobriete', 'partage']),
        text,
      }),
    )
    .length(9),
  timeline: z
    .array(z.object({ year: z.number().int(), text, sourceIds: z.array(text).min(1) }))
    .length(4),
  projection: text,
  message: line.extend({
    maxLength: z.literal(500),
    saveLabel: text,
    skipLabel: text,
    privacy: text,
  }),
  closing: line,
  actions: z.object({ memory: text, export: text, home: text }),
  exportNotice: text,
});
export function parseEndingCopy(
  value: unknown,
  council: Level,
  sources: Record<string, { title: string; url: string }>,
): EndingCopy {
  const copy = schema.parse(value);
  const options =
    council.narrative?.questions.flatMap((q) =>
      q.options.map((o) => ({
        questionId: q.id,
        optionId: o.id,
        theme: o.theme,
        text: o.commitment,
      })),
    ) ?? [];
  if (JSON.stringify(options) !== JSON.stringify(copy.commitments))
    throw new Error(
      'Les neuf engagements de fin doivent correspondre au Conseil dans l’ordre C1–C3.',
    );
  for (const entry of copy.timeline)
    for (const id of entry.sourceIds)
      if (!sources[id]) throw new Error(`Source de frise absente : ${id}`);
  if (copy.timeline.map((entry) => entry.year).join(',') !== '1968,1973,1984,2006')
    throw new Error('Frise historique incohérente.');
  return copy;
}
