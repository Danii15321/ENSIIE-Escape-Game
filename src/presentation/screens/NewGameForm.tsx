import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { SiteOption } from './types';

export function NewGameForm({
  sites,
  defaultSiteId,
  replacing,
  onStart,
  onExport,
  onCancel,
}: {
  sites: SiteOption[];
  defaultSiteId: string;
  replacing: boolean;
  onStart: (team: string, siteId: string) => void;
  onExport?: () => void;
  onCancel?: () => void;
}) {
  const [team, setTeam] = useState('');
  const [siteId, setSiteId] = useState(defaultSiteId);
  const site = sites.find((item) => item.id === siteId);
  return (
    <form
      className="new-game"
      onSubmit={(event) => {
        event.preventDefault();
        onStart(team.trim() || 'Équipe Chrono', siteId);
      }}
    >
      {replacing ? (
        <p className="notice-line">
          Commencer une nouvelle partie réinitialisera le carnet actif. Exportez-le d’abord si vous
          souhaitez le garder.
        </p>
      ) : null}
      <label>
        Nom d’équipe (facultatif)
        <input
          value={team}
          maxLength={24}
          placeholder="Équipe Chrono"
          autoComplete="off"
          onChange={(event) => setTeam(event.target.value)}
        />
      </label>
      <label>
        Profil de la nouvelle partie
        <select value={siteId} onChange={(event) => setSiteId(event.target.value)}>
          {sites.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <p className="hint-line">
        {site?.mode === 'real'
          ? 'Parcours dans l’école : deux repères réels seront à observer, avec un secours si un lieu est fermé.'
          : 'Démonstration : les repères sont des cartes fictives, jouables hors de l’école.'}
      </p>
      <div className="form-actions">
        {replacing && onExport ? (
          <button type="button" onClick={onExport}>
            Exporter
          </button>
        ) : null}
        <button className="primary" type="submit">
          {replacing ? 'Recommencer' : 'Commencer l’enquête'}
          <ArrowRight aria-hidden="true" size={20} />
        </button>
        {onCancel ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Annuler
          </button>
        ) : null}
      </div>
    </form>
  );
}
