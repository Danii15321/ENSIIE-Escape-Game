import type { SessionStorage } from '../../core/ports/storage';
import type { Session } from '../../core/session/engine';

export const SAVE_KEY = 'chrono-iie:session:v1';
export function localStorageAdapter(storage: Pick<Storage, 'getItem' | 'setItem'>): SessionStorage {
  return {
    read: () => storage.getItem(SAVE_KEY),
    write: (session) => storage.setItem(SAVE_KEY, JSON.stringify(session)),
  };
}
export function downloadSave(session: Session) {
  downloadText(JSON.stringify(session, null, 2), `chrono-iie-${session.id}.json`);
}
export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
