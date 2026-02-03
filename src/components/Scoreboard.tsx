import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScoreboardProps {
  group1Score: number;
  group2Score: number;
  questionsAnswered: number;
  totalQuestions: number;
  isAnimating: boolean;
  onReset: () => void;
}

const Scoreboard = ({ group1Score, group2Score, questionsAnswered, totalQuestions, isAnimating, onReset }: ScoreboardProps) => {
  const progress = (questionsAnswered / totalQuestions) * 100;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      className="scoreboard rounded-2xl p-6 mb-6"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Group 1 Score */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-muted-foreground text-sm uppercase tracking-wider">Group 1</p>
            <motion.p
              key={`g1-${group1Score}`}
              className={`text-3xl md:text-4xl font-display text-primary ${isAnimating ? 'score-animate' : ''}`}
            >
              {group1Score.toLocaleString()} pts
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

        {/* Group 2 Score */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-sm uppercase tracking-wider">Group 2</p>
            <motion.p
              key={`g2-${group2Score}`}
              className={`text-3xl md:text-4xl font-display text-secondary ${isAnimating ? 'score-animate' : ''}`}
            >
              {group2Score.toLocaleString()} pts
            </motion.p>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-secondary" />
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
