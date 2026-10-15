import type { ObservationId, Site } from '../../core/contracts';
import { caesar } from '../../core/validation/mechanics';
import { TextBlocks } from './Cards';

export function ObservationCard({
  observation,
  site,
  fallbackUsed,
  onFallback,
}: {
  observation: ObservationId;
  site: Site;
  fallbackUsed: boolean;
  onFallback: () => void;
}) {
  const landmark = site.mode === 'real' ? site.landmarks?.[observation] : undefined;
  return (
    <section className="observation" aria-label={`Repère ${observation}`}>
      {landmark ? (
        <>
          <h3>
            {observation} — {landmark.location}
          </h3>
          <TextBlocks text={landmark.route} />
          <p>
            <strong>{landmark.question}</strong>
          </p>
          <TextBlocks text={landmark.scope} />
          <TextBlocks text={landmark.access} />
          <button
            type="button"
            aria-expanded={fallbackUsed}
            aria-controls={`fallback-${observation}`}
            onClick={onFallback}
          >
            Utiliser le secours textuel {observation}
          </button>
          {fallbackUsed ? (
            <div id={`fallback-${observation}`} className="notice" role="status">
              <strong>Secours textuel {observation} consulté — sans pénalité</strong>
              <TextBlocks text={landmark.fallback} />
            </div>
          ) : null}
        </>
      ) : (
        <>
          <strong>Carte {observation} · DEMO fictive</strong>
          <p>
            Valeur affichée : <b>{site.observations[observation]}</b>. Cette carte ne décrit pas le
            bâtiment.
          </p>
        </>
      )}
      {observation === 'O1' ? (
        <>
          <p>Document chiffré :</p>
          <code>{caesar('INSTITUT INFORMATIQUE ENTREPRISE', site.observations.O1)}</code>
          <p className="alphabet">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
        </>
      ) : null}
    </section>
  );
}
