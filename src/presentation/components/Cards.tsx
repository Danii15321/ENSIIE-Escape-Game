import { useEffect, useRef, type ReactNode } from 'react';
import { FileText, Lock, Radio } from 'lucide-react';
import type { Level } from '../../core/contracts';
import { AriieAvatar } from './AriieAvatar';
import { useAmbience } from './Ambience';
import { TextBlocks } from './Text';
import { TypedText } from './TypedText';
import { SourceLink } from './QrCode';

export { TextBlocks } from './Text';

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

export function SpeakerBadge({ speaker }: { speaker: string }) {
  const { integrity } = useAmbience();
  if (speaker === 'ARIIE')
    return (
      <span className="speaker-badge is-ariie">
        <AriieAvatar integrity={integrity} size={40} speaking />
      </span>
    );
  if (speaker === 'Nora')
    return (
      <span className="speaker-badge is-nora" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="40" height="40">
          <circle cx="20" cy="20" r="18" className="nora-ring" />
          <path d="M20 29c0-7 0-11 6-15M20 23c-1-4-4-6-8-6" className="nora-sprout" />
          <circle cx="26" cy="14" r="2.2" className="nora-seed" />
        </svg>
      </span>
    );
  return (
    <span className="speaker-badge is-system" aria-hidden="true">
      <Radio size={20} strokeWidth={1.8} />
    </span>
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
  const slug = speaker === 'ARIIE' ? 'ariie' : speaker === 'Nora' ? 'nora' : 'system';
  return (
    <section className={`dialogue speaker-${slug}`} aria-label="Dialogue">
      <SpeakerBadge speaker={speaker} />
      <div className="dialogue-bubble">
        <strong className="dialogue-speaker">
          {speaker}
          {speaker === 'Nora' ? <small> · correspondante fictive, 2068</small> : null}
        </strong>
        <TypedText text={text} />
        {children}
      </div>
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
    <details className={`document badge-${document.badge}`}>
      <summary>
        <FileText aria-hidden="true" size={20} strokeWidth={1.8} />
        <span className="document-title">{document.title}</span>
      </summary>
      <div className="document-sheet">
        <span className="document-badge">{badges[document.badge]}</span>
        <div className="document-body">
          <TextBlocks text={document.body} />
        </div>
        {document.sourceIds.length ? (
          <ul className="source-list" aria-label="Sources du document">
            {document.sourceIds.map((id) => (
              <li key={id}>
                {sources[id] ? (
                  <SourceLink title={sources[id].title} url={sources[id].url} />
                ) : (
                  <span>Source {id} à compléter</span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
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
      <h2>{level.title}</h2>
      <p className="mission-status">
        {status === 'locked' ? <Lock aria-hidden="true" size={16} /> : null}
        {statusText[status]}
      </p>
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
