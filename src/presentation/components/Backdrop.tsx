export type Scene = 'prologue' | 'past' | 'present' | 'future' | 'final' | 'neutral';

const TICKS = Array.from({ length: 60 }, (_, i) => i);

export function Backdrop({
  scene,
  intensity = 'calm',
}: {
  scene: Scene;
  intensity?: 'calm' | 'vivid';
}) {
  return (
    <div className={`backdrop scene-${scene} is-${intensity}`} aria-hidden="true">
      <div className="backdrop-glow" />
      <div className="backdrop-pattern" />
      <svg className="backdrop-dial" viewBox="-100 -100 200 200">
        <circle r="96" className="dial-ring" />
        <circle r="78" className="dial-ring is-inner" />
        {TICKS.map((tick) => (
          <line
            key={tick}
            x1="0"
            y1={tick % 5 === 0 ? -96 : -92}
            x2="0"
            y2="-88"
            transform={`rotate(${tick * 6})`}
            className={tick % 5 === 0 ? 'dial-tick is-major' : 'dial-tick'}
          />
        ))}
      </svg>
      <div className="backdrop-grain" />
    </div>
  );
}
