import { flushSync } from 'react-dom';

type ViewTransition = {
  ready?: Promise<unknown>;
  finished?: Promise<unknown>;
  updateCallbackDone?: Promise<unknown>;
};
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

const ignore = () => undefined;

export function withTransition(update: () => void, reducedMotion: boolean) {
  const doc = document as ViewTransitionDocument;
  if (reducedMotion || typeof doc.startViewTransition !== 'function') {
    update();
    return;
  }
  const transition = doc.startViewTransition(() => flushSync(update));
  transition.ready?.catch(ignore);
  transition.finished?.catch(ignore);
  transition.updateCallbackDone?.catch(ignore);
}
