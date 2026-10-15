import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import type { Context, Evaluation, Level } from '../../core/contracts';
import { isComplete, type Command, type Progress } from '../../core/session/engine';
import { ObservationCard } from './ObservationCard';
import { NarrativeChoice } from '../widgets/NarrativeChoice';
import { PuzzleWidget } from '../widgets/PuzzleWidget';
import { DocumentCard, FocusedLevelTitle, MemoryCard, NarrativeCard, TextBlocks } from './Cards';
import { feedbackLine, useEditorialCopy } from './EditorialCopy';
import { MissionGlyph } from './Glyphs';
import { Sheet } from './Sheet';

type Props = {
  level: Level;
  progress: Progress;
  context: Context;
  evaluation?: Evaluation;
  message?: string;
  onCommand: (command: Command) => void;
  onExit?: () => void;
  exitLabel?: string;
  sources: Record<string, { title: string; url: string }>;
  frozen?: boolean;
  chapter?: { label: string; position: string };
  onBack?: () => void;
  helpNudges?: boolean;
};

const IDLE_SECONDS = 240;
type LocalCommand = Command extends infer C
  ? C extends unknown
    ? Omit<C, 'levelId'>
    : never
  : never;

function landmarkText(text: string, context: Context) {
  return text.replace(
    /\{(O[12])\.(lieu|direction|question)\}/g,
    (token, id: 'O1' | 'O2', field: 'lieu' | 'direction' | 'question') => {
      const landmark = context.site.landmarks?.[id];
      return landmark
        ? landmark[({ lieu: 'location', direction: 'route', question: 'question' } as const)[field]]
        : token;
    },
  );
}

