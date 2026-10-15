import { flushSync } from 'react-dom';

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

export function withTransition(update: () => void, reducedMotion: boolean) {
  const doc = document as ViewTransitionDocument;
  if (reducedMotion || typeof doc.startViewTransition !== 'function') {
    update();
    return;
  }
  doc.startViewTransition(() => flushSync(update));
}
