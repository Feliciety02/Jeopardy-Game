import { useCallback, useRef } from 'react';

type SoundType = 'select' | 'correct' | 'wrong' | 'reveal' | 'hover';

const FREQUENCIES: Record<SoundType, number[]> = {
  select: [440, 554, 659],
  correct: [523, 659, 784, 1047],
  wrong: [200, 150],
  reveal: [330, 440, 554],
  hover: [880],
};

const DURATIONS: Record<SoundType, number> = {
  select: 0.1,
  correct: 0.15,
  wrong: 0.2,
  reveal: 0.12,
  hover: 0.05,
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
      oscillator.type = type === 'wrong' ? 'sawtooth' : 'sine';

      const startTime = ctx.currentTime + index * (duration * 0.8);
      const endTime = startTime + duration;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
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

  return {
    playSelect,
    playCorrect,
    playWrong,
    playReveal,
    playHover,
  };
};
