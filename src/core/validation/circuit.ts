import type { Answer, Evaluation, Mechanic } from '../contracts';

type Circuit = Extract<Mechanic, { kind: 'circuit' }>;
type Socket = { id: string; label: string; type: string };

export const linkKey = (fromId: string) => `link-${fromId}`;

export function circuitSockets(mechanic: Circuit) {
  const outputs: Socket[] = [
    { id: mechanic.source.id, label: mechanic.source.label, type: mechanic.source.type },
    ...mechanic.modules.map((module) => ({
      id: module.id,
      label: module.label,
      type: module.output,
    })),
  ];
  const inputs: Socket[] = [
    ...mechanic.modules.map((module) => ({
      id: module.id,
      label: module.label,
      type: module.input,
    })),
    { id: mechanic.target.id, label: mechanic.target.label, type: mechanic.target.type },
  ];
  return { outputs, inputs };
}

export function evaluateCircuit(mechanic: Circuit, answer: Answer): Evaluation {
  const { outputs, inputs } = circuitSockets(mechanic);
  const links = new Map<string, string>();
  for (const output of outputs) {
    const to = answer[linkKey(output.id)];
    if (typeof to === 'string' && to !== '') links.set(output.id, to);
  }
  if (links.size === 0) return { status: 'format', messages: [mechanic.feedback.incomplete] };

  let compatible = 0;
  let mismatch = false;
  const fed = new Set<string>();
  let duplicated = false;
  for (const [from, to] of links) {
    const input = inputs.find((socket) => socket.id === to);
    if (!input || to === from)
      return {
        status: 'format',
        messages: ['Choisissez une entrée de la liste, distincte du module.'],
      };
    if (fed.has(to)) duplicated = true;
    fed.add(to);
    if (outputs.find((socket) => socket.id === from)!.type === input.type) compatible++;
    else mismatch = true;
  }
  const messages: string[] = [];
  if (mismatch) messages.push(mechanic.feedback.link);
  if (duplicated) messages.push('Une entrée ne peut recevoir qu’une seule liaison.');

  const path: string[] = [];
  let cursor = mechanic.source.id;
  const seen = new Set<string>([cursor]);
  while (links.has(cursor)) {
    cursor = links.get(cursor)!;
    if (seen.has(cursor)) break;
    seen.add(cursor);
    if (cursor === mechanic.target.id) break;
    path.push(cursor);
  }
  const complete =
    cursor === mechanic.target.id &&
    path.length === mechanic.expected.length &&
    path.every((id, index) => id === mechanic.expected[index]);
  if (!complete && !mismatch) messages.push(mechanic.feedback.incomplete);
  if (messages.length) return { status: compatible > 0 ? 'partial' : 'incorrect', messages };
  const label = (id: string) => mechanic.modules.find((module) => module.id === id)!.label;
  return {
    status: 'correct',
    messages: ['Circuit cohérent : l’impulsion traverse toutes les liaisons.'],
    trace: [mechanic.source.type, ...path.map(label), mechanic.target.type],
  };
}
