import { useEffect, useRef, useState } from 'react';
import { catalog, sourceRegistry } from './catalog';
import { useGame } from './useGame';
import { OfflinePanel } from './OfflinePanel';
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
import { MemoryCard, MissionCard } from '../presentation/components/Cards';
import {
  EditorialProvider,
  parsePresentationCatalog,
} from '../presentation/components/EditorialCopy';

const editorial = parsePresentationCatalog(
  import.meta.glob('../../game/levels/*/presentation.json', { eager: true, import: 'default' }),
);
export function App() {
  const [tab, setTab] = useState(
    new URLSearchParams(location.search).has('level') ? 'author' : 'game',
  );
  const [selected, setSelected] = useState<string>();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [newSiteId, setNewSiteId] = useState('evry-2026');
  const game = useGame(catalog);
  const returnFocus = useRef<string | undefined>(undefined);
  const [fileError, setFileError] = useState('');
  useEffect(() => {
    if (tab === 'game' && !selected && returnFocus.current) {
      document.getElementById(`open-${returnFocus.current}`)?.focus();
      returnFocus.current = undefined;
    }
  }, [tab, selected]);
  const score = integrity(game.session, catalog);
  const level = selected ? catalog.levels[selected] : undefined;
  const levelState = level ? availability(game.session, catalog, level.id) : undefined;
  const canOpen = level && levelState !== 'draft' && levelState !== 'locked';
  return (
    <EditorialProvider copies={editorial} team={game.session.team}>
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
        <span className="tag">
          {tab === 'author'
            ? 'Atelier · profil au choix'
            : catalog.sites[game.session.siteId]?.title}
        </span>
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
              <p>Profil : {catalog.sites[game.session.siteId]?.title}</p>
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
                    const input = event.currentTarget;
                    const file = input.files?.[0];
                    setFileError('');
                    if (file) {
                      try {
                        game.importSave(await file.text());
                        setSelected(undefined);
                      } catch {
                        setFileError(
                          'Ce fichier ne peut pas être lu. Réessayez ou sélectionnez un autre export.',
                        );
                      }
                    }
                    input.value = '';
                  }}
                />
              </label>
              <button onClick={() => setResetConfirm(true)}>Nouvelle partie</button>
            </section>
            {fileError ? <p role="alert">{fileError}</p> : null}
            {resetConfirm ? (
              <section className="notice">
                <p>
                  Une nouvelle partie remplacera la sauvegarde locale. Vous pouvez d’abord
                  l’exporter.
                </p>
                <label>
                  Profil de la nouvelle partie
                  <select value={newSiteId} onChange={(event) => setNewSiteId(event.target.value)}>
                    {Object.values(catalog.sites)
                      .filter((site) => site.verified)
                      .map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.title}
                        </option>
                      ))}
                  </select>
                </label>
                <button
                  onClick={() => {
                    game.reset(newSiteId);
                    setSelected(undefined);
                    setResetConfirm(false);
                  }}
                >
                  Créer la nouvelle partie
                </button>
                <button onClick={() => setResetConfirm(false)}>Annuler</button>
              </section>
            ) : null}
            {tab !== 'memory' && !canOpen ? <OfflinePanel /> : null}
            {tab === 'memory' ? (
              <section className="panel">
                <h2>Carnet de fragments</h2>
                {inventory(game.session, catalog).length ? (
                  inventory(game.session, catalog).map((fragment) => (
                    <MemoryCard
                      key={fragment.rewardId}
                      title={catalog.levels[fragment.provenance]?.title ?? 'Fragment restauré'}
                      summary={fragment.summary}
                      provenance={`Dossier ${fragment.provenance.toUpperCase()}${fragment.fallbackObservations.length ? ` · Secours textuel ${fragment.fallbackObservations.join(', ')} consulté` : ''}`}
                    />
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
                        <MissionCard
                          key={entry.id}
                          level={candidate}
                          status={status}
                          requirements={entry.requires}
                          blocked={game.blocked}
                          onOpen={() => {
                            returnFocus.current = entry.id;
                            game.send({ type: 'open', levelId: entry.id });
                            setSelected(entry.id);
                          }}
                        />
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
                      onExit={() => setSelected(undefined)}
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
        ARIIE et 2068 appartiennent à la fiction. Les documents historiques sont sourcés. Le mode
        hors ligne demande une préparation explicite avec le réseau.
      </footer>
    </EditorialProvider>
  );
}
