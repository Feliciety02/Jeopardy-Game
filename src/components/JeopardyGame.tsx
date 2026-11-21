import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Undo2, Volume2, VolumeX, Trophy } from 'lucide-react';
import { initialCategories, Question } from '@/data/gameData';
import JeopardyBoard from '@/components/JeopardyBoard';
import QuestionModal from '@/components/QuestionModal';
import Scoreboard from '@/components/Scoreboard';
import TimerSetup from '@/components/TimerSetup';
import CompetitiveResultsModal from '@/components/CompetitiveResultsModal';
import { useSoundEffects, useMuted, setMuted } from '@/hooks/useSoundEffects';
import { fireConfetti, fireStars } from '@/utils/confetti';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type GamePhase = 'board' | 'timerSetup' | 'question' | 'results';
type Winner = 'team1' | 'team2' | 'both' | 'none';

interface ScoreState {
  answered: string[];
  team1Score: number;
  team2Score: number;
  team1Streak: number;
  team2Streak: number;
}

interface SavedGame extends ScoreState {
  team1Name: string;
  team2Name: string;
  timerDuration: number;
  history: ScoreState[];
}

const STORAGE_KEY = 'quiz-showdown:game';

const freshScores: ScoreState = {
  answered: [],
  team1Score: 0,
  team2Score: 0,
  team1Streak: 0,
  team2Streak: 0,
};

const defaultGame: SavedGame = {
  ...freshScores,
  team1Name: 'Team 1',
  team2Name: 'Team 2',
  timerDuration: 20,
  history: [],
};

const loadGame = (): SavedGame => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultGame;
    const parsed = JSON.parse(raw) as Partial<SavedGame>;
    const validIds = new Set(initialCategories.flatMap((c) => c.questions.map((q) => q.id)));
    return {
      ...defaultGame,
      ...parsed,
      answered: (parsed.answered ?? []).filter((id) => validIds.has(id)),
      history: Array.isArray(parsed.history) ? parsed.history.slice(-50) : [],
    };
  } catch {
    return defaultGame;
  }
};

