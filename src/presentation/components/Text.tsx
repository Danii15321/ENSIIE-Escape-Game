export function TextBlocks({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((paragraph, i) => (
        <p key={i}>
          {paragraph.split(/(\[[A-Z]\])/).map((part, j) =>
            /^\[[A-Z]\]$/.test(part) ? (
              <span className="letter-frame" key={j} aria-label={`Lettre encadrée ${part[1]}`}>
                {part[1]}
              </span>
            ) : (
              part
            ),
          )}
        </p>
      ))}
    </>
  );
}
