import { useState } from 'react';
import type { Catalog } from '../../core/content/catalog';
import type { Command } from '../../core/session/engine';
import { advance, initialProgress } from '../../core/session/engine';
import type { Evaluation, Level, Site } from '../../core/contracts';
import { LevelView } from '../../presentation/components/LevelView';
import { inputsFor, referenceFor } from './fixtures';

function IsolatedLevel({
  level,
  site,
  sources,
}: {
  level: Level;
  site: Site;
  sources: Record<string, { title: string; url: string }>;
}) {
  const [progress, setProgress] = useState(() => initialProgress(level));
  const [evaluation, setEvaluation] = useState<Evaluation>();
  const [message, setMessage] = useState<string>();
  let inputs;
  try {
    inputs = inputsFor(level, site.id);
  } catch (error) {
    return <p role="alert">{String(error)}</p>;
  }
  const context = { inputs, site };
  const command = (command: Command) => {
    const result = advance(level, progress, command, context);
    setProgress(result.progress);
    setEvaluation(result.evaluation);
    setMessage(result.message);
  };
  return (
    <>
      <div className="actions">
        <button
          onClick={() => {
            setProgress(initialProgress(level));
            setEvaluation(undefined);
            setMessage(undefined);
          }}
        >
          Réinitialiser ce niveau
        </button>
      </div>
      <details className="panel">
        <summary>Réponses de référence (auteur)</summary>
        <pre>{JSON.stringify(referenceFor(level.id), null, 2)}</pre>
        <p>
          Utilisez les réponses de la variante correspondant au profil choisi, lorsqu’elle existe.
          Les réponses principales correspondent au profil DEMO pair.
        </p>
      </details>
      {level.status === 'draft' ? (
        <section className="panel">
          <h2>{level.title} — à réaliser</h2>
          <p>
            Le paquet, ses entrées simulées et sa fiche TASK.md sont prêts. Remplacez la maquette
            dans level.json, écrivez les cas d’acceptation, puis passez le statut à prototype pour
            jouer ici.
          </p>
          <p>Cette maquette ne produit aucune réussite.</p>
        </section>
      ) : (
        <LevelView
          key={level.id}
          level={level}
          progress={progress}
          context={context}
          onCommand={command}
          evaluation={evaluation}
          message={message}
          sources={sources}
        />
      )}
    </>
  );
}
export function Preview({
  catalog,
  sources,
}: {
  catalog: Catalog;
  sources: Record<string, { title: string; url: string }>;
}) {
  const requested = new URLSearchParams(location.search).get('level');
  const [levelId, setLevelId] = useState(
    requested && catalog.levels[requested] ? requested : 'pro-00',
  );
  const [siteId, setSiteId] = useState(() => {
    const requestedSite = new URLSearchParams(location.search).get('site');
    return requestedSite && catalog.sites[requestedSite]?.verified ? requestedSite : 'demo';
  });
  return (
    <section>
      <header className="panel">
        <h2>Atelier des niveaux</h2>
        <p>Session isolée en mémoire, avec fragments simulés. La partie du joueur reste séparée.</p>
        <div className="fields">
          <label>
            Niveau
            <select value={levelId} onChange={(event) => setLevelId(event.target.value)}>
              {Object.values(catalog.levels).map((level) => (
                <option key={level.id} value={level.id}>
                  {level.id.toUpperCase()} — {level.title} ({level.status})
                </option>
              ))}
            </select>
          </label>
          <label>
            Profil
            <select value={siteId} onChange={(event) => setSiteId(event.target.value)}>
              {Object.values(catalog.sites)
                .filter((site) => site.verified)
                .map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.title}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </header>
      <IsolatedLevel
        key={`${levelId}:${siteId}`}
        level={catalog.levels[levelId]!}
        site={catalog.sites[siteId]!}
        sources={sources}
      />
    </section>
  );
}
