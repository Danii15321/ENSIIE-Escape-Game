import type { Cue } from '../presentation/components/Ambience';

type Note = [frequency: number, delay: number, duration: number];
const CUES: Record<Cue, Note[]> = {
  connexion: [
    [659.25, 0, 0.18],
    [987.77, 0.1, 0.32],
  ],
  fragment: [
    [880, 0, 0.35],
    [1318.51, 0.08, 0.4],
    [1760, 0.16, 0.6],
  ],
  acte: [
    [523.25, 0, 1.1],
    [659.25, 0.06, 1.1],
    [783.99, 0.12, 1.2],
    [1046.5, 0.22, 1.4],
  ],
  capsule: [
    [392, 0, 1.8],
    [523.25, 0.14, 1.8],
    [659.25, 0.28, 1.9],
    [987.77, 0.46, 2.1],
    [1318.51, 0.66, 2.3],
  ],
};

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (context) return context;
  const Constructor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Constructor) return null;
  try {
    context = new Constructor();
  } catch {
    return null;
  }
  return context;
}

export function playCue(name: Cue) {
  const ctx = audio();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
  const now = ctx.currentTime + 0.02;
  const master = ctx.createGain();
  master.gain.value = 0.09;
  master.connect(ctx.destination);
  for (const [frequency, delay, duration] of CUES[name]) {
    for (const [type, detune, level] of [
      ['sine', 0, 1],
      ['triangle', 7, 0.35],
    ] as const) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.detune.value = detune;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(level, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
      oscillator.connect(gain).connect(master);
      oscillator.start(now + delay);
      oscillator.stop(now + delay + duration + 0.05);
    }
  }
}
