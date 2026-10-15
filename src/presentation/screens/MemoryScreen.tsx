import { useEffect, useRef, type CSSProperties } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { MissionGlyph } from '../components/Glyphs';
import { TextBlocks } from '../components/Text';
import type { MemoryChapter } from './types';

export function MemoryScreen({
  chapters,
  commitments,
}: {
  chapters: MemoryChapter[];
  commitments: string[];
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const entries = chapters.flatMap((chapter) => chapter.entries);
  const restored = entries.filter((entry) => entry.state !== 'missing').length;
  return (
    <section className="memory" aria-labelledby="memory-title">
      <h1 id="memory-title" ref={heading} tabIndex={-1}>
        Carnet de fragments
      </h1>
      <p className="memory-count">
        {restored
          ? `${restored} dossiers restaurés sur ${entries.length}.`
          : 'Les preuves acquises apparaîtront ici.'}
      </p>
      {chapters.map((chapter) => (
        <section
          key={chapter.id}
          className={`memory-chapter era-${chapter.era}`}
          aria-labelledby={`memory-${chapter.id}`}
        >
          <h2 id={`memory-${chapter.id}`}>
            <span className="eyebrow">{chapter.label}</span> {chapter.title}
          </h2>
          <ul className="memory-grid">
            {chapter.entries.map((entry, index) => (
              <li
                key={entry.levelId}
                className={`memory-entry is-${entry.state}`}
                style={{ '--i': index } as CSSProperties}
              >
                <span className="memory-glyph" aria-hidden="true">
                  {entry.state === 'missing' ? (
                    <HelpCircle size={20} />
                  ) : (
                    <MissionGlyph levelId={entry.levelId} size={20} />
                  )}
                </span>
                <h3>{entry.title}</h3>
                {entry.state === 'missing' ? (
                  <p className="memory-missing">Fragment à restaurer</p>
                ) : (
                  <>
                    {entry.fragments.map((fragment) => (
                      <p key={fragment} className="memory-fragment">
                        <Sparkles aria-hidden="true" size={14} /> {fragment}
                      </p>
                    ))}
                    <div className="memory-capsule">
                      <strong>À retenir</strong>
                      <TextBlocks text={entry.capsule} />
                    </div>
                    {entry.note ? <small>{entry.note}</small> : null}
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {commitments.length ? (
        <section className="memory-chapter era-future" aria-labelledby="memory-council">
          <h2 id="memory-council">Vos engagements du Conseil</h2>
          <ol className="commitments">
            {commitments.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ol>
        </section>
      ) : null}
    </section>
  );
}
