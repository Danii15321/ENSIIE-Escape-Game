import type { Answer, Context, Evaluation, Field, Mechanic } from '../contracts';
import { evaluateCircuit } from './circuit';
import { evaluateEvidence } from './evidence';
import { evaluateWordGrid } from './wordgrid';

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function normalizeDate(value: string): string | null {
  const input = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  const fr = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(input);
  const compact = /^(\d{2})(\d{2})(\d{4})$/.exec(input);
  const parts = iso
    ? [iso[1], iso[2], iso[3]]
    : fr
      ? [fr[3], fr[2], fr[1]]
      : compact
        ? [compact[3], compact[2], compact[1]]
        : null;
  if (!parts) return null;
  const [year, month, day] = parts.map(Number) as [number, number, number];
  if (year < 1000 || year > 9999) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    : null;
}

function expected(field: Field, context: Context): string | string[] {
  const value = field.expected;
  if (typeof value === 'string' || Array.isArray(value)) return value;
  if ('observation' in value) return String(context.site.observations[value.observation]);
  if ('parityOf' in value)
    return context.site.observations[value.parityOf] % 2 === 0 ? value.even : value.odd;
  const data = context.inputs[value.input]?.data[value.path];
  if (typeof data !== 'string' && typeof data !== 'number')
    throw new Error(`Entrée absente ou non scalaire : ${value.input}.${value.path}`);
  return String(data);
}

function fieldsResult(fields: Field[], answer: Answer, context: Context): Evaluation {
  const messages: string[] = [];
  let format = false;
  let correct = 0;
  for (const field of fields) {
    const received = answer[field.id];
    const target = expected(field, context);
    let valid = false;
    if (field.format === 'set') {
      valid =
        Array.isArray(received) &&
        Array.isArray(target) &&
        new Set(received).size === received.length &&
        received.length === target.length &&
        target.every((item) => received.includes(item));
    } else if (typeof received !== 'string' || !received.trim()) {
      format = true;
    } else if (field.format === 'date') {
      const canonical = normalizeDate(received);
      if (!canonical) format = true;
      valid = canonical !== null && canonical === normalizeDate(String(target));
    } else if (field.format === 'integer') {
      if (!/^\d+$/.test(received.trim())) format = true;
      else valid = Number(received) === Number(target);
    } else if (field.format === 'code' || field.format === 'choice') {
      valid = received.trim() === target;
    } else valid = normalizeText(received) === normalizeText(String(target));
    const trap =
      typeof received === 'string' &&
      field.traps.find((trap) => normalizeText(trap.value) === normalizeText(received));
    if (!valid) messages.push(`${field.label} : ${trap ? trap.error : field.error}`);
    else correct++;
  }
  return {
    status:
      messages.length === 0 ? 'correct' : format ? 'format' : correct > 0 ? 'partial' : 'incorrect',
    messages,
  };
}

export function projectTotals(mechanic: Extract<Mechanic, { kind: 'constraints' }>, ids: string[]) {
  return mechanic.projects
    .filter((project) => ids.includes(project.id))
    .reduce(
      (sum, project) => ({
        budget: sum.budget + project.budget,
        pressure: sum.pressure + project.pressure,
        service: sum.service + project.service,
      }),
      { budget: 0, pressure: 0, service: 0 },
    );
}

