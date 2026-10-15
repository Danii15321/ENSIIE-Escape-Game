import { useEffect, useRef, type ReactNode } from 'react';
import type { Level } from '../../core/contracts';

export function FocusedLevelTitle({ title }: { title: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [title]);
  return (
    <h2 ref={ref} tabIndex={-1} className="level-title">
      {title}
    </h2>
  );
}

export function TextBlocks({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((paragraph, i) => (
        <p key={i}>
          {paragraph.split(/(\[[A-Z]\])/).map((part, j) =>
            /^\[[A-Z]\]$/.test(part) ? (
              <span className="letter-frame" key={j} aria-label={`Lettre encadrée ${part[1]}`}>
                {part[1]}
              </span>
            ) : (
              part
            ),
          )}
        </p>
      ))}
    </>
  );
}

export function NarrativeCard({
  speaker,
  text,
  children,
}: {
  speaker: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <section className="dialogue" aria-label="Dialogue">
      <strong>{speaker}</strong>
      <TextBlocks text={text} />
      {children}
    </section>
  );
}

const badges = {
  fact: 'Fait sourcé',
  reconstruction: 'Reconstitution pédagogique',
  fiction: 'Projection fictive / simulation',
};
export function DocumentCard({
  document,
  sources,
}: {
  document: Level['documents'][number];
  sources: Record<string, { title: string; url: string }>;
}) {
  return (
    <details className="document">
      <summary>{document.title}</summary>
      <span className="document-badge">{badges[document.badge]}</span>
      <TextBlocks text={document.body} />
      {document.sourceIds.length ? (
        <ul className="source-list" aria-label="Sources du document">
          {document.sourceIds.map((id) => (
            <li key={id}>
              {sources[id] ? (
                <a href={sources[id].url} target="_blank" rel="noreferrer">
                  {sources[id].title}
                  <span className="sr-only"> (nouvel onglet)</span> ↗
                </a>
              ) : (
                <span>Source {id} à compléter</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}

export function MemoryCard({
  title,
  summary,
  provenance,
}: {
  title?: string;
  summary: string;
  provenance?: string;
}) {
  return (
    <article className="memory-card">
      {title ? <h3>{title}</h3> : null}
      <TextBlocks text={summary} />
      {provenance ? <small>{provenance}</small> : null}
    </article>
  );
}

export type MissionStatus = 'draft' | 'locked' | 'available' | 'started' | 'succeeded' | 'assisted';
const statusText: Record<MissionStatus, string> = {
  draft: 'À réaliser',
  locked: 'Verrouillé',
  available: 'Disponible',
  started: 'En cours',
  succeeded: 'Restauré',
  assisted: 'Restauré avec aide',
};
export function MissionCard({
  level,
  status,
  requirements,
  blocked,
  onOpen,
}: {
  level: Level;
  status: MissionStatus;
  requirements: string[];
  blocked: boolean;
  onOpen: () => void;
}) {
  return (
    <article className={`mission era-${level.era}`}>
      <p className="eyebrow">{level.id.toUpperCase()}</p>
      <h2>{level.title}</h2>
      <p className="mission-status">{statusText[status]}</p>
      {status === 'locked' ? (
        <small>Prérequis : {requirements.map((id) => id.toUpperCase()).join(', ')}</small>
      ) : null}
      <button
        id={`open-${level.id}`}
        disabled={blocked || status === 'locked' || status === 'draft'}
        onClick={onOpen}
      >
        {status === 'succeeded' || status === 'assisted' ? 'Consulter' : 'Ouvrir le dossier'}
      </button>
    </article>
  );
}
