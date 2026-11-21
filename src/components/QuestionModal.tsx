import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Pause, Play, Zap, Plus } from 'lucide-react';
import { Question } from '@/data/gameData';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface QuestionModalProps {
  question: Question | null;
  isOpen: boolean;
  categoryName: string;
  timerDuration: number;
  onTimerEnd: () => void;
}

const QuestionModal = ({
  question,
  isOpen,
  categoryName,
  timerDuration,
  onTimerEnd,
}: QuestionModalProps) => {
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [totalTime, setTotalTime] = useState(timerDuration);
  const [showAnswer, setShowAnswer] = useState(false);
  const [paused, setPaused] = useState(false);
  const { playTick, playUrgentTick, playTimeUp } = useSoundEffects();
  const endTimeoutRef = useRef<number | null>(null);

  const running = isOpen && !showAnswer && !paused && timeLeft > 0;

  // Reset whenever a new question opens.
  useEffect(() => {
    if (isOpen && question) {
      setTimeLeft(timerDuration);
      setTotalTime(timerDuration);
      setShowAnswer(false);
      setPaused(false);
    }
    return () => {
      if (endTimeoutRef.current) window.clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    };
  }, [isOpen, question, timerDuration]);

  // One interval that only runs while the clock is live.
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  // Tick sounds.
  useEffect(() => {
    if (!isOpen || showAnswer || paused || timeLeft <= 0 || timeLeft === totalTime) return;
    if (timeLeft <= 10) playUrgentTick();
    else playTick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const reveal = useCallback(
    (delay: number) => {
      setShowAnswer(true);
      if (endTimeoutRef.current) window.clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = window.setTimeout(onTimerEnd, delay);
    },
    [onTimerEnd],
  );

  // Time up.
  useEffect(() => {
    if (timeLeft === 0 && isOpen && !showAnswer) {
      playTimeUp();
      reveal(2500);
    }
  }, [timeLeft, isOpen, showAnswer, playTimeUp, reveal]);

  const handleRevealNow = useCallback(() => {
    if (showAnswer) {
      // Second press skips the wait.
      if (endTimeoutRef.current) window.clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
      onTimerEnd();
      return;
    }
    reveal(4000);
  }, [showAnswer, reveal, onTimerEnd]);

  const addTime = useCallback(() => {
    setTimeLeft((t) => t + 10);
    setTotalTime((t) => Math.max(t, timeLeft + 10));
  }, [timeLeft]);

  // Keyboard: Space = pause/resume, Enter = reveal / continue, + = add 10s.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!showAnswer) setPaused((p) => !p);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleRevealNow();
      } else if ((e.key === '+' || e.key === '=') && !showAnswer) {
        addTime();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, showAnswer, handleRevealNow, addTime]);

  if (!question) return null;

  const progressPercent = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const isLowTime = timeLeft <= 10;
  const isCriticalTime = timeLeft <= 5 && !paused && !showAnswer;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`${categoryName} for ${question.value} points`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-background to-secondary/90" />

          {/* Timer bar */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-muted/30">
            <motion.div
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full transition-colors ${
                paused ? 'bg-muted-foreground' : isLowTime ? 'bg-red-500 animate-pulse' : 'bg-accent'
              }`}
            />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 py-12 text-center">
            {/* Category & points */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 md:mb-8"
            >
              <span className="inline-block px-6 py-2 bg-card/80 rounded-full text-lg font-medium text-accent border border-accent/50">
                {categoryName}
              </span>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Zap className="w-7 h-7 md:w-8 md:h-8 text-secondary" />
                <span className="text-3xl md:text-4xl font-display text-secondary text-glow-gold">
                  {question.value} POINTS
                </span>
                <Zap className="w-7 h-7 md:w-8 md:h-8 text-secondary" />
              </div>
            </motion.div>

            {/* Timer */}
            {!showAnswer && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isCriticalTime ? [1, 1.1, 1] : 1 }}
                transition={{
                  delay: 0.3,
                  type: 'spring',
                  scale: isCriticalTime ? { duration: 0.5, repeat: Infinity } : undefined,
                }}
                className={`mb-8 md:mb-10 inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-4 transition-all duration-300 ${
                  paused
                    ? 'bg-card/80 border-muted-foreground'
                    : isCriticalTime
                    ? 'bg-red-600/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                    : isLowTime
                    ? 'bg-red-500/20 border-red-500'
                    : 'bg-card/80 border-accent'
                }`}
              >
                {paused ? (
                  <Pause className="w-10 h-10 text-muted-foreground" />
                ) : (
                  <Clock className={`w-10 h-10 ${isCriticalTime ? 'text-red-300' : isLowTime ? 'text-red-400' : 'text-accent'}`} />
                )}
                <motion.span
                  key={timeLeft}
                  initial={{ scale: 1.3, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-6xl font-display tabular-nums ${
                    paused ? 'text-muted-foreground' : isCriticalTime ? 'text-red-300' : isLowTime ? 'text-red-400' : 'text-foreground'
                  }`}
                  aria-live="off"
                >
                  {timeLeft}
                </motion.span>
              </motion.div>
            )}

            {/* Question */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="mb-8 md:mb-10"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display text-foreground leading-relaxed text-glow-gold">
                {question.question}
              </h2>
            </motion.div>

            {/* Answer */}
            <AnimatePresence>
              {showAnswer && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="mb-8 p-6 md:p-8 bg-card/90 rounded-2xl border-4 border-secondary"
                >
                  <p className="text-muted-foreground text-lg mb-2">
                    {timeLeft === 0 ? "TIME'S UP! THE ANSWER IS:" : 'THE ANSWER IS:'}
                  </p>
                  <p className="text-3xl md:text-4xl font-display text-secondary text-glow-gold">{question.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {!showAnswer && (
                <>
                  <Button
                    onClick={() => setPaused((p) => !p)}
                    size="lg"
                    variant="outline"
                    className="font-display text-lg px-6 py-6 bg-card/60"
                  >
                    {paused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                    {paused ? 'RESUME' : 'PAUSE'}
                  </Button>
                  <Button onClick={addTime} size="lg" variant="outline" className="font-display text-lg px-6 py-6 bg-card/60">
                    <Plus className="w-5 h-5 mr-1" />
                    10s
                  </Button>
                </>
              )}
              <Button
                onClick={handleRevealNow}
                size="lg"
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-display text-xl px-10 py-6"
              >
                {showAnswer ? 'SCORE IT' : 'REVEAL ANSWER'}
              </Button>
            </motion.div>
            <p className="mt-6 text-xs text-muted-foreground hidden md:block">
              Space: pause · +: add 10s · Enter: {showAnswer ? 'go to scoring' : 'reveal answer'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionModal;
