import { useState } from 'react';
import type { Answer, Inputs, Mechanic } from '../../core/contracts';
import {
  formatSegment,
  INACTIVE,
  matchSegment,
  readSegments,
  wordGridLayout,
  type Cell,
  type GridLayout,
} from '../../core/validation/wordgrid';

type Props = {
  mechanic: Extract<Mechanic, { kind: 'wordgrid' }>;
  answer: Answer;
  inputs: Inputs;
  onChange: (answer: Answer) => void;
};

export function WordGridBoard({ mechanic, answer, inputs, onChange }: Props) {
  const [start, setStart] = useState<Cell | null>(null);
  const [notice, setNotice] = useState('');
  let layout: GridLayout;
  try {
    layout = wordGridLayout(mechanic, inputs);
  } catch (error) {
    return <p role="alert">Grille indisponible : {String(error)}</p>;
  }
  const segments = Array.isArray(answer.segments) ? answer.segments : [];
  const { matches } = readSegments(layout, segments);
  const struck = new Set(matches.flatMap((match) => match.cells.map(([r, c]) => `${r},${c}`)));
  const select = (cell: Cell) => {
    if (!start) {
      setStart(cell);
      setNotice(
        `Départ : ligne ${cell[0] + 1}, colonne ${cell[1] + 1}. Choisissez la case de fin.`,
      );
      return;
    }
    setStart(null);
    const match = matchSegment(layout, start, cell, matches);
    if (!match) {
      setNotice(mechanic.feedback.select);
      return;
    }
    setNotice(`${match.word} retiré.`);
    onChange({ ...answer, segments: [...segments, formatSegment(start, cell)] });
  };
  const remove = (index: number) =>
    onChange({ ...answer, segments: segments.filter((_, i) => i !== index) });
  return (
    <>
      <p>
        Mots du carnet :{' '}
        {layout.words
          .map(
            (word) => `${word} (${matches.some((m) => m.word === word) ? 'retiré' : 'à trouver'})`,
          )
          .join(', ')}
      </p>
      <div className="table-scroll">
        <table className="word-grid">
          <caption>Mur de mémoire, lignes et colonnes numérotées</caption>
          <thead>
            <tr>
              <th scope="col">L / C</th>
              {layout.grid[0]!.map((_, c) => (
                <th scope="col" key={c}>
                  {c + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {layout.grid.map((row, r) => (
              <tr key={r}>
                <th scope="row">{r + 1}</th>
                {row.map((letter, c) => {
                  const position = `ligne ${r + 1}, colonne ${c + 1}`;
                  if (letter === INACTIVE)
                    return (
                      <td key={c} aria-label={`${position} : case vide`}>
                        ·
                      </td>
                    );
                  const isStruck = struck.has(`${r},${c}`);
                  const isStart = start?.[0] === r && start?.[1] === c;
                  return (
                    <td key={c}>
                      <button
                        type="button"
                        className={isStruck ? 'struck' : undefined}
                        aria-pressed={isStart}
                        aria-label={`${position} : ${letter}${isStruck ? ', barrée' : ''}${isStart ? ', départ choisi' : ''}`}
                        onClick={() => select([r, c])}
                      >
                        {isStruck ? <s>{letter}</s> : letter}
                        {isStart ? '*' : ''}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p role="status">{notice}</p>
      {start ? (
        <button
          type="button"
          onClick={() => {
            setStart(null);
            setNotice('Sélection annulée.');
          }}
        >
          Annuler la case de départ
        </button>
      ) : null}
      {segments.length ? (
        <ul aria-label="Segments retenus">
          {segments.map((segment, index) => (
            <li key={segment}>
              {matches.find((m) => formatSegment(m.cells[0]!, m.cells.at(-1)!) === segment)?.word ??
                'Segment'}{' '}
              ({segment.replace('-', ' → ')})
              <button type="button" onClick={() => remove(index)}>
                Retirer
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <label>
        Message des cases restantes
        <input
          value={typeof answer.message === 'string' ? answer.message : ''}
          onChange={(event) => onChange({ ...answer, message: event.target.value })}
          autoComplete="off"
        />
      </label>
    </>
  );
}
