import { useId, type CSSProperties } from 'react';
import { integrityState } from '../../core/session/journey';

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function AriieAvatar({
  integrity,
  size = 96,
  speaking = false,
  brand = false,
  className = '',
}: {
  integrity: number;
  size?: number;
  speaking?: boolean;
  brand?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gradient = `ariie-gradient-${uid}`;
  const glow = `ariie-glow-${uid}`;
  const ratio = Math.max(0, Math.min(100, integrity)) / 100;
  const { tier } = integrityState(integrity);
  const span = tier === 3 ? 120 : 70 + ratio * 46;
  const scatter = Math.max(0, (0.4 - ratio) / 0.4) * 8;
  return (
    <svg
      className={`ariie tier-${tier}${speaking ? ' is-speaking' : ''} ${className}`}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--past)" />
          <stop offset="55%" stopColor="var(--present)" />
          <stop offset="100%" stopColor="var(--future)" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="45%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="ariie-dial">
        <circle cx="60" cy="60" r="55" className="ariie-ticks" />
      </g>
      <g className="ariie-arcs" stroke={brand ? `url(#${gradient})` : 'currentColor'}>
        {[0, 1, 2].map((index) => {
          const start = index * 120 - 90 + (120 - span) / 2;
          const middle = ((start + span / 2) * Math.PI) / 180;
          const style = {
            '--dx': `${(Math.cos(middle) * scatter).toFixed(2)}px`,
            '--dy': `${(Math.sin(middle) * scatter).toFixed(2)}px`,
            '--rotate': `${start.toFixed(2)}deg`,
            '--i': index,
          } as CSSProperties;
          return (
            <circle
              key={index}
              className="ariie-arc"
              cx="60"
              cy="60"
              r={RADIUS}
              strokeDasharray={`${((span / 360) * CIRCUMFERENCE).toFixed(2)} ${CIRCUMFERENCE.toFixed(2)}`}
              style={style}
            />
          );
        })}
      </g>
      <circle className="ariie-halo" cx="60" cy="60" r="20" fill={`url(#${glow})`} />
      <circle className="ariie-core" cx="60" cy="60" r="6.5" />
    </svg>
  );
}
