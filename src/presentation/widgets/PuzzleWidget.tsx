import type { Answer, Field, Inputs, Mechanic } from '../../core/contracts';
import { projectTotals } from '../../core/validation/mechanics';
import { CircuitBoard } from './CircuitBoard';
import { WordGridBoard } from './WordGridBoard';

type Props = {
  mechanic: Mechanic;
  answer: Answer;
  inputs: Inputs;
  onChange: (answer: Answer) => void;
};
const selected = (value: Answer[string] | undefined): string[] =>
  Array.isArray(value) ? value : [];

function Fields({
  fields,
  answer,
  onChange,
}: Pick<Props, 'answer' | 'onChange'> & { fields: Field[] }) {
  return (
    <div className="fields">
      {fields.map((field) => {
        const value = answer[field.id];
        const set = (next: string | string[]) => onChange({ ...answer, [field.id]: next });
        if (field.format === 'set')
          return (
            <fieldset key={field.id}>
              <legend>{field.label}</legend>
              {field.options.map((option) => (
                <label className="check" key={option.id}>
                  <input
                    type="checkbox"
                    checked={selected(value).includes(option.id)}
                    onChange={(event) =>
                      set(
                        event.target.checked
                          ? [...selected(value), option.id]
                          : selected(value).filter((id) => id !== option.id),
                      )
                    }
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
          );
        return (
          <label key={field.id}>
            {field.label}
            {field.format === 'choice' ? (
              <select
                value={typeof value === 'string' ? value : ''}
                onChange={(event) => set(event.target.value)}
              >
                <option value="">Choisir…</option>
                {field.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={typeof value === 'string' ? value : ''}
                onChange={(event) => set(event.target.value)}
                inputMode={
                  field.format === 'integer' || field.format === 'code' ? 'numeric' : 'text'
                }
                placeholder={field.format === 'date' ? 'JJ/MM/AAAA' : undefined}
                autoComplete="off"
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

export function PuzzleWidget({ mechanic, answer, inputs, onChange }: Props) {
  switch (mechanic.kind) {
    case 'form':
      return <Fields fields={mechanic.fields} answer={answer} onChange={onChange} />;
    case 'order': {
      const order = Array.isArray(answer.order)
        ? answer.order
        : mechanic.cards.map((card) => card.id);
      const move = (index: number, offset: number) => {
        const next = [...order];
        [next[index], next[index + offset]] = [next[index + offset]!, next[index]!];
        onChange({ ...answer, order: next });
      };
      return (
        <>
          <ol className="order">
            {order.map((id, index) => (
              <li key={id}>
                <span>{mechanic.cards.find((card) => card.id === id)?.label}</span>
                <div className="row">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Monter la carte ${index + 1}`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === order.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Descendre la carte ${index + 1}`}
                  >
                    ↓
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <Fields fields={mechanic.fields} answer={answer} onChange={onChange} />
        </>
      );
    }
    case 'match':
      return (
        <div className="fields">
          {mechanic.items.map((item) => (
            <label key={item.id}>
              {item.label}
              <select
                value={String(answer[item.id] ?? '')}
                onChange={(event) => onChange({ ...answer, [item.id]: event.target.value })}
              >
                <option value="">Associer…</option>
                {mechanic.targets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      );
    case 'constraints': {
      const ids = selected(answer.projects);
      const totals = projectTotals(mechanic, ids);
      return (
        <>
          <fieldset>
            <legend>Projets — points de simulation</legend>
            {mechanic.projects.map((project) => (
              <label className="project" key={project.id}>
                <input
                  type="checkbox"
                  checked={ids.includes(project.id)}
                  onChange={(event) =>
                    onChange({
                      ...answer,
                      projects: event.target.checked
                        ? [...ids, project.id]
                        : ids.filter((id) => id !== project.id),
                    })
                  }
                />
                <span>
                  <strong>
                    {project.id} · {project.label}
                  </strong>
                  <small>
                    Budget {project.budget} · Pression {project.pressure} · Service{' '}
                    {project.service}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <p role="status">
            {ids.length}/{mechanic.count} projets · Budget {totals.budget}/{mechanic.maxBudget} ·
            Pression {totals.pressure}/{mechanic.maxPressure} · Service {totals.service}/
            {mechanic.minService} minimum
          </p>
        </>
      );
    }
    case 'program':
      return (
        <>
          <div className="table-scroll">
            <table>
              <caption>Plan de l’archiviste — grille fictive</caption>
              <thead>
                <tr>
                  <th scope="col">Ligne</th>
                  {mechanic.grid[0]!.map((_, c) => (
                    <th scope="col" key={c}>
                      {c + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mechanic.grid.map((row, r) => (
                  <tr key={r}>
                    <th scope="row">{r + 1}</th>
                    {row.map((letter, c) => (
                      <td key={c}>
                        {letter}
                        {mechanic.blocked.some(([a, b]) => a === r && b === c)
                          ? ' · verrouillée'
                          : mechanic.start[0] === r && mechanic.start[1] === c
                            ? ' · départ'
                            : mechanic.goal[0] === r && mechanic.goal[1] === c
                              ? ' · arrivée'
                              : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ol>
            {mechanic.program.map((command, i) => (
              <li key={i}>
                {command ? (
                  <p>
                    {{ UP: 'Monter', DOWN: 'Descendre', LEFT: 'Gauche', RIGHT: 'Droite' }[command]}
                  </p>
                ) : (
                  <label>
                    Instruction {i + 1}
                    <select
                      value={String(answer[`command-${i}`] ?? '')}
                      onChange={(event) =>
                        onChange({ ...answer, [`command-${i}`]: event.target.value })
                      }
                    >
                      <option value="">À retrouver…</option>
                      {Object.entries({
                        UP: 'Monter',
                        DOWN: 'Descendre',
                        LEFT: 'Gauche',
                        RIGHT: 'Droite',
                      }).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </li>
            ))}
          </ol>
          <label>
            Message des cinq arrivées
            <input
              value={String(answer.message ?? '')}
              onChange={(event) => onChange({ ...answer, message: event.target.value })}
            />
          </label>
        </>
      );
    case 'circuit':
      return <CircuitBoard mechanic={mechanic} answer={answer} onChange={onChange} />;
    case 'wordgrid':
      return (
        <WordGridBoard mechanic={mechanic} answer={answer} inputs={inputs} onChange={onChange} />
      );
  }
}
