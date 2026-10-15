import { useState } from 'react';
import { catalog, sourceRegistry } from './catalog';
import { useGame } from './useGame';
import {
  availability,
  choicesFrozen,
  initialProgress,
  integrity,
  inventory,
  resolveInputs,
} from '../core/session/engine';
import { downloadSave, downloadText } from '../adapters/storage/local';
import { LevelView } from '../presentation/components/LevelView';
import { Preview } from '../authoring/preview/Preview';

const statusText = {
  draft: 'À réaliser',
  locked: 'Verrouillé',
  available: 'Disponible',
  started: 'En cours',
  succeeded: 'Restauré',
  assisted: 'Restauré avec aide',
};
export function App() {
  const [tab, setTab] = useState(
    new URLSearchParams(location.search).has('level') ? 'author' : 'game',
  );
  const [selected, setSelected] = useState<string>();
  const [resetConfirm, setResetConfirm] = useState(false);
  const game = useGame(catalog);
  const score = integrity(game.session, catalog);
  const level = selected ? catalog.levels[selected] : undefined;
  const levelState = level ? availability(game.session, catalog, level.id) : undefined;
  const canOpen = level && levelState !== 'draft' && levelState !== 'locked';
  return (
    <>
      <a className="skip" href="#main">
        Aller au contenu
      </a>
      <header className="masthead">
        <div className="brand-mark" aria-hidden="true">
          ◉
        </div>
        <div>
          <p className="eyebrow">ENSIIE · 1968 → 2068</p>
          <h1>Chrono-IIE</h1>
          <p>La mémoire de demain</p>
        </div>
        <span className="tag">Socle de développement · DEMO</span>
      </header>
      <nav aria-label="Navigation principale">
        {[
          ['game', 'Parcours'],
          ['memory', 'Carnet'],
          ['author', 'Atelier des niveaux'],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => setTab(id!)}
          >
            {label}
          </button>
        ))}
      </nav>
      <main id="main">
        {tab === 'author' ? (
          <Preview catalog={catalog} sources={sourceRegistry} />
        ) : (
          <>
            <section className="panel">
              <div className="row spread">
                <strong>{game.session.team}</strong>
                <span>Intégrité : {score}/100</span>
              </div>
              <progress max={100} value={score} aria-label="Intégrité d’ARIIE" />
              <p>
                Les actes I et II sont jouables en version sobre. Les dossiers « À réaliser »
                disposent de leur fiche de travail et n’ouvrent pas encore la suite.
              </p>
            </section>
            {game.notice ? (
              <section className="notice" role="alert">
                <p>{game.notice}</p>
                {game.raw ? (
                  <button onClick={() => downloadText(game.raw!, 'chrono-iie-original.json')}>
                    Exporter la sauvegarde originale
                  </button>
                ) : null}
              </section>
            ) : null}
            <section className="actions" aria-label="Sauvegarde">
              <button onClick={() => downloadSave(game.session)}>Exporter la partie</button>
              <label className="file-button">
                Importer une partie
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      try {
                        game.importSave(await file.text());
                        setSelected(undefined);
                      } catch {
                        /* File selection can be cancelled by the browser. */
                      }
                    }
                    event.target.value = '';
                  }}
                />
              </label>
              <button onClick={() => setResetConfirm(true)}>Nouvelle partie</button>
            </section>
            {resetConfirm ? (
              <section className="notice">
                <p>
                  Une nouvelle partie remplacera la sauvegarde locale. Vous pouvez d’abord
                  l’exporter.
                </p>
                <button
                  onClick={() => {
                    game.reset();
                    setSelected(undefined);
                    setResetConfirm(false);
                  }}
                >
                  Créer la nouvelle partie
                </button>
                <button onClick={() => setResetConfirm(false)}>Annuler</button>
              </section>
            ) : null}
            {tab === 'memory' ? (
              <section className="panel">
                <h2>Carnet de fragments</h2>
                {inventory(game.session, catalog).length ? (
                  inventory(game.session, catalog).map((fragment) => (
                    <article key={fragment.rewardId}>
                      <h3>{fragment.type}</h3>
                      <p>{fragment.summary}</p>
                      <small>
                        Provenance : {fragment.provenance.toUpperCase()} · révision{' '}
                        {fragment.version}
                      </small>
                    </article>
                  ))
                ) : (
                  <p>Les preuves acquises apparaîtront ici.</p>
                )}
              </section>
            ) : (
              <>
                {!canOpen ? (
                  <section className="campaign" aria-label="Dossiers de la campagne">
                    {catalog.campaign.levels.map((entry) => {
                      const candidate = catalog.levels[entry.id]!;
                      const status = availability(game.session, catalog, entry.id);
                      return (
                        <article className={`mission era-${candidate.era}`} key={entry.id}>
                          <p className="eyebrow">{entry.id.toUpperCase()}</p>
                          <h2>{candidate.title}</h2>
                          <p>{statusText[status]}</p>
                          {status === 'locked' ? (
                            <small>
                              Prérequis : {entry.requires.map((id) => id.toUpperCase()).join(', ')}
                            </small>
                          ) : null}
                          <button
                            disabled={game.blocked || status === 'locked' || status === 'draft'}
                            onClick={() => {
                              game.send({ type: 'open', levelId: entry.id });
                              setSelected(entry.id);
                            }}
                          >
                            {status === 'succeeded' || status === 'assisted'
                              ? 'Consulter'
                              : 'Ouvrir le dossier'}
                          </button>
                        </article>
                      );
                    })}
                  </section>
                ) : (
                  <div className="actions">
                    <button onClick={() => setSelected(undefined)}>← Retour aux dossiers</button>
                  </div>
                )}
                {canOpen ? (
                  <fieldset className="play-area" disabled={game.blocked}>
                    <legend>Dossier ouvert</legend>
                    <LevelView
                      key={`${game.session.id}:${level.id}`}
                      level={level}
                      progress={game.session.progress[level.id] ?? initialProgress(level)}
                      context={{
                        site: catalog.sites[game.session.siteId]!,
                        inputs: resolveInputs(game.session, catalog, level.id),
                      }}
                      onCommand={game.send}
                      evaluation={game.evaluation}
                      message={game.message}
                      sources={sourceRegistry}
                      frozen={choicesFrozen(game.session, catalog)}
                    />
                  </fieldset>
                ) : null}
              </>
            )}
          </>
        )}
      </main>
      <footer>
        ARIIE et 2068 appartiennent à la fiction. Les documents historiques sont sourcés. Aucun
        cache hors ligne n’est encore installé.
      </footer>
    </>
  );
}
