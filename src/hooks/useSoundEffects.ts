import { useCallback, useRef } from 'react';

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

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    const ctx = getAudioContext();
    const frequencies = FREQUENCIES[type];
    const duration = DURATIONS[type];

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = type === 'wrong' ? 'sawtooth' : type === 'urgentTick' || type === 'timeUp' ? 'square' : 'sine';

      const startTime = ctx.currentTime + index * (type === 'timeUp' ? 0.12 : duration * 0.5);
      const endTime = startTime + duration;

      const volume = type === 'tick' ? 0.1 : type === 'urgentTick' ? 0.2 : type === 'timeUp' ? 0.3 : 0.15;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

      oscillator.start(startTime);
      oscillator.stop(endTime);
    });
  }, [getAudioContext]);

  const playSelect = useCallback(() => playSound('select'), [playSound]);
  const playCorrect = useCallback(() => playSound('correct'), [playSound]);
  const playWrong = useCallback(() => playSound('wrong'), [playSound]);
  const playReveal = useCallback(() => playSound('reveal'), [playSound]);
  const playHover = useCallback(() => playSound('hover'), [playSound]);
  const playTick = useCallback(() => playSound('tick'), [playSound]);
  const playUrgentTick = useCallback(() => playSound('urgentTick'), [playSound]);
  const playTimeUp = useCallback(() => playSound('timeUp'), [playSound]);

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
