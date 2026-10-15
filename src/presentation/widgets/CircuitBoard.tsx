import type { Answer, Mechanic } from '../../core/contracts';
import { circuitSockets, linkKey } from '../../core/validation/circuit';

type Props = {
  mechanic: Extract<Mechanic, { kind: 'circuit' }>;
  answer: Answer;
  onChange: (answer: Answer) => void;
};

export function CircuitBoard({ mechanic, answer, onChange }: Props) {
  const { outputs, inputs } = circuitSockets(mechanic);
  return (
    <>
      <div className="table-scroll">
        <table>
          <caption>Modules du simulateur</caption>
          <thead>
            <tr>
              <th scope="col">Module</th>
              <th scope="col">Mission</th>
              <th scope="col">Entrée</th>
              <th scope="col">Sortie</th>
            </tr>
          </thead>
          <tbody>
            {mechanic.modules.map((module) => (
              <tr key={module.id}>
                <th scope="row">{module.label}</th>
                <td>{module.mission ?? ''}</td>
                <td>{module.input}</td>
                <td>{module.output}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="fields">
        {outputs.map((output) => (
          <label key={output.id}>
            Sortie {output.type} de « {output.label} » vers
            <select
              value={String(answer[linkKey(output.id)] ?? '')}
              onChange={(event) =>
                onChange({ ...answer, [linkKey(output.id)]: event.target.value })
              }
            >
              <option value="">Non raccordée</option>
              {inputs
                .filter((input) => input.id !== output.id)
                .map((input) => (
                  <option key={input.id} value={input.id}>
                    {input.label} (entrée {input.type})
                  </option>
                ))}
            </select>
          </label>
        ))}
      </div>
    </>
  );
}
