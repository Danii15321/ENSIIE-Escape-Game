import { AriieAvatar } from './AriieAvatar';

export function Wordmark({ as: Tag = 'span' }: { as?: 'span' | 'h1' }) {
  return (
    <Tag className="wordmark">
      Chrono<span className="wordmark-dot">·</span>
      <span className="wordmark-iie">IIE</span>
    </Tag>
  );
}

export function BrandLockup({ integrity }: { integrity: number }) {
  return (
    <span className="brand-lockup">
      <AriieAvatar integrity={integrity} size={34} brand />
      <Wordmark />
    </span>
  );
}

export function EraRibbon({ years }: { years: [number, number, number] }) {
  return (
    <p className="era-ribbon" aria-label={`De ${years[0]} à ${years[2]}`}>
      <span className="era-ribbon-year is-past">{years[0]}</span>
      <span className="era-ribbon-line" aria-hidden="true" />
      <span className="era-ribbon-year is-present">{years[1]}</span>
      <span className="era-ribbon-line" aria-hidden="true" />
      <span className="era-ribbon-year is-future">{years[2]}</span>
    </p>
  );
}