export function simulateProgram(
  mechanic: Extract<Mechanic, { kind: 'program' }>,
  answer: Answer,
): Evaluation {
  let [row, col] = mechanic.start;
  const trace = [`${mechanic.grid[row]?.[col]} (${row + 1},${col + 1})`];
  const visited = new Set([`${row},${col}`]);
  let message = '';
  const moves = { UP: [-1, 0], DOWN: [1, 0], LEFT: [0, -1], RIGHT: [0, 1] } as const;
  for (let i = 0; i < mechanic.program.length; i++) {
    const direction = mechanic.program[i] ?? answer[`command-${i}`];
    if (typeof direction !== 'string' || !Object.hasOwn(moves, direction))
      return { status: 'format', messages: [`Complétez l’instruction ${i + 1}.`], trace };
    const move = moves[direction as keyof typeof moves];
    row += move[0];
    col += move[1];
    const letter = mechanic.grid[row]?.[col];
    const fail = (reason: string): Evaluation => ({
      status: 'incorrect',
      messages: [`Instruction ${i + 1} : ${reason}.`],
      trace,
    });
    if (!letter) return fail('sortie de la grille');
    if (mechanic.blocked.some(([r, c]) => r === row && c === col)) return fail('case verrouillée');
    if (mechanic.noRevisit && visited.has(`${row},${col}`)) return fail('case déjà visitée');
    visited.add(`${row},${col}`);
    message += letter;
    trace.push(`${letter} (${row + 1},${col + 1})`);
  }
  if (row !== mechanic.goal[0] || col !== mechanic.goal[1])
    return {
      status: 'incorrect',
      messages: ['Le programme ne termine pas sur la case d’arrivée.'],
      trace,
    };
  if (normalizeText(String(answer.message ?? '')) !== normalizeText(message))
    return {
      status: 'partial',
      messages: ['Le trajet est valide. Notez seulement les lettres d’arrivée, sans le départ.'],
      trace,
    };
  return { status: 'correct', messages: ['Trajet et message vérifiés.'], trace };
}

export function evaluate(mechanic: Mechanic, answer: Answer, context: Context): Evaluation {
  switch (mechanic.kind) {
    case 'form':
      return fieldsResult(mechanic.fields, answer, context);
    case 'order': {
      const result = fieldsResult(mechanic.fields, answer, context);
      const order = answer.order ?? mechanic.cards.map((card) => card.id);
      if (
        !Array.isArray(order) ||
        order.length !== mechanic.expected.length ||
        !order.every((id, index) => id === mechanic.expected[index])
      ) {
        return {
          status: result.status === 'format' ? 'format' : 'incorrect',
          messages: ['L’ordre des cartes ne correspond pas aux notices.', ...result.messages],
        };
      }
      return result;
    }
    case 'match': {
      const missing = mechanic.items.filter(
        (item) => answer[item.id] !== mechanic.expected[item.id],
      );
      return {
        status:
          missing.length === 0
            ? 'correct'
            : missing.length < mechanic.items.length
              ? 'partial'
              : 'incorrect',
        messages: missing.map((item) =>
          mechanic.error
            ? `${item.label} : ${mechanic.error}`
            : `Vérifiez l’association : ${item.label}.`,
        ),
      };
    }
    case 'constraints': {
      const ids = answer.projects;
      if (
        !Array.isArray(ids) ||
        new Set(ids).size !== ids.length ||
        ids.some((id) => !mechanic.projects.some((project) => project.id === id))
      )
        return { status: 'format', messages: ['Choisissez des projets distincts dans la liste.'] };
      const totals = projectTotals(mechanic, ids);
      const messages: string[] = [];
      if (ids.length !== mechanic.count)
        messages.push(`Choisissez exactement ${mechanic.count} projets.`);
      if (!mechanic.required.every((id) => ids.includes(id)))
        messages.push(`Projet obligatoire manquant : ${mechanic.required.join(', ')}.`);
      if (totals.budget > mechanic.maxBudget)
        messages.push(`Budget : ${totals.budget} sur un maximum de ${mechanic.maxBudget}.`);
      if (totals.pressure > mechanic.maxPressure)
        messages.push(`Pression : ${totals.pressure} sur un maximum de ${mechanic.maxPressure}.`);
      if (totals.service < mechanic.minService)
        messages.push(`Service : ${totals.service} pour un minimum de ${mechanic.minService}.`);
      return { status: messages.length ? 'incorrect' : 'correct', messages };
    }
    case 'program':
      return simulateProgram(mechanic, answer);
    case 'circuit':
      return evaluateCircuit(mechanic, answer);
    case 'wordgrid':
      return evaluateWordGrid(mechanic, answer, context.inputs);
    case 'evidence':
      return evaluateEvidence(mechanic, answer, context.inputs);
  }
}

export function caesar(plaintext: string, shift: number): string {
  return plaintext.replace(/[A-Z]/g, (letter) =>
    String.fromCharCode(65 + ((((letter.charCodeAt(0) - 65 + shift) % 26) + 26) % 26)),
  );
}
