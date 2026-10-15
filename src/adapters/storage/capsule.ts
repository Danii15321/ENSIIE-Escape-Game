type CapsuleStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export const capsuleKey = (sessionId: string) => `chrono-iie:capsule:v1:${sessionId}`;
export function readCapsule(
  storage: CapsuleStorage,
  sessionId: string,
): { text: string; notice: string } {
  try {
    const raw = storage.getItem(capsuleKey(sessionId));
    if (!raw) return { text: '', notice: '' };
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== 'object' ||
      value === null ||
      !('version' in value) ||
      value.version !== 1 ||
      !('text' in value) ||
      typeof value.text !== 'string' ||
      value.text.length > 500
    )
      throw new Error('Invalid capsule');
    return { text: value.text, notice: '' };
  } catch {
    return {
      text: '',
      notice:
        'La contribution enregistrée ne peut pas être lue. Son original reste sur cet appareil.',
    };
  }
}
export function saveCapsule(storage: CapsuleStorage, sessionId: string, text: string) {
  if (text.length > 500)
    return { ok: false, notice: 'La contribution est limitée à 500 caractères.' };
  try {
    storage.setItem(capsuleKey(sessionId), JSON.stringify({ version: 1, text }));
    return { ok: true, notice: 'Votre idée est conservée sur cet appareil.' };
  } catch {
    return {
      ok: false,
      notice: 'La conservation locale a échoué. Copiez votre idée avant de quitter cet écran.',
    };
  }
}
export function clearCapsule(storage: CapsuleStorage, sessionId: string) {
  try {
    storage.removeItem(capsuleKey(sessionId));
    return { ok: true, notice: 'Aucune contribution conservée pour cette partie.' };
  } catch {
    return { ok: false, notice: 'La contribution enregistrée n’a pas pu être retirée. Réessayez.' };
  }
}
