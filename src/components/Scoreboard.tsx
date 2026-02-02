import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScoreboardProps {
  score: number;
  questionsAnswered: number;
  totalQuestions: number;
  isAnimating: boolean;
  onReset: () => void;
}

const Scoreboard = ({ score, questionsAnswered, totalQuestions, isAnimating, onReset }: ScoreboardProps) => {
  const progress = (questionsAnswered / totalQuestions) * 100;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      className="scoreboard rounded-2xl p-6 mb-6"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Score Display */}
        <div className="flex items-center gap-4">
          <Trophy className="w-8 h-8 text-secondary animate-float" />
          <div className="text-center md:text-left">
            <p className="text-muted-foreground text-sm uppercase tracking-wider">Score</p>
            <motion.p
              key={score}
              className={`text-4xl md:text-5xl font-display text-secondary ${isAnimating ? 'score-animate' : ''}`}
            >
              ${score.toLocaleString()}
            </motion.p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex-1 max-w-xs mx-4">
          <p className="text-muted-foreground text-sm text-center mb-2">
            {questionsAnswered} of {totalQuestions} questions
          </p>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
        </div>

        {/* Reset Button */}
        <Button
          onClick={onReset}
          variant="outline"
          className="border-2 border-muted-foreground/30 text-muted-foreground hover:border-secondary hover:text-secondary transition-all"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Game
        </Button>
      </div>
    </motion.div>
  );
};

export default Scoreboard;
