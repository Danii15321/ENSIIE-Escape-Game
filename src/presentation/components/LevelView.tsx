import { useState } from 'react';
import type { Context, Evaluation, Level } from '../../core/contracts';
import { isComplete, type Command, type Progress } from '../../core/session/engine';
import { caesar } from '../../core/validation/mechanics';
import { NarrativeChoice } from '../widgets/NarrativeChoice';
import { PuzzleWidget } from '../widgets/PuzzleWidget';
import { DocumentCard, FocusedLevelTitle, MemoryCard, NarrativeCard, TextBlocks } from './Cards';
import { feedbackLine, useEditorialCopy } from './EditorialCopy';

type Props = {
  level: Level;
  progress: Progress;
  context: Context;
  evaluation?: Evaluation;
  message?: string;
  onCommand: (command: Command) => void;
  onExit?: () => void;
  sources: Record<string, { title: string; url: string }>;
  frozen?: boolean;
};

export function LevelView({
  level,
  progress,
  context,
  evaluation,
  message,
  onCommand,
  onExit,
  sources,
  frozen = false,
}: Props) {
  const [solutionVisible, setSolutionVisible] = useState(false);
  const { copy, interpolate } = useEditorialCopy(level.id);
  const done = isComplete(progress);
  const step = level.steps[progress.step];
  const dialogue = level.dialogue.nodes.find((node) => node.id === progress.dialogue);
  const intro = step ? copy?.stepLines[step.id] : undefined;
  const editorialError =
    evaluation && evaluation.status !== 'correct' && step
      ? feedbackLine(copy, step.id, progress.drafts[step.id] ?? {}, context)
      : undefined;
  return (
    <article className={`level era-${level.era}`}>
      <header>
        <p className="eyebrow">
          {level.id.toUpperCase()} · {level.minutes} min ·{' '}
          {level.status === 'ready' ? 'Prêt' : 'Prototype'}
        </p>
        <FocusedLevelTitle title={level.title} />
      </header>
      {dialogue && !done ? (
        <NarrativeCard speaker={dialogue.speaker} text={interpolate(dialogue.text)}>
          <div className="actions">
            {dialogue.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() =>
                  onCommand({ type: 'dialogue', levelId: level.id, choiceId: choice.id })
                }
              >
                {interpolate(choice.label)}
              </button>
            ))}
          </div>
        </NarrativeCard>
      ) : null}
      {Object.keys(context.inputs).length ? (
        <section className="fragment-tray" aria-label="Fragments disponibles">
          <h3>Fragments disponibles</h3>
          {Object.entries(context.inputs).map(([port, fragment]) => (
            <MemoryCard key={port} summary={fragment.summary} />
          ))}
        </section>
      ) : null}
      {level.narrative ? (
        <NarrativeChoice
          speaker={level.narrative.speaker}
          questions={level.narrative.questions}
          choices={progress.choices}
          done={level.narrative.done}
          frozen={frozen}
          onChoose={(questionId, optionId) =>
            onCommand({ type: 'choose', levelId: level.id, questionId, optionId })
          }
        />
      ) : done ? (
        <section className="success">
          <h3>
            {progress.status === 'assisted' ? 'Dossier restauré avec aide' : 'Dossier restauré'}
          </h3>
          <TextBlocks text={interpolate(level.dialogue.success)} />
          <MemoryCard title="À retenir" summary={level.capsule} />
          <TextBlocks text={interpolate(level.dialogue.return)} />
          <details>
            <summary>Revoir la démarche</summary>
            <TextBlocks text={level.solution} />
          </details>
          {onExit ? (
            <button className="primary" onClick={onExit}>
              {copy?.exitLabel ?? 'Retour aux dossiers'}
            </button>
          ) : null}
        </section>
      ) : step ? (
        <>
          <p className="eyebrow">
            Étape {progress.step + 1}/{level.steps.length}
          </p>
          <h3>{step.title}</h3>
          {intro ? <NarrativeCard speaker="ARIIE" text={interpolate(intro.text)} /> : null}
          <TextBlocks text={step.instruction} />
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
            {step.documentIds.map((id) => (
              <DocumentCard
                key={id}
                document={level.documents.find((doc) => doc.id === id)!}
                sources={sources}
              />
            ))}
          </section>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onCommand({ type: 'submit', levelId: level.id });
            }}
          >
            <PuzzleWidget
              mechanic={step.mechanic}
              answer={progress.drafts[step.id] ?? {}}
              inputs={context.inputs}
              onChange={(answer) => onCommand({ type: 'draft', levelId: level.id, answer })}
            />
            <button className="primary" type="submit">
              {step.mechanic.kind === 'program' ? 'Simuler et vérifier' : 'Vérifier cette étape'}
            </button>
          </form>
          <div className="feedback-region" aria-live="polite" aria-atomic="true">
            {evaluation && evaluation.status !== 'correct' ? (
              <div className="feedback">
                <strong>À vérifier</strong>
                {editorialError ? <TextBlocks text={editorialError.text} /> : null}
                <ul>
                  {evaluation.messages
                    .filter((text) => !editorialError || !text.includes(editorialError.text))
                    .map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                </ul>
                {evaluation.trace ? <p>Trace : {evaluation.trace.join(' → ')}</p> : null}
              </div>
            ) : null}
          </div>
          <section className="hints" aria-label="Aide">
            <h3>Besoin d’un indice ?</h3>
            <ol>
              {level.hints.slice(0, progress.hints).map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ol>
            {progress.hints < 3 ? (
              <button onClick={() => onCommand({ type: 'hint', levelId: level.id })}>
                Révéler l’indice {progress.hints + 1}/3
              </button>
            ) : (
              <button onClick={() => setSolutionVisible(true)}>Voir la démarche complète</button>
            )}
            {solutionVisible && progress.hints === 3 ? (
              <section>
                <TextBlocks text={level.solution} />
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
        {message && message !== level.dialogue.return ? <p>{message}</p> : null}
        {evaluation?.status === 'correct' ? <p className="success">Étape validée.</p> : null}
      </div>
    </article>
  );
}
