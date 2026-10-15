import type { CSSProperties } from 'react';
import { integrityState } from '../../core/session/journey';

export function IntegrityMeter({ value, gained = 0 }: { value: number; gained?: number }) {
  const { label, tier } = integrityState(value);
  const lit = Math.round(value / 10);
  return (
    <div
      className={`meter tier-${tier}`}
      role="progressbar"
      aria-label="Mémoire d’ARIIE"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value} %, ${label}`}
    >
      <div className="meter-head">
        <span className="meter-title">Mémoire d’ARIIE</span>
        <strong className="meter-value">{value} %</strong>
      </div>
      <ol className="meter-segments" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <li
            key={index}
            className={
              index < lit ? (index >= lit - gained / 10 ? 'is-on is-new' : 'is-on') : undefined
            }
            style={{ '--i': index } as CSSProperties}
          />
        ))}
      </ol>
      <p className="meter-state">{label}</p>
    </div>
  );
}
