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

  const winnerName =
    game.team1Score > game.team2Score ? game.team1Name : game.team2Score > game.team1Score ? game.team2Name : null;

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, hsl(220 80% 15%) 0%, hsl(220 80% 8%) 50%, hsl(220 80% 4%) 100%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-foreground text-glow-gold tracking-wider">
            QUIZ SHOWDOWN
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="h-1 w-48 mx-auto mt-2 bg-gradient-to-r from-transparent via-secondary to-transparent"
          />
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

        {/* Progress & controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-[180px] flex-1">
            <div className="h-2 flex-1 max-w-xs rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-secondary"
                initial={false}
                animate={{ width: `${(questionsAnswered / Math.max(1, totalQuestions)) * 100}%` }}
              />
            </div>
            <p className="text-muted-foreground text-sm whitespace-nowrap">
              {questionsAnswered} / {totalQuestions} answered
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setMuted(!muted)}
              variant="outline"
              size="sm"
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              title={muted ? 'Unmute sounds' : 'Mute sounds'}
              className="border-muted-foreground/30 text-muted-foreground hover:border-secondary hover:text-secondary"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleUndo}
              disabled={game.history.length === 0}
              variant="outline"
              size="sm"
              title="Undo the last scored question"
              className="border-muted-foreground/30 text-muted-foreground hover:border-secondary hover:text-secondary"
            >
              <Undo2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-muted-foreground/30 text-muted-foreground hover:border-secondary hover:text-secondary"
                >
                  <RotateCcw className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Reset Game</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display text-2xl">Start a new game?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Both scores go back to 0 and every question returns to the board. Team names are kept.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep playing</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

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
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 16 }}
                className="w-full max-w-2xl text-center bg-card border-4 border-secondary rounded-3xl p-6 sm:p-10"
              >
                <Trophy className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-secondary mb-4 animate-bounce" />
                <h2 className="text-4xl sm:text-5xl font-display text-secondary text-glow-gold">GAME COMPLETE!</h2>
                <p className="text-2xl sm:text-3xl font-display text-foreground mt-4">
                  {winnerName ? `${winnerName} wins!` : "It's a tie!"}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {[
                    { name: game.team1Name, score: game.team1Score, win: game.team1Score > game.team2Score },
                    { name: game.team2Name, score: game.team2Score, win: game.team2Score > game.team1Score },
                  ].map((t, i) => (
                    <div
                      key={i}
                      className={`rounded-2xl border-4 p-4 ${t.win ? 'border-secondary bg-secondary/10' : 'border-muted bg-muted/30'}`}
                    >
                      <p className="font-display text-xl text-foreground truncate">{t.name}</p>
                      <p className={`font-display text-4xl sm:text-5xl ${t.win ? 'text-secondary' : 'text-foreground'}`}>
                        {t.score}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <Button variant="outline" onClick={() => setShowFinal(false)}>
                    View board
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-display text-lg px-8"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    PLAY AGAIN
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
