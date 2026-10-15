import { useEffect, useRef, useState } from 'react';
import type { Catalog } from '../core/content/catalog';
import {
  createSession,
  dispatch,
  restoreSession,
  type Command,
  type Session,
} from '../core/session/engine';
import type { Evaluation } from '../core/contracts';
import { localStorageAdapter, SAVE_KEY } from '../adapters/storage/local';

type State = {
  session: Session;
  notice: string;
  blocked: boolean;
  raw: string | null;
  evaluation?: Evaluation;
  message?: string;
};
export function useGame(catalog: Catalog) {
  const fresh = () => createSession(catalog, catalog.sites.demo!, crypto.randomUUID());
  const [state, setState] = useState<State>(() => {
    let raw: string | null = null;
    try {
      raw = localStorageAdapter(window.localStorage).read();
      return {
        session: raw ? restoreSession(JSON.parse(raw), catalog) : fresh(),
        notice: '',
        blocked: false,
        raw,
      };
    } catch (error) {
      return {
        session: fresh(),
        notice: `Reprise indisponible : ${String(error)}. Exportez l’original avant de choisir une nouvelle partie.`,
        blocked: raw !== null,
        raw,
      };
    }
  });
  const current = useRef(state);
  const update = (next: State) => {
    current.current = next;
    setState(next);
  };
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === SAVE_KEY && event.newValue !== current.current.raw) {
        const next = {
          ...current.current,
          blocked: true,
          notice:
            'Une autre fenêtre a modifié la partie. Exportez votre copie, puis rechargez pour reprendre la version enregistrée.',
        };
        current.current = next;
        setState(next);
      }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);
  const persist = (
    session: Session,
    override = false,
    evaluation?: Evaluation,
    message?: string,
  ) => {
    let next: State = {
      session,
      raw: current.current.raw,
      blocked: false,
      notice: '',
      evaluation,
      message,
    };
    try {
      const storage = localStorageAdapter(window.localStorage);
      if (!override && storage.read() !== current.current.raw) {
        update({
          ...current.current,
          blocked: true,
          notice: 'Une autre fenêtre a modifié la sauvegarde. Rechargez avant de continuer.',
        });
        return;
      }
      storage.write(session);
      next.raw = JSON.stringify(session);
    } catch {
      next = {
        ...next,
        notice:
          'Sauvegarde indisponible : la partie continue en mémoire. Exportez votre progression avant de fermer.',
      };
    }
    update(next);
  };
  return {
    ...state,
    send(command: Command) {
      if (current.current.blocked) return;
      const result = dispatch(current.current.session, catalog, command);
      persist(result.session, false, result.evaluation, result.message);
    },
    reset() {
      persist(fresh(), true);
    },
    importSave(raw: string) {
      try {
        persist(restoreSession(JSON.parse(raw), catalog), true);
      } catch (error) {
        update({ ...current.current, notice: `Import refusé : ${String(error)}` });
      }
    },
  };
}
