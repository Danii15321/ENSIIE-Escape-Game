import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Download, Pause, RotateCcw, Upload, Wrench } from 'lucide-react';
import { Switch } from '../components/Switch';
import type { Media } from '../theme/media';
import { NewGameForm } from './NewGameForm';
import type { SiteOption } from './types';

export type ComfortPrefs = {
  reduceMotion: boolean;
  instantText: boolean;
  sound: boolean;
  largeText: boolean;
  helpNudges: boolean;
};

export function SettingsScreen({
  prefs,
  onPrefs,
  team,
  siteTitle,
  sites,
  defaultSiteId,
  fileError,
  offline,
  photos,
  onPause,
  onExport,
  onImport,
  onNewGame,
  onAtelier,
}: {
  prefs: ComfortPrefs;
  onPrefs: (patch: Partial<ComfortPrefs>) => void;
  team: string;
  siteTitle: string;
  sites: SiteOption[];
  defaultSiteId: string;
  fileError: string;
  offline: ReactNode;
  photos: Media[];
  onPause: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onNewGame: (team: string, siteId: string) => void;
  onAtelier?: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <section className="settings" aria-labelledby="settings-title">
      <h1 id="settings-title" ref={heading} tabIndex={-1}>
        Réglages
      </h1>
      <section className="settings-group" aria-labelledby="settings-game">
        <h2 id="settings-game">Partie</h2>
        <p>Équipe : {team}</p>
        <p>Profil : {siteTitle}</p>
        <div className="settings-actions">
          <button onClick={onPause}>
            <Pause aria-hidden="true" size={18} /> Mettre en pause
          </button>
          <button onClick={onExport}>
            <Download aria-hidden="true" size={18} /> Exporter la sauvegarde
          </button>
          <label className="file-button">
            <Upload aria-hidden="true" size={18} /> Importer une sauvegarde
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const input = event.currentTarget;
                const file = input.files?.[0];
                if (file) onImport(file);
                input.value = '';
              }}
            />
          </label>
          <button onClick={() => setCreating(true)}>
            <RotateCcw aria-hidden="true" size={18} /> Nouvelle partie
          </button>
        </div>
        {fileError ? <p role="alert">{fileError}</p> : null}
        {creating ? (
          <NewGameForm
            sites={sites}
            defaultSiteId={defaultSiteId}
            replacing
            onStart={(name, siteId) => {
              setCreating(false);
              onNewGame(name, siteId);
            }}
            onExport={onExport}
            onCancel={() => setCreating(false)}
          />
        ) : null}
      </section>
      <section className="settings-group" aria-labelledby="settings-comfort">
        <h2 id="settings-comfort">Confort de jeu</h2>
        <Switch
          label="Réduire les animations"
          description="Supprime les transitions, l’avatar animé et l’effet machine à écrire."
          checked={prefs.reduceMotion}
          onChange={(value) => onPrefs({ reduceMotion: value })}
        />
        <Switch
          label="Afficher immédiatement les messages"
          checked={prefs.instantText}
          onChange={(value) => onPrefs({ instantText: value })}
        />
        <Switch
          label="Activer les sons"
          description="Quatre sons courts : connexion, fragment, acte restauré, capsule."
          checked={prefs.sound}
          onChange={(value) => onPrefs({ sound: value })}
        />
        <Switch
          label="Agrandir le texte"
          checked={prefs.largeText}
          onChange={(value) => onPrefs({ largeText: value })}
        />
        <Switch
          label="Relances d’aide"
          description="ARIIE propose un indice après trois essais ou quatre minutes sans action."
          checked={prefs.helpNudges}
          onChange={(value) => onPrefs({ helpNudges: value })}
        />
      </section>
      <div className="settings-group">{offline}</div>
      <section className="settings-group" aria-labelledby="settings-help">
        <h2 id="settings-help">Aide</h2>
        <p>
          Tous les défis peuvent être résolus avec les supports du jeu. Les liens servent à
          consulter les sources. Les indices sont fiables. Les choix du Conseil n’ont pas de
          mauvaise réponse. Si un lieu est inaccessible, utilisez le secours proposé.
        </p>
      </section>
      <section className="settings-group credits" aria-labelledby="settings-credits">
        <h2 id="settings-credits">Crédits</h2>
        <p>
          ARIIE, Nora, la capsule et l’année 2068 sont fictifs. Les documents historiques citent
          leurs sources.
        </p>
        <ul>
          {photos.map((photo) => (
            <li key={photo.url}>
              {photo.caption} <small>{photo.credit}</small>
            </li>
          ))}
          <li>
            Polices Inter, Space Grotesk, IBM Plex Mono et Source Serif 4{' '}
            <small>SIL Open Font License 1.1</small>
          </li>
          <li>
            Icônes Lucide <small>licence ISC</small>
          </li>
        </ul>
      </section>
      {onAtelier ? (
        <section className="settings-group" aria-labelledby="settings-author">
          <h2 id="settings-author">Conception</h2>
          <button onClick={onAtelier}>
            <Wrench aria-hidden="true" size={18} /> Atelier des niveaux
          </button>
        </section>
      ) : null}
    </section>
  );
}
