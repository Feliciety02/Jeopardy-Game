import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

type Winner = 'team1' | 'team2' | 'both' | 'none';

interface CompetitiveResultsModalProps {
  isOpen: boolean;
  team1Name: string;
  team2Name: string;
  pointsValue: number;
  onSelectWinner: (winner: Winner) => void;
  result: {
    winner: Winner;
    team1Change: number;
    team2Change: number;
    team1NewScore: number;
    team2NewScore: number;
  } | null;
  onClose: () => void;
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="hidden md:inline-flex h-6 min-w-6 items-center justify-center rounded-md border bg-background/60 px-1.5 text-xs font-semibold text-muted-foreground">
    {children}
  </kbd>
);

const CompetitiveResultsModal = ({
  isOpen,
  team1Name,
  team2Name,
  pointsValue,
  onSelectWinner,
  result,
  onClose,
}: CompetitiveResultsModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (result) {
        if (e.key === 'Enter' || e.key === 'Escape' || e.code === 'Space') {
          e.preventDefault();
          onClose();
        }
        return;
      }
      const map: Record<string, Winner> = { '1': 'team1', '2': 'team2', b: 'both', n: 'none' };
      const winner = map[e.key.toLowerCase()];
      if (winner) onSelectWinner(winner);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, result, onSelectWinner, onClose]);

  const teams = [
    { key: 'team1' as const, name: team1Name, other: team2Name, color: 'var(--team1)', hotkey: '1' },
    { key: 'team2' as const, name: team2Name, other: team1Name, color: 'var(--team2)', hotkey: '2' },
  ];

  const headline = !result
    ? null
    : result.winner === 'both'
    ? 'Both teams score'
    : result.winner === 'none'
    ? 'No points this round'
    : `${result.winner === 'team1' ? team1Name : team2Name} takes it`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={result ? 'Round result' : 'Who answered correctly?'}
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-md" />

          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="panel relative w-full max-w-3xl max-h-[95vh] overflow-y-auto p-5 sm:p-8 md:p-10"
          >
            {!result ? (
              <div>
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {pointsValue} points at stake
                  </p>
                  <h2 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold">Who got it right?</h2>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
                  {teams.map((t) => (
                    <motion.button
                      key={t.key}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectWinner(t.key)}
                      className="group relative overflow-hidden rounded-2xl border-2 p-4 sm:p-6 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{ borderColor: `hsl(${t.color} / 0.55)`, background: `hsl(${t.color} / 0.08)` }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl text-primary-foreground"
                          style={{ background: `hsl(${t.color})` }}
                        >
                          <Check className="h-5 w-5" strokeWidth={3} />
                        </span>
                        <Kbd>{t.hotkey}</Kbd>
                      </div>
                      <p className="mt-4 font-display text-xl sm:text-3xl font-extrabold truncate" style={{ color: `hsl(${t.color})` }}>
                        {t.name}
                      </p>
                      <p className="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-foreground">+{pointsValue}</p>
                      <p className="text-[11px] sm:text-xs tabular-nums text-muted-foreground truncate">
                        {t.other} −{pointsValue}
                      </p>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => onSelectWinner('both')}
                    className="flex items-center justify-between gap-2 rounded-xl border bg-secondary/60 px-4 py-3 sm:py-4 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <CheckCheck className="h-5 w-5 shrink-0 text-success" />
                      <span className="min-w-0">
                        <span className="block text-sm sm:text-base font-semibold">Both correct</span>
                        <span className="block text-[11px] sm:text-xs text-muted-foreground">Each team +{pointsValue}</span>
                      </span>
                    </span>
                    <Kbd>B</Kbd>
                  </button>
                  <button
                    onClick={() => onSelectWinner('none')}
                    className="flex items-center justify-between gap-2 rounded-xl border bg-secondary/60 px-4 py-3 sm:py-4 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <X className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0">
                        <span className="block text-sm sm:text-base font-semibold">Neither</span>
                        <span className="block text-[11px] sm:text-xs text-muted-foreground">No change</span>
                      </span>
                    </span>
                    <Kbd>N</Kbd>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center font-display text-3xl sm:text-5xl font-extrabold"
                >
                  {headline}
                </motion.h2>

                <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
                  {teams.map((t, i) => {
                    const change = t.key === 'team1' ? result.team1Change : result.team2Change;
                    const total = t.key === 'team1' ? result.team1NewScore : result.team2NewScore;
                    return (
                      <motion.div
                        key={t.key}
                        initial={{ y: 16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="rounded-2xl border bg-background/50 p-4 sm:p-6"
                        style={{ borderColor: change > 0 ? `hsl(${t.color} / 0.7)` : undefined }}
                      >
                        <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground truncate">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: `hsl(${t.color})` }} />
                          {t.name}
                        </p>
                        <motion.p
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.25 + i * 0.08, type: 'spring' }}
                          className={`mt-2 font-display text-4xl sm:text-5xl font-extrabold tabular-nums ${
                            change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-muted-foreground'
                          }`}
                        >
                          {change > 0 ? '+' : change < 0 ? '−' : '±'}
                          {Math.abs(change)}
                        </motion.p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Total <span className="font-bold tabular-nums text-foreground">{total}</span>
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-center">
                  <Button onClick={onClose} size="lg" className="h-12 rounded-xl px-8 text-base font-bold">
                    Back to the board <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompetitiveResultsModal;
