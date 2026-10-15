import type { Answer, Evaluation, Inputs, Mechanic } from '../contracts';

type WordGrid = Extract<Mechanic, { kind: 'wordgrid' }>;
export type Cell = [number, number];
export type Direction = 'forward' | 'reverse';
export type GridLayout = {
  grid: string[][];
  words: string[];
  direction: Direction;
  residue: Cell[];
};
export type Match = { word: string; cells: Cell[] };

export const INACTIVE = '.';
const key = ([row, col]: Cell) => `${row},${col}`;
const reversed = (value: string) => [...value].reverse().join('');

export function parseSegment(value: string): [Cell, Cell] | null {
  const match = /^\s*(\d+)\s*,\s*(\d+)\s*-\s*(\d+)\s*,\s*(\d+)\s*$/.exec(value);
  if (!match) return null;
  const [r1, c1, r2, c2] = match.slice(1).map((part) => Number(part) - 1) as number[];
  if ([r1, c1, r2, c2].some((part) => part! < 0)) return null;
  return [
    [r1!, c1!],
    [r2!, c2!],
  ];
}

export const formatSegment = (from: Cell, to: Cell) =>
  `${from[0] + 1},${from[1] + 1}-${to[0] + 1},${to[1] + 1}`;

export function segmentCells(from: Cell, to: Cell): Cell[] | null {
  const [dr, dc] = [Math.sign(to[0] - from[0]), Math.sign(to[1] - from[1])];
  if ((dr !== 0 && dc !== 0) || (dr === 0 && dc === 0)) return null;
  const length = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])) + 1;
  return Array.from({ length }, (_, i): Cell => [from[0] + dr * i, from[1] + dc * i]);
}

function readCells(grid: string[][], cells: Cell[]): string | null {
  let letters = '';
  for (const [row, col] of cells) {
    const letter = grid[row]?.[col];
    if (!letter || letter === INACTIVE) return null;
    letters += letter;
  }
  return letters;
}

function placements(grid: string[][], word: string): Cell[][] {
  const found = new Map<string, Cell[]>();
  const height = grid.length;
  const width = grid[0]!.length;
  for (let row = 0; row < height; row++)
    for (let col = 0; col < width; col++)
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
      ] as const) {
        const end: Cell = [row + dr * (word.length - 1), col + dc * (word.length - 1)];
        if (end[0] >= height || end[1] >= width) continue;
        const cells = segmentCells([row, col], end) ?? [[row, col] as Cell];
        const letters = readCells(grid, cells);
        if (letters === word || letters === reversed(word))
          found.set(cells.map(key).join('|'), cells);
      }
  return [...found.values()];
}

function resolveWords(mechanic: WordGrid, inputs: Inputs): string[] {
  return mechanic.words.flatMap((source) => {
    if (typeof source === 'string') return [source];
    const value = inputs[source.input]?.data[source.path];
    const list = typeof value === 'string' ? [value] : Array.isArray(value) ? value : null;
    if (!list || !list.every((word) => typeof word === 'string' && /^[A-Z]+$/.test(word)))
      throw new Error(`Entrée absente ou invalide : ${source.input}.${source.path}`);
    return list as string[];
  });
}

function resolveDirection(mechanic: WordGrid, inputs: Inputs): Direction {
  const source = mechanic.orientation;
  const value = typeof source === 'string' ? source : inputs[source.input]?.data[source.path];
  if (value !== 'forward' && value !== 'reverse')
    throw new Error('Sens de lecture absent ou invalide');
  return value;
}

function locate(grid: string[][], words: string[]): Cell[] {
  const covered = new Set<string>();
  for (const word of words) {
    const found = placements(grid, word);
    if (found.length !== 1)
      throw new Error(`Mot ${word} : ${found.length} emplacements dans la grille au lieu d’un`);
    for (const cell of found[0]!) {
      if (covered.has(key(cell))) throw new Error(`Mot ${word} : chevauchement`);
      covered.add(key(cell));
    }
  }
  const residue: Cell[] = [];
  grid.forEach((row, r) =>
    row.forEach((letter, c) => {
      if (letter !== INACTIVE && !covered.has(key([r, c]))) residue.push([r, c]);
    }),
  );
  return residue;
}

export function wordGridLayout(mechanic: WordGrid, inputs: Inputs): GridLayout {
  const base = mechanic.rows.map((row) => [...row]);
  if (base.some((row) => row.length !== base[0]!.length))
    throw new Error('Grille de mots non rectangulaire');
  const words = resolveWords(mechanic, inputs);
  if (new Set(words).size !== words.length) throw new Error('Mot dupliqué dans la liste');
  const residue = locate(base, words);
  if (readCells(base, residue) !== mechanic.message)
    throw new Error('Les cases restantes ne forment pas le message en lecture normale');
  const direction = resolveDirection(mechanic, inputs);
  const grid = base.map((row) => [...row]);
  if (direction === 'reverse') {
    const letters = [...reversed(mechanic.message)];
    residue.forEach(([r, c], index) => (grid[r]![c] = letters[index]!));
    locate(grid, words);
  }
  return { grid, words, direction, residue };
}

export function matchSegment(
  layout: GridLayout,
  from: Cell,
  to: Cell,
  taken: Match[],
): Match | null {
  const cells = segmentCells(from, to);
  const letters = cells && readCells(layout.grid, cells);
  if (!cells || !letters) return null;
  const word = layout.words.find((word) => word === letters || word === reversed(letters));
  if (!word || taken.some((match) => match.word === word)) return null;
  const used = new Set(taken.flatMap((match) => match.cells.map(key)));
  if (cells.some((cell) => used.has(key(cell)))) return null;
  return { word, cells };
}

export function readSegments(
  layout: GridLayout,
  segments: string[],
): { matches: Match[]; invalid: number } {
  const matches: Match[] = [];
  let invalid = 0;
  for (const segment of segments) {
    const parsed = parseSegment(segment);
    const match = parsed && matchSegment(layout, parsed[0], parsed[1], matches);
    if (match) matches.push(match);
    else invalid++;
  }
  return { matches, invalid };
}

export function evaluateWordGrid(mechanic: WordGrid, answer: Answer, inputs: Inputs): Evaluation {
  const layout = wordGridLayout(mechanic, inputs);
  const segments = answer.segments ?? [];
  if (!Array.isArray(segments)) return { status: 'format', messages: [mechanic.feedback.select] };
  const { matches, invalid } = readSegments(layout, segments);
  const message = typeof answer.message === 'string' ? answer.message.replace(/\s+/g, '') : '';
  const progress = matches.length > 0 ? 'partial' : 'incorrect';
  if (invalid > 0) return { status: progress, messages: [mechanic.feedback.select] };
  if (matches.length < layout.words.length)
    return {
      status: matches.length === 0 && !message ? 'format' : progress,
      messages: [mechanic.feedback.missing],
    };
  const received = message.toUpperCase();
  if (received === mechanic.message)
    return { status: 'correct', messages: ['Mots retirés et message extrait.'] };
  if (received === reversed(mechanic.message))
    return { status: 'partial', messages: [mechanic.feedback.near[layout.direction]] };
  return { status: received ? 'partial' : 'format', messages: [mechanic.feedback.error] };
}
