import { useEffect, useRef, type CSSProperties } from 'react';
import { ArrowRight, Check, Clock, Lock, Package } from 'lucide-react';
import { AriieAvatar } from '../components/AriieAvatar';
import { ChapterGlyph, MissionGlyph } from '../components/Glyphs';
import { IntegrityMeter } from '../components/IntegrityMeter';
import type { BonusView, ChapterView, NextView, StopView } from './types';

const statusLabel = (stop: StopView) => {
  switch (stop.state) {
    case 'done':
      return stop.assisted ? 'Restauré avec aide' : 'Restauré';
    case 'current':
      return 'À suivre';
    case 'open':
      return stop.optional ? 'Facultatif, disponible' : 'Disponible';
    case 'visited':
      return 'Consulté, modifiable jusqu’à la capsule';
    case 'locked':
      return stop.after ? `Verrouillé · après « ${stop.after} »` : 'Verrouillé';
  }
};

function StopNode({
  stop,
  kicker,
  onOpen,
  blocked,
}: {
  stop: StopView;
  kicker: string;
  onOpen: (levelId: string) => void;
  blocked: boolean;
}) {
  return (
    <li className={`stop is-${stop.state}${stop.optional ? ' is-optional' : ''}`}>
      <button
        id={`open-${stop.levelId}`}
        className="stop-button"
        disabled={blocked || stop.state === 'locked'}
        onClick={() => onOpen(stop.levelId)}
      >
        <span className="stop-node" aria-hidden="true">
          {stop.state === 'done' ? (
            <Check size={20} strokeWidth={2.5} />
          ) : stop.state === 'locked' ? (
            <Lock size={18} />
          ) : (
            <MissionGlyph levelId={stop.levelId} size={20} />
          )}
        </span>
        <span className="stop-text">
          <span className="stop-kicker">{kicker}</span>
          <span className="stop-title">{stop.title}</span>
          <span className="stop-status">{statusLabel(stop)}</span>
        </span>
      </button>
    </li>
  );
}

export function JourneyScreen({
  team,
  siteLabel,
  integrity,
  chapters,
  bonus,
  next,
  finished,
  blocked,
  onContinue,
  onOpen,
  onEnding,
}: {
  team: string;
  siteLabel: string;
  integrity: number;
  chapters: ChapterView[];
  bonus: BonusView[];
  next: NextView | null;
  finished: boolean;
  blocked: boolean;
  onContinue: () => void;
  onOpen: (levelId: string) => void;
  onEnding: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!document.activeElement || document.activeElement === document.body)
      heading.current?.focus();
  }, []);
  const total = chapters.reduce((sum, chapter) => sum + chapter.total, 0);
  const done = chapters.reduce((sum, chapter) => sum + chapter.done, 0);
  return (
    <section className="journey" aria-labelledby="journey-title">
      <header className="journey-head">
        <AriieAvatar integrity={integrity} size={76} />
        <div>
          <p className="eyebrow">
            {team} · {siteLabel}
          </p>
          <h1 id="journey-title" ref={heading} tabIndex={-1}>
            Le parcours
          </h1>
        </div>
      </header>
      <IntegrityMeter value={integrity} />
      {finished ? (
        <div className="next-card scene-final">
          <p className="eyebrow">Mémoire restaurée</p>
          <h2>La capsule est ouverte</h2>
          <p>Relisez la fin de votre équipe, vos engagements et les repères historiques.</p>
          <button className="primary is-large" onClick={onEnding}>
            Revoir la capsule
            <Package aria-hidden="true" size={22} />
          </button>
        </div>
      ) : next ? (
        <div className={`next-card era-${next.era}`}>
          <p className="eyebrow">À suivre · {next.chapterLabel}</p>
          <h2>{next.title}</h2>
          <p>{next.teaser}</p>
          <p className="next-meta">
            <Clock aria-hidden="true" size={16} /> Environ {next.minutes} min
            {next.optional ? ' · Facultatif' : ''}
          </p>
          <button className="primary is-large" disabled={blocked} onClick={onContinue}>
            {next.started ? 'Continuer' : 'Commencer'}
            <ArrowRight aria-hidden="true" size={22} />
          </button>
        </div>
      ) : null}
      <ol
        className="timeline"
        aria-label="Dossiers de la campagne"
        style={{ '--progress': total ? done / total : 0 } as CSSProperties}
      >
        {chapters.map((chapter) => (
          <li key={chapter.id} className={`chapter era-${chapter.era}`}>
            <div className="chapter-head">
              <span className="chapter-icon" aria-hidden="true">
                <ChapterGlyph icon={chapter.icon} />
              </span>
              <div>
                <p className="eyebrow">
                  {chapter.label} · {chapter.years.from} → {chapter.years.to}
                </p>
                <h2>{chapter.title}</h2>
              </div>
              <span className="chapter-count" aria-label={`${chapter.done} sur ${chapter.total}`}>
                {chapter.done}/{chapter.total}
              </span>
            </div>
            <ol className="stops">
              {chapter.stops.map((stop) => (
                <StopNode
                  key={stop.levelId}
                  stop={stop}
                  kicker={stop.optional ? 'Facultatif' : `Mission ${stop.number}`}
                  onOpen={onOpen}
                  blocked={blocked}
                />
              ))}
              {bonus
                .filter((entry) =>
                  chapter.stops.some((stop) => stop.levelId === entry.afterLevelId),
                )
                .map((entry) => (
                  <StopNode
                    key={entry.levelId}
                    stop={entry}
                    kicker={entry.label}
                    onOpen={onOpen}
                    blocked={blocked}
                  />
                ))}
            </ol>
          </li>
        ))}
        <li className={`chapter capsule-node${finished ? ' is-open' : ''}`}>
          <div className="chapter-head">
            <span className="chapter-icon" aria-hidden="true">
              <Package size={22} />
            </span>
            <div>
              <p className="eyebrow">2068</p>
              <h2>La capsule</h2>
            </div>
            <span className="chapter-count">{finished ? 'Ouverte' : 'Scellée'}</span>
          </div>
        </li>
      </ol>
    </section>
  );
}