export function LevelView({
  level,
  progress,
  context,
  evaluation,
  message,
  onCommand,
  onExit,
  exitLabel,
  sources,
  frozen = false,
  chapter,
  onBack,
  helpNudges = true,
}: Props) {
  const [hintsOpen, setHintsOpen] = useState(false);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [misses, setMisses] = useState(0);
  const [offerDismissed, setOfferDismissed] = useState(false);
  const [idle, setIdle] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const counted = useRef<Evaluation | undefined>(evaluation);
  const { copy, interpolate } = useEditorialCopy(level.id);
  const done = isComplete(progress);
  const step = level.steps[progress.step];
  const dialogue = level.dialogue.nodes.find((node) => node.id === progress.dialogue);
  const intro = step ? copy?.stepLines[step.id] : undefined;
  const send = (command: LocalCommand) => onCommand({ ...command, levelId: level.id } as Command);

  useEffect(() => {
    if (!evaluation || evaluation === counted.current) return;
    counted.current = evaluation;
    setFeedbackKey((key) => key + 1);
    if (evaluation.status === 'incorrect' || evaluation.status === 'partial')
      setMisses((count) => count + 1);
  }, [evaluation]);

  useEffect(() => {
    if (!helpNudges || done || level.narrative || idle) return;
    let visibleSeconds = 0;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      visibleSeconds++;
      if (visibleSeconds >= IDLE_SECONDS) {
        setIdle(true);
        window.clearInterval(timer);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [progress, helpNudges, done, level.narrative, idle]);

  const editorialError =
    evaluation && evaluation.status !== 'correct' && step
      ? feedbackLine(copy, step.id, progress.drafts[step.id] ?? {}, context)
      : undefined;
  const offerHint = helpNudges && !offerDismissed && misses >= 3 && progress.hints < 3 && !done;
  const openHints = () => {
    setHintsOpen(true);
    setOfferDismissed(true);
    setIdle(false);
  };

  return (
    <article className={`level era-${level.era}`}>
      {onBack ? (
        <nav className="mission-bar" aria-label="Mission">
          <button type="button" className="ghost-button" onClick={onBack}>
            <ArrowLeft aria-hidden="true" size={20} />
            Retour à l’acte
          </button>
          {chapter ? <span className="mission-bar-chapter">{chapter.label}</span> : null}
        </nav>
      ) : null}
      <header className="mission-head">
        <span className="mission-emblem" aria-hidden="true">
          <MissionGlyph levelId={level.id} size={26} />
        </span>
        <div>
          <p className="eyebrow">
            {chapter ? chapter.position : `${level.minutes} min`}
            {level.narrative ? ' · Facultatif' : ''}
          </p>
          <FocusedLevelTitle title={level.title} />
        </div>
        {!done && !level.narrative && level.steps.length > 1 ? (
          <ol
            className="step-dots"
            aria-label={`Étape ${progress.step + 1} sur ${level.steps.length}`}
          >
            {level.steps.map((item, index) => (
              <li
                key={item.id}
                className={
                  index < progress.step ? 'is-done' : index === progress.step ? 'is-current' : ''
                }
              />
            ))}
          </ol>
        ) : null}
      </header>
      {dialogue && !done ? (
        <NarrativeCard
          speaker={dialogue.speaker}
          text={landmarkText(
            interpolate(
              context.site.mode === 'real' ? (dialogue.realText ?? dialogue.text) : dialogue.text,
            ),
            context,
          )}
        >
          <div className="choices">
            {dialogue.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className="choice"
                onClick={() => send({ type: 'dialogue', choiceId: choice.id })}
              >
                <span>{interpolate(choice.label)}</span>
                <ArrowRight aria-hidden="true" size={18} />
              </button>
            ))}
          </div>
        </NarrativeCard>
      ) : null}
      {Object.keys(context.inputs).length && !done ? (
        <section className="fragment-tray" aria-label="Fragments disponibles">
          <h3>
            <Sparkles aria-hidden="true" size={18} /> Fragments disponibles
          </h3>
          <ul>
            {Object.entries(context.inputs).map(([port, fragment]) => (
              <li key={port} className="fragment-chip">
                {fragment.summary}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {level.narrative ? (
        <>
          <NarrativeChoice
            speaker={level.narrative.speaker}
            questions={level.narrative.questions}
            choices={progress.choices}
            done={level.narrative.done}
            frozen={frozen}
            onChoose={(questionId, optionId) => send({ type: 'choose', questionId, optionId })}
          />
          {onExit ? (
            <div className="action-bar">
              <button type="button" className="primary" onClick={onExit}>
                {exitLabel ?? 'Continuer'}
                <ArrowRight aria-hidden="true" size={20} />
              </button>
            </div>
          ) : null}
        </>
      ) : done ? (
        <section className="success-panel">
          <div className="success-head">
            <CheckCircle2 aria-hidden="true" size={28} />
            <h3>
              {progress.status === 'assisted' ? 'Dossier restauré avec aide' : 'Dossier restauré'}
            </h3>
          </div>
          <NarrativeCard speaker="ARIIE" text={interpolate(level.dialogue.success)} />
          <MemoryCard title="À retenir" summary={level.capsule} />
          <TextBlocks text={interpolate(level.dialogue.return)} />
          <details className="review">
            <summary>Revoir la démarche</summary>
            <TextBlocks text={level.solution} />
          </details>
          {onExit ? (
            <div className="action-bar">
              <button type="button" className="primary" onClick={onExit}>
                {exitLabel ?? copy?.exitLabel ?? 'Continuer'}
                <ArrowRight aria-hidden="true" size={20} />
              </button>
            </div>
          ) : null}
        </section>
      ) : step ? (
        <>
          <section className="brief" aria-labelledby={`brief-${step.id}`}>
            <p className="eyebrow">
              Étape {progress.step + 1}/{level.steps.length}
            </p>
            <h3 id={`brief-${step.id}`}>{step.title}</h3>
            {intro ? <NarrativeCard speaker="ARIIE" text={interpolate(intro.text)} /> : null}
            <div className="brief-text">
              <TextBlocks text={step.instruction} />
            </div>
          </section>
          {level.observations.map((observation) => (
            <ObservationCard
              key={observation}
              observation={observation}
              site={context.site}
              fallbackUsed={progress.fallbackObservations.includes(observation)}
              onFallback={() => send({ type: 'fallback', observation })}
            />
          ))}
          {step.documentIds.length ? (
            <section className="documents" aria-label="Documents">
              {step.documentIds.map((id, index) => (
                <div key={id} className="document-slot" style={{ '--i': index } as CSSProperties}>
                  <DocumentCard
                    document={level.documents.find((doc) => doc.id === id)!}
                    sources={sources}
                  />
                </div>
              ))}
            </section>
          ) : null}
          {offerHint || idle ? (
            <NarrativeCard
              speaker="ARIIE"
              text={
                offerHint
                  ? 'Nous pouvons examiner un indice ensemble. Voulez-vous révéler le prochain ?'
                  : 'Besoin de relire la consigne ou d’un indice ? Je reste disponible.'
              }
            >
              <div className="choices">
                <button type="button" className="choice" onClick={openHints}>
                  <span>Voir les indices</span>
                  <Lightbulb aria-hidden="true" size={18} />
                </button>
                <button
                  type="button"
                  className="choice is-quiet"
                  onClick={() => {
                    setOfferDismissed(true);
                    setIdle(false);
                  }}
                >
                  <span>Continuer à chercher</span>
                </button>
              </div>
            </NarrativeCard>
          ) : null}
          <form
            className={`puzzle mechanic-${step.mechanic.kind}`}
            onSubmit={(event) => {
              event.preventDefault();
              send({ type: 'submit' });
            }}
          >
            <PuzzleWidget
              mechanic={step.mechanic}
              answer={progress.drafts[step.id] ?? {}}
              inputs={context.inputs}
              onChange={(answer) => send({ type: 'draft', answer })}
            />
            <div className="feedback-region" aria-live="polite" aria-atomic="true">
              {evaluation && evaluation.status !== 'correct' ? (
                <div key={feedbackKey} className={`feedback is-${evaluation.status}`}>
                  <AlertTriangle aria-hidden="true" size={22} />
                  <div>
                    <strong>À vérifier</strong>
                    {evaluation.status === 'format' ? (
                      <p>
                        Je ne peux pas encore lire cette réponse. Utilisez le format indiqué près du
                        champ.
                      </p>
                    ) : null}
                    {editorialError ? <TextBlocks text={editorialError.text} /> : null}
                    <ul>
                      {evaluation.messages
                        .filter((text) => !editorialError || !text.includes(editorialError.text))
                        .map((text) => (
                          <li key={text}>{text}</li>
                        ))}
                    </ul>
                    {evaluation.trace ? (
                      <p className="trace">Trace : {evaluation.trace.join(' → ')}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="action-bar">
              <button type="button" className="hint-button" onClick={openHints}>
                <Lightbulb aria-hidden="true" size={20} />
                {progress.hints < 3 ? 'Indice suivant' : 'Résoudre avec ARIIE'}
                <span className="hint-count" aria-hidden="true">
                  {progress.hints}/3
                </span>
              </button>
              <button className="primary" type="submit">
                Vérifier
              </button>
            </div>
          </form>
          <Sheet open={hintsOpen} title="Indices" onClose={() => setHintsOpen(false)}>
            {progress.hints ? (
              <ol className="hint-list">
                {level.hints.slice(0, progress.hints).map((hint, index) => (
                  <li key={hint}>
                    <span className="hint-index">Indice {index + 1}</span>
                    <TextBlocks text={hint} />
                  </li>
                ))}
              </ol>
            ) : (
              <p>
                Tous les défis peuvent être résolus avec les supports du jeu. Les indices sont
                fiables.
              </p>
            )}
            {progress.hints < 3 ? (
              <div className="sheet-prompt">
                <p>Cet indice sera noté dans le bilan, sans pénalité. Le révéler ?</p>
                <div className="sheet-actions">
                  <button type="button" className="primary" onClick={() => send({ type: 'hint' })}>
                    Révéler l’indice {progress.hints + 1}/3
                  </button>
                  <button type="button" onClick={() => setHintsOpen(false)}>
                    Continuer sans indice
                  </button>
                </div>
              </div>
            ) : !solutionVisible ? (
              <div className="sheet-prompt">
                <p>
                  Je peux vous montrer la démarche complète. Le dossier sera marqué accompagné et
                  vous pourrez poursuivre normalement.
                </p>
                <div className="sheet-actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={() => setSolutionVisible(true)}
                  >
                    Voir la démarche
                  </button>
                  <button type="button" onClick={() => setHintsOpen(false)}>
                    Continuer à chercher
                  </button>
                </div>
              </div>
            ) : (
              <div className="sheet-prompt">
                <h3>Démarche complète</h3>
                <TextBlocks text={level.solution} />
                <MemoryCard title="À retenir" summary={level.capsule} />
                <p>
                  Prenez le temps de relire la preuve. Quand vous êtes prêts, nous conserverons ce
                  fragment ensemble.
                </p>
                <div className="sheet-actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      setHintsOpen(false);
                      send({ type: 'assist', confirmed: true });
                    }}
                  >
                    J’ai compris, continuer
                  </button>
                </div>
              </div>
            )}
          </Sheet>
        </>
      ) : null}
      <div className="status-line" aria-live="polite" aria-atomic="true">
        {message && message !== level.dialogue.return ? <p>{message}</p> : null}
        {evaluation?.status === 'correct' && !done ? (
          <p className="is-success">Étape validée.</p>
        ) : null}
      </div>
    </article>
  );
}
