import type { Answer, Evaluation, Inputs, Mechanic } from '../contracts';

type Evidence = Extract<Mechanic, { kind: 'evidence' }>;
type Proof = Evidence['proofs'][number];

export const decisionKey = (claimId: string) => `decision-${claimId}`;
export const proofsKey = (claimId: string) => `proofs-${claimId}`;

export function proofContent(proof: Proof, inputs: Inputs): string {
  const { input, path, item } = proof.source;
  const fragment = inputs[input];
  if (!fragment) throw new Error(`Preuve ${proof.id} : entrée ${input} absente`);
  if (!path) return fragment.summary;
  const value = fragment.data[path];
  if (item !== undefined) {
    if (!Array.isArray(value) || !value.includes(item))
      throw new Error(`Preuve ${proof.id} : ${item} absent de ${input}.${path}`);
    return item;
  }
  if (Array.isArray(value)) return value.map(String).join(' ; ');
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  throw new Error(`Preuve ${proof.id} : ${input}.${path} absent`);
}

export type ClaimState = 'empty' | 'decision' | 'proof' | 'accepted';

export function claimStates(mechanic: Evidence, answer: Answer): Record<string, ClaimState> {
  return Object.fromEntries(
    mechanic.claims.map((claim) => {
      const decision = answer[decisionKey(claim.id)];
      const raw = answer[proofsKey(claim.id)];
      const proofs = Array.isArray(raw) ? raw : [];
      if (typeof decision !== 'string' || decision === '') return [claim.id, 'empty'];
      if (decision !== claim.decision) return [claim.id, 'decision'];
      const exact =
        new Set(proofs).size === proofs.length &&
        proofs.length === claim.proofs.length &&
        claim.proofs.every((id) => proofs.includes(id));
      return [claim.id, exact ? 'accepted' : 'proof'];
    }),
  );
}

export function evaluateEvidence(mechanic: Evidence, answer: Answer, inputs: Inputs): Evaluation {
  for (const proof of mechanic.proofs) proofContent(proof, inputs);
  const states = claimStates(mechanic, answer);
  const messages: string[] = [];
  let accepted = 0;
  let answered = 0;
  mechanic.claims.forEach((claim, index) => {
    const state = states[claim.id];
    const label = `Affirmation ${index + 1}`;
    if (state !== 'empty') answered++;
    if (state === 'accepted') {
      accepted++;
      messages.push(`${label} : ${claim.accepted}`);
    } else if (state === 'decision') messages.push(`${label} : ${claim.error}`);
    else if (state === 'proof') messages.push(`${label} : ${mechanic.proofError}`);
    else messages.push(`${label} : choisissez une décision.`);
  });
  if (accepted === mechanic.claims.length) return { status: 'correct', messages };
  return {
    status: answered === 0 ? 'format' : accepted > 0 ? 'partial' : 'incorrect',
    messages,
  };
}
