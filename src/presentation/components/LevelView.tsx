import { useState } from 'react';
import type { Context, Evaluation, Level } from '../../core/contracts';
import { isComplete, type Command, type Progress } from '../../core/session/engine';
import { caesar } from '../../core/validation/mechanics';
import { PuzzleWidget } from '../widgets/PuzzleWidget';

type Props = {
  level: Level;
  progress: Progress;
  context: Context;
  evaluation?: Evaluation;
  message?: string;
  onCommand: (command: Command) => void;
  sources: Record<string, { title: string; url: string }>;
};
const badges = {
  fact: 'Fait sourcé',
  reconstruction: 'Reconstitution pédagogique',
  fiction: 'Projection fictive / simulation',
};

export function LevelView({
  level,
  progress,
  context,
  evaluation,
  message,
  onCommand,
  sources,
}: Props) {
  const [solutionVisible, setSolutionVisible] = useState(false);
  const send = (command: Omit<Command, 'levelId'>) =>
    onCommand({ ...command, levelId: level.id } as Command);
  const done = isComplete(progress);
  const step = level.steps[progress.step];
  const dialogue = level.dialogue.nodes.find((node) => node.id === progress.dialogue);
  return (
    <article className={`level era-${level.era}`}>
      <header>
        <p className="eyebrow">
          {level.id.toUpperCase()} · {level.minutes} min ·{' '}
          {level.status === 'ready' ? 'Prêt' : 'Prototype'}
        </p>
        <h2>{level.title}</h2>
      </header>
      {dialogue && !done ? (
        <section className="dialogue" aria-label="Dialogue">
          <strong>{dialogue.speaker}</strong>
          <p>{dialogue.text}</p>
          <div className="actions">
            {dialogue.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() =>
                  onCommand({ type: 'dialogue', levelId: level.id, choiceId: choice.id })
                }
              >
                {choice.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {Object.keys(context.inputs).length ? (
        <details className="panel">
          <summary>Fragments disponibles</summary>
          {Object.entries(context.inputs).map(([port, fragment]) => (
            <section key={port}>
              <p>{fragment.summary}</p>
            </section>
          ))}
        </details>
      ) : null}
      {done ? (
        <section className="success">
          <h3>
            {progress.status === 'assisted' ? 'Dossier restauré avec aide' : 'Dossier restauré'}
          </h3>
          <p>{level.dialogue.success}</p>
          <p>{level.capsule}</p>
          <details>
            <summary>Revoir la démarche</summary>
            <p>{level.solution}</p>
          </details>
        </section>
      ) : step ? (
        <>
          <p className="eyebrow">
            Étape {progress.step + 1}/{level.steps.length}
          </p>
          <h3>{step.title}</h3>
          <p>{step.instruction}</p>
          {level.observations.map((observation) => (
            <section className="observation" key={observation}>
              <strong>Carte {observation} · DEMO fictive</strong>
              <p>
                Valeur affichée : <b>{context.site.observations[observation]}</b>. Cette carte ne
                décrit pas le bâtiment.
              </p>
              {observation === 'O1' ? (
                <>
                  <p>Document chiffré :</p>
                  <code>
                    {caesar('INSTITUT INFORMATIQUE ENTREPRISE', context.site.observations.O1)}
                  </code>
                  <p className="alphabet">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                </>
              ) : null}
            </section>
          ))}
          <section aria-label="Documents">
            {step.documentIds.map((id) => {
              const document = level.documents.find((doc) => doc.id === id)!;
              return (
                <details className="document" key={id}>
                  <summary>{document.title}</summary>
                  <small>{badges[document.badge]}</small>
                  <p>{document.body}</p>
                  {document.sourceIds.map((sourceId) =>
                    sources[sourceId] ? (
                      <p key={sourceId}>
                        <a href={sources[sourceId].url} target="_blank" rel="noreferrer">
                          {sources[sourceId].title} ↗
                        </a>
                      </p>
                    ) : (
                      <p key={sourceId}>Source {sourceId} : référence à compléter</p>
                    ),
                  )}
                </details>
              );
            })}
          </section>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send({ type: 'submit' });
            }}
          >
            <PuzzleWidget
              mechanic={step.mechanic}
              answer={progress.drafts[step.id] ?? {}}
              onChange={(answer) => onCommand({ type: 'draft', levelId: level.id, answer })}
            />
            <button className="primary" type="submit">
              {step.mechanic.kind === 'program' ? 'Simuler et vérifier' : 'Vérifier cette étape'}
            </button>
          </form>
          <section className="hints" aria-label="Aide">
            <h3>Besoin d’un indice ?</h3>
            <ol>
              {level.hints.slice(0, progress.hints).map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ol>
            {progress.hints < 3 ? (
              <button onClick={() => send({ type: 'hint' })}>
                Révéler l’indice {progress.hints + 1}/3
              </button>
            ) : (
              <button onClick={() => setSolutionVisible(true)}>Voir la démarche complète</button>
            )}
            {solutionVisible && progress.hints === 3 ? (
              <section>
                <p>{level.solution}</p>
                <button
                  onClick={() => onCommand({ type: 'assist', levelId: level.id, confirmed: true })}
                >
                  J’ai lu la démarche — continuer avec aide
                </button>
              </section>
            ) : null}
          </section>
        </>
      ) : null}
      <div aria-live="polite" aria-atomic="true">
        {message ? <p>{message}</p> : null}
        {evaluation ? (
          <div className={evaluation.status === 'correct' ? 'feedback success' : 'feedback'}>
            <strong>{evaluation.status === 'correct' ? 'Étape validée.' : 'À vérifier'}</strong>
            <ul>
              {evaluation.messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
            {evaluation.trace ? <p>Trace : {evaluation.trace.join(' → ')}</p> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
