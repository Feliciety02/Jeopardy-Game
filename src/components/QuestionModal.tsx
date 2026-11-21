import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Plus, Eye, ArrowRight } from 'lucide-react';
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

  const fraction = totalTime > 0 ? timeLeft / totalTime : 0;
  const isLowTime = timeLeft <= 10;
  const isCriticalTime = timeLeft <= 5 && !paused && !showAnswer;
  const ringColor = paused
    ? 'hsl(var(--muted-foreground))'
    : isCriticalTime
    ? 'hsl(var(--destructive))'
    : isLowTime
    ? 'hsl(28 95% 60%)'
    : 'hsl(var(--primary))';
  const R = 44;
  const C = 2 * Math.PI * R;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="stage-bg fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`${categoryName} for ${question.value} points`}
        >
          {/* thin timer bar */}
          <div className="absolute inset-x-0 top-0 h-1 bg-muted">
            <motion.div
              animate={{ width: `${fraction * 100}%` }}
              transition={{ duration: 0.35 }}
              className="h-full"
              style={{ background: ringColor }}
            />
          </div>

          <div className="relative w-full max-w-5xl mx-auto px-5 md:px-10 py-14 text-center">
            {/* Category & points */}
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center justify-center gap-2"
            >
              <span className="rounded-full border bg-card/70 px-4 py-1.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {categoryName}
              </span>
              <span className="rounded-full bg-primary px-4 py-1.5 text-xs sm:text-sm font-bold tabular-nums text-primary-foreground">
                {question.value} pts
              </span>
            </motion.div>

            {/* Countdown ring */}
            <AnimatePresence>
              {!showAnswer && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: isCriticalTime ? [1, 1.06, 1] : 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ scale: isCriticalTime ? { duration: 0.6, repeat: Infinity } : { duration: 0.3 } }}
                  className="relative mx-auto mt-8 h-28 w-28 sm:h-36 sm:w-36"
                >
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r={R}
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={C}
                      strokeDashoffset={C * (1 - fraction)}
                      style={{ transition: 'stroke-dashoffset 0.4s linear, stroke 0.3s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      key={timeLeft}
                      initial={{ y: -6, opacity: 0.4 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="font-display text-4xl sm:text-5xl font-extrabold tabular-nums leading-none"
                      style={{ color: paused ? 'hsl(var(--muted-foreground))' : isLowTime ? ringColor : undefined }}
                    >
                      {timeLeft}
                    </motion.span>
                    <span className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {paused ? 'Paused' : 'sec'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 20 }}
              className="mx-auto mt-8 sm:mt-10 max-w-4xl font-display text-2xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-balance"
            >
              {question.question}
            </motion.h2>

            {/* Answer */}
            <AnimatePresence>
              {showAnswer && (
                <motion.div
                  initial={{ y: 20, opacity: 0, scale: 0.97 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', damping: 18 }}
                  className="mx-auto mt-8 sm:mt-10 max-w-2xl rounded-2xl border-2 border-primary bg-primary/10 px-6 py-6 sm:py-8"
                  style={{ boxShadow: '0 0 60px -12px hsl(var(--primary) / 0.5)' }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {timeLeft === 0 ? "Time's up · the answer is" : 'The answer is'}
                  </p>
                  <p className="mt-2 font-display text-3xl sm:text-5xl font-extrabold text-foreground glow-brand">
                    {question.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-2.5"
            >
              {!showAnswer && (
                <>
                  <Button
                    onClick={() => setPaused((p) => !p)}
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-xl bg-card/60 px-5 font-semibold"
                  >
                    {paused ? <Play className="w-4 h-4 mr-2 fill-current" /> : <Pause className="w-4 h-4 mr-2" />}
                    {paused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button onClick={addTime} variant="outline" size="lg" className="h-12 rounded-xl bg-card/60 px-5 font-semibold">
                    <Plus className="w-4 h-4 mr-1.5" />
                    10s
                  </Button>
                </>
              )}
              <Button onClick={handleRevealNow} size="lg" className="h-12 rounded-xl px-7 text-base font-bold">
                {showAnswer ? (
                  <>
                    Score it <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" /> Reveal answer
                  </>
                )}
              </Button>
            </motion.div>
            <p className="mt-5 text-xs text-muted-foreground hidden md:block">
              Space pause · + add 10s · Enter {showAnswer ? 'go to scoring' : 'reveal answer'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionModal;
