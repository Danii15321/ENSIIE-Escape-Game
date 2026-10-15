import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Award, BookOpen, Sparkles } from 'lucide-react';
import { AriieAvatar } from '../components/AriieAvatar';
import { useAmbience } from '../components/Ambience';
import { MemoryCard, NarrativeCard } from '../components/Cards';
import { IntegrityMeter } from '../components/IntegrityMeter';

export function RewardScreen({
  title,
  assisted,
  successText,
  capsule,
  fragments,
  before,
  after,
  chapterClosed,
  finished,
  onContinue,
  onReview,
  onMemory,
}: {
  title: string;
  assisted: boolean;
  successText: string;
  capsule: string;
  fragments: string[];
  before: number;
  after: number;
  chapterClosed?: { label: string; title: string };
  finished: boolean;
  onContinue: () => void;
  onReview: () => void;
  onMemory: () => void;
}) {
  const { reducedMotion } = useAmbience();
  const [level, setLevel] = useState(reducedMotion ? after : before);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
    if (reducedMotion) return;
    const timer = window.setTimeout(() => setLevel(after), 450);
    return () => window.clearTimeout(timer);
  }, [after, reducedMotion]);
  return (
    <section
      className={`reward${chapterClosed ? ' closes-chapter' : ''}`}
      aria-labelledby="reward-title"
    >
      <div className="reward-hero">
        <span className="reward-burst" aria-hidden="true" />
        <AriieAvatar integrity={level} size={150} speaking />
      </div>
      <p className="eyebrow">
        {chapterClosed ? `${chapterClosed.label} restauré` : 'Mission accomplie'}
      </p>
      <h1 id="reward-title" ref={heading} tabIndex={-1}>
        {assisted ? 'Dossier restauré avec aide' : 'Dossier restauré'}
      </h1>
      <p className="reward-mission">{title}</p>
      <NarrativeCard speaker="ARIIE" text={successText} />
      {fragments.length ? (
        <div className="reward-fragments">
          {fragments.map((fragment, index) => (
            <article
              key={fragment}
              className="fragment-card"
              style={{ '--i': index } as CSSProperties}
            >
              <span className="fragment-label">
                <Sparkles aria-hidden="true" size={16} /> Fragment restauré
              </span>
              <p>{fragment}</p>
            </article>
          ))}
        </div>
      ) : null}
      <MemoryCard title="À retenir" summary={capsule} />
      {after > before ? <IntegrityMeter value={after} gained={after - before} /> : null}
      {chapterClosed ? (
        <p className="act-banner">
          <Award aria-hidden="true" size={22} />
          {chapterClosed.label} · {chapterClosed.title} : restauré
        </p>
      ) : null}
      <div className="action-bar">
        <button className="primary is-large" onClick={onContinue}>
          {finished ? 'Ouvrir la capsule' : 'Continuer'}
          <ArrowRight aria-hidden="true" size={22} />
        </button>
        <button onClick={onReview}>Relire le dossier</button>
        <button className="ghost-button" onClick={onMemory}>
          <BookOpen aria-hidden="true" size={18} /> Carnet
        </button>
      </div>
    </section>
  );
}
