import { useEffect, useRef, useState } from 'react';

type Store = Pick<Storage, 'getItem' | 'setItem'>;
export const timeKey = (sessionId: string) => `chrono-iie:time:${sessionId}`;

export function readSeconds(storage: Store | null, sessionId: string): number {
  try {
    const value = Number(storage?.getItem(timeKey(sessionId)) ?? 0);
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

function writeSeconds(storage: Store | null, sessionId: string, seconds: number) {
  try {
    storage?.setItem(timeKey(sessionId), String(seconds));
  } catch {
    /* Le temps reste compté en mémoire si le stockage est indisponible. */
  }
}

const storage = (): Store | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export function useActiveTime(sessionId: string, running: boolean): number {
  const [seconds, setSeconds] = useState(() => readSeconds(storage(), sessionId));
  const latest = useRef(seconds);
  useEffect(() => {
    const initial = readSeconds(storage(), sessionId);
    latest.current = initial;
    setSeconds(initial);
  }, [sessionId]);
  useEffect(() => {
    if (!running) return;
    const save = () => writeSeconds(storage(), sessionId, latest.current);
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      latest.current += 1;
      setSeconds(latest.current);
      if (latest.current % 15 === 0) save();
    }, 1000);
    document.addEventListener('visibilitychange', save);
    window.addEventListener('pagehide', save);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', save);
      window.removeEventListener('pagehide', save);
      save();
    };
  }, [running, sessionId]);
  return seconds;
}
