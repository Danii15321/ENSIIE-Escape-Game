import { useState } from 'react';
import { FocusedLevelTitle, NarrativeCard, TextBlocks } from './Cards';
import { SourceLink } from './QrCode';

export type EndingTheme = 'lucidite' | 'sobriete' | 'partage' | 'horizon-commun';
type Line = { speaker: string; text: string };
export type EndingCopy = {
  version: 1;
  title: string;
  fictionNotice: string;
  opening: (Line & { id: string })[];
  variants: Record<EndingTheme, { title: string; lines: Line[] }>;
  commitments: { questionId: string; optionId: string; theme: string; text: string }[];
  timeline: { year: number; text: string; sourceIds: string[] }[];
  projection: string;
  message: Line & { maxLength: number; saveLabel: string; skipLabel: string; privacy: string };
  closing: Line;
  actions: { memory: string; export: string; home: string };
  exportNotice: string;
};
export type EndingModel = {
  team: string;
  theme: EndingTheme;
  commitments: string[];
  missionsAssisted: number;
  hints: number;
  observationsAssisted: number;
  badges: string[];
  activeMinutes?: number;
};
type Props = {
  copy: EndingCopy;
  model: EndingModel;
  sources: Record<string, { title: string; url: string }>;
  initialMessage: string;
  initialNotice: string;
  onSaveMessage: (text: string) => { ok: boolean; notice: string };
  onClearMessage: () => { ok: boolean; notice: string };
  onExport: (message: string) => void;
  onMemory: () => void;
  onHome: () => void;
};
export function EndingView({
  copy,
  model,
  sources,
  initialMessage,
  initialNotice,
  onSaveMessage,
  onClearMessage,
  onExport,
  onMemory,
  onHome,
}: Props) {
  const [message, setMessage] = useState(initialMessage);
  const [saved, setSaved] = useState(initialMessage);
  const [notice, setNotice] = useState(initialNotice);
  const variant = copy.variants[model.theme];
  const interpolate = (text: string) => text.replaceAll('{equipe}', model.team);
  return (
    <article className="level ending">
      <div className="capsule-opening" aria-hidden="true">
        <span className="capsule-light" />
        <span className="capsule-half is-top" />
        <span className="capsule-half is-bottom" />
      </div>
      <header>
        <p className="eyebrow">2068 · {model.team}</p>
        <FocusedLevelTitle title={copy.title} />
        <p>{copy.fictionNotice}</p>
      </header>
      <section aria-label="Ouverture de la capsule">
        {copy.opening.map((line) => (
          <NarrativeCard key={line.id} speaker={line.speaker} text={line.text} />
        ))}
      </section>
      <section aria-labelledby="ending-variant">
        <h3 id="ending-variant">{variant.title}</h3>
        {variant.lines.map((line, index) => (
          <NarrativeCard key={index} speaker={line.speaker} text={line.text} />
        ))}
      </section>
      <section aria-label="Vos engagements">
        <h3>Vos engagements</h3>
        {model.commitments.length ? (
          <ol>
            {model.commitments.map((text, index) => (
              <li key={index}>
                <TextBlocks text={text} />
              </li>
            ))}
          </ol>
        ) : (
          <p>Votre équipe n’a enregistré aucun engagement. L’avenir reste ouvert.</p>
        )}
      </section>
      <section aria-label="Les repères historiques">
        <h3>Les repères historiques</h3>
        <ol className="ending-timeline">
          {copy.timeline.map((entry) => (
            <li key={entry.year}>
              <strong>
                {entry.year} — {entry.text}
              </strong>
              <ul className="source-list">
                {entry.sourceIds.map((id) => (
                  <li key={id}>
                    <SourceLink title={sources[id]!.title} url={sources[id]!.url} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="notice">{copy.projection}</p>
      </section>
      <section aria-label="Bilan de la partie">
        <h3>Votre parcours</h3>
        <dl className="ending-summary">
          <div>
            <dt>Missions accompagnées</dt>
            <dd>{model.missionsAssisted}</dd>
          </div>
          <div>
            <dt>Indices consultés</dt>
            <dd>{model.hints}</dd>
          </div>
          <div>
            <dt>Observations avec secours</dt>
            <dd>{model.observationsAssisted}</dd>
          </div>
          <div>
            <dt>Durée active</dt>
            <dd>
              {model.activeMinutes === undefined
                ? 'Non mesurée dans cette version'
                : `${model.activeMinutes} min`}
            </dd>
          </div>
        </dl>
        <ul aria-label="Badges du parcours">
          {model.badges.map((badge) => (
            <li key={badge}>{badge}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="capsule-contribution">
        <h3 id="capsule-contribution">Une trace pour demain</h3>
        <NarrativeCard speaker={copy.message.speaker} text={copy.message.text} />
        <p id="capsule-privacy">{copy.message.privacy}</p>
        <label htmlFor="capsule-message">Votre idée (facultatif)</label>
        <textarea
          id="capsule-message"
          maxLength={copy.message.maxLength}
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, copy.message.maxLength))}
          aria-describedby="capsule-privacy capsule-count"
          rows={5}
        />
        <p id="capsule-count">
          {message.length}/{copy.message.maxLength} caractères
        </p>
        <div className="actions">
          <button
            onClick={() => {
              const result = onSaveMessage(message);
              setNotice(result.notice);
              if (result.ok) setSaved(message);
            }}
          >
            {copy.message.saveLabel}
          </button>
          <button
            onClick={() => {
              const result = onClearMessage();
              setNotice(result.notice);
              if (result.ok) {
                setMessage('');
                setSaved('');
              }
            }}
          >
            {copy.message.skipLabel}
          </button>
        </div>
        {message !== saved ? (
          <p>Les modifications de votre idée ne sont pas encore conservées.</p>
        ) : null}
        <p role="status">{notice}</p>
      </section>
      <NarrativeCard speaker={copy.closing.speaker} text={interpolate(copy.closing.text)} />
      <div className="actions">
        <button onClick={onMemory}>{copy.actions.memory}</button>
        <button onClick={() => onExport(saved)}>{copy.actions.export}</button>
        <button onClick={onHome}>{copy.actions.home}</button>
      </div>
    </article>
  );
}
