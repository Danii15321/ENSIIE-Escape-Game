import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Clock, Settings, Smartphone, Users } from 'lucide-react';
import { AriieAvatar } from '../components/AriieAvatar';
import { EraRibbon } from '../components/Brand';
import { NewGameForm } from './NewGameForm';
import type { SiteOption } from './types';

export function TitleScreen({
  integrity,
  resume,
  finished,
  team,
  sites,
  defaultSiteId,
  onResume,
  onStart,
  onExport,
  onSettings,
}: {
  integrity: number;
  resume: string | null;
  finished: boolean;
  team: string;
  sites: SiteOption[];
  defaultSiteId: string;
  onResume: () => void;
  onStart: (team: string, siteId: string) => void;
  onExport: () => void;
  onSettings: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <section className="title-screen" aria-labelledby="title-heading">
      <div className="title-emblem">
        <span className="title-orbit" aria-hidden="true" />
        <AriieAvatar integrity={resume ? integrity : 8} size={200} brand />
      </div>
      <h1
        id="title-heading"
        ref={heading}
        tabIndex={-1}
        className="title-heading"
        aria-label="Chrono-IIE"
      >
        <span className="wordmark">
          Chrono<span className="wordmark-dot">·</span>
          <span className="wordmark-iie">IIE</span>
        </span>
      </h1>
      <p className="title-tagline">La mémoire de demain</p>
      <EraRibbon years={[1968, 2026, 2068]} />
      <p className="title-pitch">
        En 2068, l’archive de l’école a mélangé ses souvenirs. Depuis 2026, votre équipe enquête
        dans les lieux réels pour séparer les faits de la fiction.
      </p>
      <ul className="title-facts" aria-label="La partie en bref">
        <li>
          <Clock aria-hidden="true" size={18} /> Environ 70 min
        </li>
        <li>
          <Users aria-hidden="true" size={18} /> 3 à 5 joueurs
        </li>
        <li>
          <Smartphone aria-hidden="true" size={18} /> Un appareil
        </li>
      </ul>
      {resume && !creating ? (
        <div className="title-actions">
          <button className="primary is-large" onClick={onResume}>
            {finished ? 'Ouvrir la capsule' : 'Reprendre'}
            <ArrowRight aria-hidden="true" size={22} />
          </button>
          <p className="title-resume">
            {team} · {resume}
          </p>
          <button className="ghost-button" onClick={() => setCreating(true)}>
            Nouvelle partie
          </button>
        </div>
      ) : (
        <NewGameForm
          sites={sites}
          defaultSiteId={defaultSiteId}
          replacing={Boolean(resume)}
          onStart={onStart}
          onExport={onExport}
          onCancel={resume ? () => setCreating(false) : undefined}
        />
      )}
      <button className="ghost-button title-settings" onClick={onSettings}>
        <Settings aria-hidden="true" size={18} /> Réglages
      </button>
      <p className="title-footnote">
        ARIIE, Nora et l’année 2068 appartiennent à la fiction. Les documents historiques sont
        sourcés.
      </p>
    </section>
  );
}
