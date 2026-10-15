import type { Answer, Inputs, Mechanic } from '../../core/contracts';
import { decisionKey, proofContent, proofsKey } from '../../core/validation/evidence';

type Props = {
  mechanic: Extract<Mechanic, { kind: 'evidence' }>;
  answer: Answer;
  inputs: Inputs;
  onChange: (answer: Answer) => void;
};

export function EvidenceBoard({ mechanic, answer, inputs, onChange }: Props) {
  let contents: Record<string, string>;
  try {
    contents = Object.fromEntries(
      mechanic.proofs.map((proof) => [proof.id, proofContent(proof, inputs)]),
    );
  } catch (error) {
    return <p role="alert">Preuves indisponibles : {String(error)}</p>;
  }
  return (
    <ol className="claims">
      {mechanic.claims.map((claim, index) => {
        const raw = answer[proofsKey(claim.id)];
        const chosen = Array.isArray(raw) ? raw : [];
        return (
          <li key={claim.id}>
            <fieldset>
              <legend>Affirmation {index + 1}</legend>
              <p>« {claim.statement} »</p>
              <div className="row" role="radiogroup" aria-label={`Décision ${index + 1}`}>
                {mechanic.decisions.map((decision) => (
                  <label className="check" key={decision.id}>
                    <input
                      type="radio"
                      name={decisionKey(claim.id)}
                      checked={answer[decisionKey(claim.id)] === decision.id}
                      onChange={() => onChange({ ...answer, [decisionKey(claim.id)]: decision.id })}
                    />
                    {decision.label}
                  </label>
                ))}
              </div>
              <fieldset>
                <legend>Preuves pour l’affirmation {index + 1}</legend>
                {mechanic.proofs.map((proof) => (
                  <label className="check" key={proof.id}>
                    <input
                      type="checkbox"
                      checked={chosen.includes(proof.id)}
                      onChange={(event) =>
                        onChange({
                          ...answer,
                          [proofsKey(claim.id)]: event.target.checked
                            ? [...chosen, proof.id]
                            : chosen.filter((id) => id !== proof.id),
                        })
                      }
                    />
                    <span>
                      {proof.label} : <small>{contents[proof.id]}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
            </fieldset>
          </li>
        );
      })}
    </ol>
  );
}
