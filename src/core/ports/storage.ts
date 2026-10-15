import type { Session } from '../session/engine';

export interface SessionStorage {
  read(): string | null;
  write(session: Session): void;
}
