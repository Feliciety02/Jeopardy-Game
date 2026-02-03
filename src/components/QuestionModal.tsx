import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Question, getRandomPrompt } from '@/data/gameData';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface QuestionModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onAnswer: (winner: 'group1' | 'group2' | 'both' | 'none') => void;
  categoryName: string;
}

const QuestionModal = ({ question, isOpen, onClose, onAnswer, categoryName }: QuestionModalProps) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [hostPrompt, setHostPrompt] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShowAnswer(false);
      setHostPrompt(getRandomPrompt('selectQuestion'));
    }
  }, [isOpen, question]);

  if (!question) return null;

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateX: -15 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotateX: 15 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="question-modal relative w-full max-w-4xl bg-card border-4 border-primary rounded-2xl p-8 md:p-12 shadow-2xl overflow-hidden"
          >
            {/* Spotlight Effect */}
            <div className="absolute inset-0 spotlight pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Category & Value */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <span className="text-accent text-lg font-medium">{categoryName}</span>
              <span className="mx-3 text-muted-foreground">•</span>
              <span className="text-secondary text-lg font-display">{question.value} pts</span>
            </motion.div>

            {/* Host Prompt */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="host-text text-center text-sm mb-6 italic"
            >
              "{hostPrompt}"
            </motion.p>

            {/* Question */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-display text-foreground leading-relaxed text-glow-gold">
                {question.question}
              </h2>
            </motion.div>

            {/* Answer Section */}
            <AnimatePresence mode="wait">
              {!showAnswer ? (
                <motion.div
                  key="reveal-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <Button
                    onClick={handleRevealAnswer}
                    variant="outline"
                    size="lg"
                    className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-display text-xl px-8 py-6 animate-glow-pulse"
                  >
                    REVEAL ANSWER
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="text-center"
                >
                  {/* Answer */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 p-6 bg-muted/50 rounded-xl border border-secondary/30"
                  >
                    <p className="text-muted-foreground text-sm mb-2">THE ANSWER IS:</p>
                    <p className="text-xl md:text-2xl font-display text-secondary text-glow-gold">
                      {question.answer}
                    </p>
                  </motion.div>

                  {/* Winner Buttons */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <p className="text-muted-foreground text-sm mb-4">Who answered correctly?</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => onAnswer('group1')}
                        className="bg-primary hover:bg-primary/80 text-primary-foreground text-lg font-display px-8 py-6 hover:scale-105 transition-transform"
                      >
                        GROUP 1
                      </Button>
                      <Button
                        onClick={() => onAnswer('group2')}
                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-lg font-display px-8 py-6 hover:scale-105 transition-transform"
                      >
                        GROUP 2
                      </Button>
                      <Button
                        onClick={() => onAnswer('both')}
                        className="bg-accent hover:bg-accent/80 text-accent-foreground text-lg font-display px-8 py-6 hover:scale-105 transition-transform"
                      >
                        BOTH
                      </Button>
                      <Button
                        onClick={() => onAnswer('none')}
                        variant="outline"
                        className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground text-lg font-display px-8 py-6 hover:scale-105 transition-transform"
                      >
                        NEITHER
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionModal;
