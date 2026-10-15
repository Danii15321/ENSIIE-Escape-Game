import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircleQuestion } from 'lucide-react';
import type { Chapter } from '../../core/session/journey';
import type { Media } from '../theme/media';
import { useAmbience } from '../components/Ambience';
import { NarrativeCard } from '../components/Cards';
import { ChapterGlyph } from '../components/Glyphs';

function YearRoll({ from, to }: { from: number; to: number }) {
  const { reducedMotion } = useAmbience();
  const [year, setYear] = useState(reducedMotion ? to : from);
  useEffect(() => {
    if (reducedMotion || typeof window.requestAnimationFrame !== 'function') {
      setYear(to);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 1600;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setYear(Math.round(from + (to - from) * eased));
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [from, to, reducedMotion]);
  return (
    <p className="year-roll">
      <span aria-hidden="true">{year}</span>
      <span className="sr-only">
        De {from} à {to}
      </span>
    </p>
  );
}

export function ChapterIntro({
  chapter,
  image,
  missions,
  onBegin,
}: {
  chapter: Chapter;
  image?: Media;
  missions: { title: string; optional: boolean }[];
  onBegin: () => void;
}) {
  const [shown, setShown] = useState(1);
  const [asked, setAsked] = useState<number[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const { cue } = useAmbience();
  useEffect(() => {
    heading.current?.focus();
    cue('connexion');
  }, [cue]);
  const complete = shown >= chapter.lines.length;
  const begin = chapter.id === 'prologue' ? 'Recevoir le signal' : 'Commencer l’acte';
  return (
    <section className={`chapter-intro era-${chapter.era}`} aria-labelledby="chapter-title">
      {image ? (
        <figure className="chapter-photo">
          <img src={image.url} alt={image.alt} />
          <figcaption>
            {image.caption}
            <small>{image.credit}</small>
          </figcaption>
        </figure>
      ) : null}
      <div className="chapter-titles">
        <p className="chapter-label">
          <ChapterGlyph icon={chapter.icon} size={20} /> {chapter.label}
        </p>
        <YearRoll from={chapter.roll.from} to={chapter.roll.to} />
        <h1 id="chapter-title" ref={heading} tabIndex={-1}>
          {chapter.title}
        </h1>
        <p className="chapter-span">
          {chapter.years.from} → {chapter.years.to}
        </p>
      </div>
      <div className="chapter-lines">
        {chapter.lines.slice(0, shown).map((line, index) => (
          <NarrativeCard key={index} speaker={line.speaker} text={line.text} />
        ))}
        {complete
          ? chapter.questions.map((question, index) =>
              asked.includes(index) ? (
                <NarrativeCard
                  key={question.label}
                  speaker={question.speaker}
                  text={question.text}
                />
              ) : null,
            )
          : null}
        {complete && chapter.closing ? (
          <NarrativeCard speaker={chapter.closing.speaker} text={chapter.closing.text} />
        ) : null}
      </div>
      {complete ? (
        <>
          {chapter.questions.some((_, index) => !asked.includes(index)) ? (
            <div className="choices">
              {chapter.questions.map((question, index) =>
                asked.includes(index) ? null : (
                  <button
                    key={question.label}
                    type="button"
                    className="choice"
                    onClick={() => setAsked([...asked, index])}
                  >
                    <span>{question.label}</span>
                    <MessageCircleQuestion aria-hidden="true" size={18} />
                  </button>
                ),
              )}
            </div>
          ) : null}
          <ol className="chapter-missions" aria-label="Missions de ce chapitre">
            {missions.map((mission, index) => (
              <li key={mission.title}>
                <span className="chapter-mission-index">{index + 1}</span>
                {mission.title}
                {mission.optional ? <small> · facultatif</small> : null}
              </li>
            ))}
          </ol>
          <div className="action-bar">
            <button className="primary is-large" onClick={onBegin}>
              {begin}
              <ArrowRight aria-hidden="true" size={22} />
            </button>
          </div>
        </>
      ) : (
        <div className="action-bar">
          <button className="primary" onClick={() => setShown(shown + 1)}>
            Continuer
            <ArrowRight aria-hidden="true" size={20} />
          </button>
          <button className="ghost-button" onClick={onBegin}>
            Passer l’introduction
          </button>
        </div>
      )}
    </section>
  );
}
