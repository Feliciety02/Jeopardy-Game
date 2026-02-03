import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Skull, Flame, Star, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompetitiveResultsModalProps {
  isOpen: boolean;
  team1Name: string;
  team2Name: string;
  pointsValue: number;
  onSelectWinner: (winner: 'team1' | 'team2' | 'both' | 'none') => void;
  result: {
    winner: 'team1' | 'team2' | 'both' | 'none';
    team1Change: number;
    team2Change: number;
    team1NewScore: number;
    team2NewScore: number;
  } | null;
  onClose: () => void;
}

const CompetitiveResultsModal = ({
  isOpen,
  team1Name,
  team2Name,
  pointsValue,
  onSelectWinner,
  result,
  onClose,
}: CompetitiveResultsModalProps) => {
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
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-4xl bg-gradient-to-br from-card via-card to-muted rounded-3xl p-8 md:p-12 border-4 border-accent overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />

            {!result ? (
              // Selection Phase
              <div className="relative z-10">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center mb-10"
                >
                  <h2 className="text-4xl md:text-5xl font-display text-foreground text-glow-gold mb-4">
                    WHO ANSWERED CORRECTLY?
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-6 h-6 text-secondary" />
                    <span className="text-2xl font-display text-secondary">
                      {pointsValue} POINTS AT STAKE
                    </span>
                    <Star className="w-6 h-6 text-secondary" />
                  </div>
                </motion.div>

                {/* Selection buttons */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectWinner('team1')}
                    className="p-8 rounded-2xl bg-primary/20 border-4 border-primary hover:bg-primary/30 transition-colors group"
                  >
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-primary group-hover:animate-bounce" />
                    <p className="text-2xl font-display text-primary">{team1Name}</p>
                    <p className="text-sm text-muted-foreground mt-2">+{pointsValue} pts</p>
                    <p className="text-xs text-red-400 mt-1">{team2Name} -{pointsValue} pts</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectWinner('team2')}
                    className="p-8 rounded-2xl bg-secondary/20 border-4 border-secondary hover:bg-secondary/30 transition-colors group"
                  >
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-secondary group-hover:animate-bounce" />
                    <p className="text-2xl font-display text-secondary">{team2Name}</p>
                    <p className="text-sm text-muted-foreground mt-2">+{pointsValue} pts</p>
                    <p className="text-xs text-red-400 mt-1">{team1Name} -{pointsValue} pts</p>
                  </motion.button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectWinner('both')}
                    className="p-6 rounded-2xl bg-accent/20 border-4 border-accent hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Flame className="w-8 h-8 text-accent" />
                      <span className="text-xl font-display text-accent">BOTH CORRECT</span>
                      <Flame className="w-8 h-8 text-accent" />
                    </div>
                    <p className="text-sm text-muted-foreground">Both teams +{pointsValue} pts</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectWinner('none')}
                    className="p-6 rounded-2xl bg-muted/50 border-4 border-muted-foreground/30 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Minus className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xl font-display text-muted-foreground">NEITHER CORRECT</span>
                      <Minus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No points awarded</p>
                  </motion.button>
                </div>
              </div>
            ) : (
              // Results Phase
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-4xl md:text-5xl font-display text-foreground text-glow-gold mb-2">
                    {result.winner === 'both'
                      ? '🎉 BOTH TEAMS WIN! 🎉'
                      : result.winner === 'none'
                      ? 'NO WINNERS'
                      : `🏆 ${result.winner === 'team1' ? team1Name : team2Name} WINS! 🏆`}
                  </h2>
                </motion.div>

                {/* Score changes */}
                <div className="grid grid-cols-2 gap-8 mb-10">
                  {/* Team 1 result */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`p-6 rounded-2xl border-4 ${
                      result.team1Change > 0
                        ? 'bg-green-500/20 border-green-500'
                        : result.team1Change < 0
                        ? 'bg-red-500/20 border-red-500'
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <p className="text-xl font-display text-foreground mb-2">{team1Name}</p>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                      className={`text-4xl font-display ${
                        result.team1Change > 0
                          ? 'text-green-400'
                          : result.team1Change < 0
                          ? 'text-red-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {result.team1Change > 0 ? '+' : ''}
                      {result.team1Change}
                    </motion.p>
                    <p className="text-muted-foreground mt-2">
                      New Total: <span className="text-foreground font-bold">{result.team1NewScore}</span>
                    </p>
                  </motion.div>

                  {/* Team 2 result */}
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`p-6 rounded-2xl border-4 ${
                      result.team2Change > 0
                        ? 'bg-green-500/20 border-green-500'
                        : result.team2Change < 0
                        ? 'bg-red-500/20 border-red-500'
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <p className="text-xl font-display text-foreground mb-2">{team2Name}</p>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                      className={`text-4xl font-display ${
                        result.team2Change > 0
                          ? 'text-green-400'
                          : result.team2Change < 0
                          ? 'text-red-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {result.team2Change > 0 ? '+' : ''}
                      {result.team2Change}
                    </motion.p>
                    <p className="text-muted-foreground mt-2">
                      New Total: <span className="text-foreground font-bold">{result.team2NewScore}</span>
                    </p>
                  </motion.div>
                </div>

                {/* Continue button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <Button
                    onClick={onClose}
                    size="lg"
                    className="bg-accent hover:bg-accent/80 text-accent-foreground font-display text-2xl px-12 py-8"
                  >
                    CONTINUE
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompetitiveResultsModal;
