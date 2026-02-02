import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  // Fire from left
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.1, y: 0.6 },
    colors: ['#fbbf24', '#f59e0b', '#d97706', '#60a5fa', '#3b82f6'],
  });

  // Fire from right
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.9, y: 0.6 },
    colors: ['#fbbf24', '#f59e0b', '#d97706', '#60a5fa', '#3b82f6'],
  });
};

export const fireStars = () => {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#fbbf24', '#f59e0b', '#d97706'],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ['star'],
    origin: { x: 0.5, y: 0.5 },
  });

  confetti({
    ...defaults,
    particleCount: 25,
    scalar: 0.75,
    shapes: ['circle'],
    origin: { x: 0.5, y: 0.5 },
  });
};

export const fireGoldenShower = () => {
  const end = Date.now() + 1000;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#fbbf24', '#f59e0b', '#fcd34d'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#fbbf24', '#f59e0b', '#fcd34d'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};
