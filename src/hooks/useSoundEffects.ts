import { useCallback, useSyncExternalStore } from 'react';

type SoundType = 'select' | 'correct' | 'wrong' | 'reveal' | 'hover' | 'tick' | 'urgentTick' | 'timeUp';

const FREQUENCIES: Record<SoundType, number[]> = {
  select: [440, 554, 659],
  correct: [523, 659, 784, 1047],
  wrong: [200, 150],
  reveal: [330, 440, 554],
  hover: [880],
  tick: [800],
  urgentTick: [1000, 1200],
  timeUp: [880, 880, 880, 1100, 880, 880],
};

const DURATIONS: Record<SoundType, number> = {
  select: 0.1,
  correct: 0.15,
  wrong: 0.2,
  reveal: 0.12,
  hover: 0.05,
  tick: 0.05,
  urgentTick: 0.08,
  timeUp: 0.15,
};

const VOLUMES: Partial<Record<SoundType, number>> = {
  hover: 0.05,
  tick: 0.1,
  urgentTick: 0.2,
  timeUp: 0.3,
};

const MUTE_KEY = 'quiz-showdown:muted';

// One shared AudioContext and mute flag for the whole app.
let audioContext: AudioContext | null = null;
let muted = (() => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
})();
const listeners = new Set<() => void>();

const getAudioContext = () => {
  if (!audioContext) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new Ctor();
  }
  // Browsers start the context suspended until a user gesture.
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
};

export const setMuted = (value: boolean) => {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
};

export const useMuted = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => muted,
  );

const playSound = (type: SoundType) => {
  if (muted) return;
  let ctx: AudioContext;
  try {
    ctx = getAudioContext();
  } catch {
    return;
  }
  const frequencies = FREQUENCIES[type];
  const duration = DURATIONS[type];
  const volume = VOLUMES[type] ?? 0.15;

  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = freq;
    oscillator.type = type === 'wrong' ? 'sawtooth' : type === 'urgentTick' || type === 'timeUp' ? 'square' : 'sine';

    const startTime = ctx.currentTime + index * (type === 'timeUp' ? 0.12 : duration * 0.5);
    const endTime = startTime + duration;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

    oscillator.start(startTime);
    oscillator.stop(endTime);
  });
};

export const useSoundEffects = () => {
  const playSelect = useCallback(() => playSound('select'), []);
  const playCorrect = useCallback(() => playSound('correct'), []);
  const playWrong = useCallback(() => playSound('wrong'), []);
  const playReveal = useCallback(() => playSound('reveal'), []);
  const playHover = useCallback(() => playSound('hover'), []);
  const playTick = useCallback(() => playSound('tick'), []);
  const playUrgentTick = useCallback(() => playSound('urgentTick'), []);
  const playTimeUp = useCallback(() => playSound('timeUp'), []);

  return {
    playSelect,
    playCorrect,
    playWrong,
    playReveal,
    playHover,
    playTick,
    playUrgentTick,
    playTimeUp,
  };
};
