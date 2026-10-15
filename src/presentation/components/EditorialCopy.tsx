import { createContext, useContext, type ReactNode } from 'react';
import type { Answer, Context } from '../../core/contracts';
import { normalizeDate } from '../../core/validation/mechanics';

type Line = { id: string; text: string };
type Condition = {
  step: string;
  field?: string;
  test?:
    | 'equals'
    | 'notEquals'
    | 'integerEquals'
    | 'dateEquals'
    | 'invalidDate'
    | 'notEightDigits'
    | 'notObservation';
  value?: string;
};
export type PresentationCopy = {
  version: 1;
  feedback: (Line & { when: Condition })[];
  stepLines: Record<string, Line>;
  reservedLines: (Line & { reason: string })[];
  exitLabel?: string;
};
export type PresentationCatalog = Record<string, PresentationCopy>;
const EditorialContext = createContext<{ copies: PresentationCatalog; team: string }>({
  copies: {},
  team: 'Équipe Chrono',
});

/** Editorial rules only choose wording after a failed evaluation. They cannot change a result. */
export function feedbackLine(
  copy: PresentationCopy | undefined,
  step: string,
  answer: Answer,
  context: Context,
): Line | undefined {
  return copy?.feedback.find(({ when }) => {
    if (when.step !== step) return false;
    if (!when.test) return true;
    const raw = when.field ? answer[when.field] : undefined;
    const value = typeof raw === 'string' ? raw.trim() : '';
    switch (when.test) {
      case 'equals':
        return value === when.value;
      case 'notEquals':
        return value !== when.value;
      case 'integerEquals':
        return /^\d+$/.test(value) && Number(value) === Number(when.value);
      case 'dateEquals':
        return normalizeDate(value) === when.value;
      case 'invalidDate':
        return normalizeDate(value) === null;
      case 'notEightDigits':
        return !/^\d{8}$/.test(value);
      case 'notObservation':
        return (
          !/^\d+$/.test(value) ||
          Number(value) !== context.site.observations[when.value as 'O1' | 'O2']
        );
    }
  });
}

export function EditorialProvider({
  copies,
  team,
  children,
}: {
  copies: PresentationCatalog;
  team: string;
  children: ReactNode;
}) {
  return <EditorialContext.Provider value={{ copies, team }}>{children}</EditorialContext.Provider>;
}
export function useEditorialCopy(levelId: string) {
  const { copies, team } = useContext(EditorialContext);
  return {
    copy: copies[levelId],
    interpolate: (text: string) => text.replaceAll('{equipe}', team),
  };
}

/** Validate local presentation files without extending the shared game contract. */
export function parsePresentationCatalog(modules: Record<string, unknown>): PresentationCatalog {
  const result: PresentationCatalog = {};
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
  const isLine = (value: unknown): value is Line & Record<string, unknown> =>
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.text === 'string' &&
    value.text.length > 0;
  const tests = [
    'equals',
    'notEquals',
    'integerEquals',
    'dateEquals',
    'invalidDate',
    'notEightDigits',
    'notObservation',
  ];
  for (const [path, raw] of Object.entries(modules)) {
    const id = path.split('/').at(-2);
    if (
      !id ||
      !isRecord(raw) ||
      raw.version !== 1 ||
      !Array.isArray(raw.feedback) ||
      !isRecord(raw.stepLines) ||
      !Array.isArray(raw.reservedLines)
    )
      throw new Error(`${path} : fichier de présentation invalide`);
    for (const line of raw.feedback) {
      if (
        !isLine(line) ||
        !isRecord(line) ||
        !isRecord(line.when) ||
        typeof line.when.step !== 'string'
      )
        throw new Error(`${path} : réplique de retour invalide`);
      const when = line.when;
      if (
        when.test !== undefined &&
        (typeof when.test !== 'string' ||
          !tests.includes(when.test) ||
          typeof when.field !== 'string')
      )
        throw new Error(`${path} : condition de présentation inconnue`);
      if (
        when.test &&
        !['invalidDate', 'notEightDigits'].includes(String(when.test)) &&
        typeof when.value !== 'string'
      )
        throw new Error(`${path} : valeur de condition absente`);
      if (when.test === 'notObservation' && when.value !== 'O1' && when.value !== 'O2')
        throw new Error(`${path} : observation inconnue`);
    }
    if (
      !Object.values(raw.stepLines).every(isLine) ||
      !raw.reservedLines.every(
        (line) => isLine(line) && isRecord(line) && typeof line.reason === 'string',
      ) ||
      (raw.exitLabel !== undefined && typeof raw.exitLabel !== 'string')
    )
      throw new Error(`${path} : texte éditorial invalide`);
    result[id] = raw as unknown as PresentationCopy;
  }
  return result;
}
