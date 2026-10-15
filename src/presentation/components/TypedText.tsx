import { useEffect, useState } from 'react';
import { useAmbience } from './Ambience';
import { TextBlocks } from './Text';

const STEP = 2;
const TICK = 22;

export function TypedText({ text }: { text: string }) {
  const { instantText, reducedMotion } = useAmbience();
  const instant = instantText || reducedMotion;
  const [shown, setShown] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) {
      setShown(text.length);
      return;
    }
    setShown(0);
    const timer = window.setInterval(() => {
      setShown((count) => {
        const next = Math.min(text.length, count + STEP);
        if (next === text.length) window.clearInterval(timer);
        return next;
      });
    }, TICK);
    return () => window.clearInterval(timer);
  }, [text, instant]);
  if (shown >= text.length) return <TextBlocks text={text} />;
  return (
    <div
      className="typed"
      role="button"
      tabIndex={0}
      aria-label="Afficher tout le message"
      onClick={() => setShown(text.length)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setShown(text.length);
        }
      }}
    >
      <div className="typed-ghost" aria-hidden="true">
        <TextBlocks text={text} />
      </div>
      <div className="typed-live" aria-hidden="true">
        {text
          .slice(0, shown)
          .split('\n\n')
          .map((paragraph, index) => (
            <p key={index}>{paragraph.replace(/\[([A-Z])\]/g, '$1')}</p>
          ))}
        <span className="typed-caret" />
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
}
