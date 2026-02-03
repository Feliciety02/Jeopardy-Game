import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { Question } from '@/data/gameData';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback } from 'react';

interface QuestionModalProps {
  question: Question | null;
  isOpen: boolean;
  categoryName: string;
  timerDuration: number;
  onTimerEnd: () => void;
  onForceEnd: () => void;
}

const QuestionModal = ({
  question,
  isOpen,
  categoryName,
  timerDuration,
  onTimerEnd,
  onForceEnd,
}: QuestionModalProps) => {
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (isOpen && question) {
      setTimeLeft(timerDuration);
      setShowAnswer(false);
    }
  }, [isOpen, question, timerDuration]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowAnswer(true);
          setTimeout(onTimerEnd, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, onTimerEnd]);

  const handleForceEnd = useCallback(() => {
    setShowAnswer(true);
    setTimeout(onForceEnd, 1000);
  }, [onForceEnd]);

  if (!question) return null;

  const progressPercent = (timeLeft / timerDuration) * 100;
  const isLowTime = timeLeft <= 5;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Full screen backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-primary/90 via-background to-secondary/90"
          />

          {/* Timer bar at top */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-muted/30">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full transition-colors ${
                isLowTime ? 'bg-red-500 animate-pulse' : 'bg-accent'
              }`}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-8 text-center">
            {/* Category & Points */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <span className="inline-block px-6 py-2 bg-card/80 rounded-full text-lg font-medium text-accent border border-accent/50">
                {categoryName}
              </span>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Zap className="w-8 h-8 text-secondary" />
                <span className="text-4xl font-display text-secondary text-glow-gold">
                  {question.value} POINTS
                </span>
                <Zap className="w-8 h-8 text-secondary" />
              </div>
            </motion.div>

            {/* Timer */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className={`mb-10 inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-4 ${
                isLowTime
                  ? 'bg-red-500/20 border-red-500 animate-pulse'
                  : 'bg-card/80 border-accent'
              }`}
            >
              <Clock className={`w-10 h-10 ${isLowTime ? 'text-red-400' : 'text-accent'}`} />
              <span
                className={`text-6xl font-display ${
                  isLowTime ? 'text-red-400' : 'text-foreground'
                }`}
              >
                {timeLeft}
              </span>
            </motion.div>

            {/* Question */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="mb-10"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display text-foreground leading-relaxed text-glow-gold">
                {question.question}
              </h2>
            </motion.div>

            {/* Answer reveal */}
            <AnimatePresence>
              {showAnswer && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="mb-8 p-8 bg-card/90 rounded-2xl border-4 border-secondary"
                >
                  <p className="text-muted-foreground text-lg mb-2">THE ANSWER IS:</p>
                  <p className="text-3xl md:text-4xl font-display text-secondary text-glow-gold">
                    {question.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* End question early button */}
            {!showAnswer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={handleForceEnd}
                  size="lg"
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-display text-xl px-10 py-6"
                >
                  END QUESTION
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionModal;