const JeopardyGame = () => {
  const [game, setGame] = useState<SavedGame>(loadGame);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [gamePhase, setGamePhase] = useState<GamePhase>('board');
  const [isScoreAnimating, setIsScoreAnimating] = useState(false);
  const [lastScoreChange, setLastScoreChange] = useState<{ team1: number; team2: number } | null>(null);
  const [showFinal, setShowFinal] = useState(true);
  const [resultData, setResultData] = useState<{
    winner: Winner;
    team1Change: number;
    team2Change: number;
    team1NewScore: number;
    team2NewScore: number;
  } | null>(null);

  const muted = useMuted();
  const { playSelect, playCorrect, playWrong, playHover, playReveal } = useSoundEffects();

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    } catch {
      /* storage unavailable: game still works, just won't survive a refresh */
    }
  }, [game]);

  const answeredSet = useMemo(() => new Set(game.answered), [game.answered]);
  const categories = useMemo(
    () =>
      initialCategories.map((cat) => ({
        ...cat,
        questions: cat.questions.map((q) => ({ ...q, answered: answeredSet.has(q.id) })),
      })),
    [answeredSet],
  );

  const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
  const questionsAnswered = game.answered.length;
  const isComplete = questionsAnswered === totalQuestions && totalQuestions > 0;

  const handleSelectQuestion = useCallback(
    (question: Question, categoryName: string) => {
      playSelect();
      setSelectedQuestion(question);
      setSelectedCategory(categoryName);
      setGamePhase('timerSetup');
    },
    [playSelect],
  );

  const handleStartQuestion = useCallback(() => {
    playReveal();
    setGamePhase('question');
  }, [playReveal]);

  const handleTimerEnd = useCallback(() => setGamePhase('results'), []);

  const handleSelectWinner = useCallback(
    (winner: Winner) => {
      if (!selectedQuestion || resultData) return;
      const points = selectedQuestion.value;
      const t1 = winner === 'team1' || winner === 'both' ? points : winner === 'team2' ? -points : 0;
      const t2 = winner === 'team2' || winner === 'both' ? points : winner === 'team1' ? -points : 0;

      if (winner === 'none') {
        playWrong();
      } else {
        playCorrect();
        fireConfetti();
        if (winner === 'both') fireStars();
      }

      const snapshot: ScoreState = {
        answered: game.answered,
        team1Score: game.team1Score,
        team2Score: game.team2Score,
        team1Streak: game.team1Streak,
        team2Streak: game.team2Streak,
      };
      const next: SavedGame = {
        ...game,
        answered: [...game.answered, selectedQuestion.id],
        team1Score: game.team1Score + t1,
        team2Score: game.team2Score + t2,
        team1Streak: t1 > 0 ? game.team1Streak + 1 : 0,
        team2Streak: t2 > 0 ? game.team2Streak + 1 : 0,
        history: [...game.history, snapshot].slice(-50),
      };
      setGame(next);
      setLastScoreChange({ team1: t1, team2: t2 });
      setIsScoreAnimating(true);
      setResultData({
        winner,
        team1Change: t1,
        team2Change: t2,
        team1NewScore: next.team1Score,
        team2NewScore: next.team2Score,
      });
      window.setTimeout(() => setIsScoreAnimating(false), 500);
    },
    [selectedQuestion, resultData, game, playCorrect, playWrong],
  );

  const handleCloseResults = useCallback(() => {
    setGamePhase('board');
    setSelectedQuestion(null);
    setResultData(null);
  }, []);

  const handleCancelTimerSetup = useCallback(() => {
    setGamePhase('board');
    setSelectedQuestion(null);
  }, []);

  const handleUndo = useCallback(() => {
    setGame((g) => {
      const prev = g.history[g.history.length - 1];
      if (!prev) return g;
      return { ...g, ...prev, history: g.history.slice(0, -1) };
    });
    setLastScoreChange(null);
    setShowFinal(true);
  }, []);

  const handleReset = useCallback(() => {
    setGame((g) => ({ ...g, ...freshScores, history: [] }));
    setLastScoreChange(null);
    setResultData(null);
    setSelectedQuestion(null);
    setGamePhase('board');
    setShowFinal(true);
  }, []);

  // Celebrate once when the last question is scored.
  const celebrated = useRef(isComplete);
  useEffect(() => {
    if (isComplete && gamePhase === 'board' && !celebrated.current) {
      celebrated.current = true;
      const t = window.setTimeout(() => {
        fireConfetti();
        fireStars();
      }, 400);
      return () => window.clearTimeout(t);
    }
    if (!isComplete) celebrated.current = false;
  }, [isComplete, gamePhase]);

  const winnerColor =
    game.team1Score > game.team2Score ? 'var(--team1)' : game.team2Score > game.team1Score ? 'var(--team2)' : null;
  const winnerName =
    game.team1Score > game.team2Score ? game.team1Name : game.team2Score > game.team1Score ? game.team2Name : null;

  return (
    <div className="stage-bg min-h-screen px-3 py-4 sm:px-5 sm:py-6 md:px-8 lg:px-10 overflow-x-hidden">
      <div className="relative max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 sm:mb-7 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="grid h-9 w-9 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-xl sm:text-2xl font-extrabold">
              Q
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold leading-none truncate">
                Quiz Showdown
              </h1>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 w-16 sm:w-28 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={false}
                    animate={{ width: `${(questionsAnswered / Math.max(1, totalQuestions)) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {questionsAnswered} of {totalQuestions} played
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-1.5 sm:gap-2">
            <Button
              onClick={() => setMuted(!muted)}
              variant="ghost"
              size="icon"
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              title={muted ? 'Unmute sounds' : 'Mute sounds'}
              className="h-9 w-9 rounded-xl border bg-card/60 text-muted-foreground hover:text-foreground"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleUndo}
              disabled={game.history.length === 0}
              variant="ghost"
              size="sm"
              title="Undo the last scored question"
              className="h-9 rounded-xl border bg-card/60 text-muted-foreground hover:text-foreground"
            >
              <Undo2 className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl border bg-card/60 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">New game</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display text-2xl">Start a new game?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Both scores go back to 0 and every question returns to the board. Team names are kept.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep playing</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>New game</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.header>

        <Scoreboard
          team1Name={game.team1Name}
          team2Name={game.team2Name}
          team1Score={game.team1Score}
          team2Score={game.team2Score}
          team1Streak={game.team1Streak}
          team2Streak={game.team2Streak}
          onTeam1NameChange={(name) => setGame((g) => ({ ...g, team1Name: name }))}
          onTeam2NameChange={(name) => setGame((g) => ({ ...g, team2Name: name }))}
          isAnimating={isScoreAnimating}
          lastScoreChange={lastScoreChange}
        />

        <JeopardyBoard categories={categories} onSelectQuestion={handleSelectQuestion} onHover={playHover} />

        <TimerSetup
          isOpen={gamePhase === 'timerSetup'}
          question={selectedQuestion}
          categoryName={selectedCategory}
          timerDuration={game.timerDuration}
          onTimerChange={(d) => setGame((g) => ({ ...g, timerDuration: d }))}
          onStart={handleStartQuestion}
          onCancel={handleCancelTimerSetup}
        />

        <QuestionModal
          question={selectedQuestion}
          isOpen={gamePhase === 'question'}
          categoryName={selectedCategory}
          timerDuration={game.timerDuration}
          onTimerEnd={handleTimerEnd}
        />

        <CompetitiveResultsModal
          isOpen={gamePhase === 'results'}
          team1Name={game.team1Name}
          team2Name={game.team2Name}
          pointsValue={selectedQuestion?.value || 0}
          onSelectWinner={handleSelectWinner}
          result={resultData}
          onClose={handleCloseResults}
        />

        {/* Final results */}
        <AnimatePresence>
          {isComplete && gamePhase === 'board' && showFinal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label="Game complete"
            >
              <motion.div
                initial={{ y: 24, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="panel w-full max-w-2xl overflow-hidden text-center"
              >
                <div
                  className="px-6 pt-8 pb-6 sm:px-10 sm:pt-10"
                  style={{
                    background: winnerColor
                      ? `radial-gradient(ellipse 80% 100% at 50% 0%, hsl(${winnerColor} / 0.28), transparent 70%)`
                      : undefined,
                  }}
                >
                  <div
                    className="mx-auto mb-4 grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl"
                    style={{ background: winnerColor ? `hsl(${winnerColor})` : 'hsl(var(--primary))' }}
                  >
                    <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Game complete</p>
                  <h2 className="mt-2 font-display text-4xl sm:text-6xl font-extrabold leading-none">
                    {winnerName ? (
                      <>
                        <span style={{ color: `hsl(${winnerColor})` }}>{winnerName}</span> wins
                      </>
                    ) : (
                      "It's a tie"
                    )}
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 px-6 sm:px-10">
                  {[
                    { name: game.team1Name, score: game.team1Score, color: 'var(--team1)', win: game.team1Score > game.team2Score },
                    { name: game.team2Name, score: game.team2Score, color: 'var(--team2)', win: game.team2Score > game.team1Score },
                  ].map((t, i) => (
                    <div
                      key={i}
                      className="rounded-xl border bg-background/50 p-4"
                      style={{ borderColor: t.win ? `hsl(${t.color} / 0.7)` : undefined }}
                    >
                      <p className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground truncate">
                        <span className="h-2 w-2 rounded-full" style={{ background: `hsl(${t.color})` }} />
                        {t.name}
                      </p>
                      <p
                        className="mt-1 font-display text-4xl sm:text-5xl font-extrabold tabular-nums"
                        style={{ color: t.win ? `hsl(${t.color})` : undefined }}
                      >
                        {t.score}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-3 px-6 py-7 sm:px-10">
                  <Button variant="outline" className="rounded-xl" onClick={() => setShowFinal(false)}>
                    View board
                  </Button>
                  <Button onClick={handleReset} className="rounded-xl px-6 font-semibold">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play again
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JeopardyGame;
