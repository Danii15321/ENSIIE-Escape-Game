import type { Question } from '../../core/contracts';

type Props = {
  speaker: string;
  questions: Question[];
  choices: Record<string, string>;
  done: string;
  frozen: boolean;
  onChoose: (questionId: string, optionId: string | null) => void;
};

export function NarrativeChoice({ speaker, questions, choices, done, frozen, onChoose }: Props) {
  const complete = questions.every((question) => choices[question.id]);
  return (
    <section aria-label="Choix narratifs">
      {frozen ? <p role="status">La capsule est ouverte : vos choix sont figés.</p> : null}
      {questions.map((question, index) => {
        const chosen = question.options.find((option) => option.id === choices[question.id]);
        return (
          <fieldset key={question.id} disabled={frozen}>
            <legend>
              Question {index + 1} : {question.prompt}
            </legend>
            {question.options.map((option) => (
              <label className="check" key={option.id}>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={chosen?.id === option.id}
                  disabled={frozen}
                  onChange={() => onChoose(question.id, option.id)}
                />
                {option.label}
              </label>
            ))}
            {chosen ? (
              <>
                <p className="dialogue">
                  <strong>{speaker}</strong> {chosen.reply}
                </p>
                <button type="button" disabled={frozen} onClick={() => onChoose(question.id, null)}>
                  Retirer ma réponse
                </button>
              </>
            ) : null}
          </fieldset>
        );
      })}
      {complete ? (
        <p className="dialogue">
          <strong>{speaker}</strong> {done}
        </p>
      ) : null}
    </section>
  );
}
