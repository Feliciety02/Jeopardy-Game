import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { initialCategories, Category, Question } from '@/data/gameData';
import JeopardyBoard from '@/components/JeopardyBoard';
import QuestionModal from '@/components/QuestionModal';
import Scoreboard from '@/components/Scoreboard';
import TimerSetup from '@/components/TimerSetup';
import CompetitiveResultsModal from '@/components/CompetitiveResultsModal';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { fireConfetti, fireStars } from '@/utils/confetti';
import { Button } from '@/components/ui/button';

type GamePhase = 'board' | 'timerSetup' | 'question' | 'results';

const JeopardyGame = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [gamePhase, setGamePhase] = useState<GamePhase>('board');
  
  // Team state
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [team1Streak, setTeam1Streak] = useState(0);
  const [team2Streak, setTeam2Streak] = useState(0);
  
  // Animation state
  const [isScoreAnimating, setIsScoreAnimating] = useState(false);
  const [lastScoreChange, setLastScoreChange] = useState<{ team1: number; team2: number } | null>(null);
  
  // Timer state
  const [timerDuration, setTimerDuration] = useState(20);
  
  // Results state
  const [resultData, setResultData] = useState<{
    winner: 'team1' | 'team2' | 'both' | 'none';
    team1Change: number;
    team2Change: number;
    team1NewScore: number;
    team2NewScore: number;
  } | null>(null);
  
  const { playSelect, playCorrect, playWrong, playHover, playReveal } = useSoundEffects();

  const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
  const questionsAnswered = categories.reduce(
    (acc, cat) => acc + cat.questions.filter(q => q.answered).length,
    0
  );

  const handleSelectQuestion = useCallback((question: Question, categoryName: string) => {
    playSelect();
    setSelectedQuestion(question);
    setSelectedCategory(categoryName);
    setGamePhase('timerSetup');
  }, [playSelect]);

  const handleStartQuestion = useCallback(() => {
    playReveal();
    setGamePhase('question');
  }, [playReveal]);

  const handleTimerEnd = useCallback(() => {
    setGamePhase('results');
  }, []);

  const handleSelectWinner = useCallback((winner: 'team1' | 'team2' | 'both' | 'none') => {
    if (!selectedQuestion) return;

    const points = selectedQuestion.value;
    let team1Change = 0;
    let team2Change = 0;
    let newTeam1Score = team1Score;
    let newTeam2Score = team2Score;
    let newTeam1Streak = team1Streak;
    let newTeam2Streak = team2Streak;

    switch (winner) {
      case 'team1':
        team1Change = points;
        team2Change = -points;
        newTeam1Score = team1Score + points;
        newTeam2Score = team2Score - points;
        newTeam1Streak = team1Streak + 1;
        newTeam2Streak = 0;
        playCorrect();
        fireConfetti();
        break;
      case 'team2':
        team1Change = -points;
        team2Change = points;
        newTeam1Score = team1Score - points;
        newTeam2Score = team2Score + points;
        newTeam1Streak = 0;
        newTeam2Streak = team2Streak + 1;
        playCorrect();
        fireConfetti();
        break;
      case 'both':
        team1Change = points;
        team2Change = points;
        newTeam1Score = team1Score + points;
        newTeam2Score = team2Score + points;
        newTeam1Streak = team1Streak + 1;
        newTeam2Streak = team2Streak + 1;
        playCorrect();
        fireConfetti();
        fireStars();
        break;
      case 'none':
        playWrong();
        newTeam1Streak = 0;
        newTeam2Streak = 0;
        break;
    }

    // Update scores
    setTeam1Score(newTeam1Score);
    setTeam2Score(newTeam2Score);
    setTeam1Streak(newTeam1Streak);
    setTeam2Streak(newTeam2Streak);
    setLastScoreChange({ team1: team1Change, team2: team2Change });
    setIsScoreAnimating(true);

    // Set result data
    setResultData({
      winner,
      team1Change,
      team2Change,
      team1NewScore: newTeam1Score,
      team2NewScore: newTeam2Score,
    });

    // Mark question as answered
    setCategories(prev => prev.map(cat => ({
      ...cat,
      questions: cat.questions.map(q =>
        q.id === selectedQuestion.id ? { ...q, answered: true } : q
      ),
    })));

    setTimeout(() => setIsScoreAnimating(false), 500);
  }, [selectedQuestion, team1Score, team2Score, team1Streak, team2Streak, playCorrect, playWrong]);

  const handleCloseResults = useCallback(() => {
    setGamePhase('board');
    setSelectedQuestion(null);
    setResultData(null);
    setLastScoreChange(null);
  }, []);

  const handleCancelTimerSetup = useCallback(() => {
    setGamePhase('board');
    setSelectedQuestion(null);
  }, []);

  const handleReset = useCallback(() => {
    setCategories(initialCategories.map(cat => ({
      ...cat,
      questions: cat.questions.map(q => ({ ...q, answered: false })),
    })));
    setTeam1Score(0);
    setTeam2Score(0);
    setTeam1Streak(0);
    setTeam2Streak(0);
    setLastScoreChange(null);
    setResultData(null);
    setGamePhase('board');
  }, []);

  // Check for game completion
  useEffect(() => {
    if (questionsAnswered === totalQuestions && questionsAnswered > 0) {
      setTimeout(() => {
        fireConfetti();
        fireStars();
      }, 500);
    }
  }, [questionsAnswered, totalQuestions]);

  const getWinner = () => {
    if (team1Score > team2Score) return team1Name;
    if (team2Score > team1Score) return team2Name;
    return 'Tie';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 overflow-hidden">
      {/* Background Stage Effect */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, hsl(220 80% 15%) 0%, hsl(220 80% 8%) 50%, hsl(220 80% 4%) 100%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Scoreboard */}
        <Scoreboard
          team1Name={team1Name}
          team2Name={team2Name}
          team1Score={team1Score}
          team2Score={team2Score}
          team1Streak={team1Streak}
          team2Streak={team2Streak}
          onTeam1NameChange={setTeam1Name}
          onTeam2NameChange={setTeam2Name}
          isAnimating={isScoreAnimating}
          lastScoreChange={lastScoreChange}
        />

        {/* Progress & Reset */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground text-sm">
            {questionsAnswered} of {totalQuestions} questions answered
          </p>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="border-muted-foreground/30 text-muted-foreground hover:border-secondary hover:text-secondary"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Game
          </Button>
        </div>

        {/* Game Board */}
        <JeopardyBoard
          categories={categories}
          onSelectQuestion={handleSelectQuestion}
          onHover={playHover}
        />

        {/* Timer Setup Modal */}
        <TimerSetup
          isOpen={gamePhase === 'timerSetup'}
          question={selectedQuestion}
          categoryName={selectedCategory}
          timerDuration={timerDuration}
          onTimerChange={setTimerDuration}
          onStart={handleStartQuestion}
          onCancel={handleCancelTimerSetup}
        />

        {/* Question Modal with Timer */}
        <QuestionModal
          question={selectedQuestion}
          isOpen={gamePhase === 'question'}
          categoryName={selectedCategory}
          timerDuration={timerDuration}
          onTimerEnd={handleTimerEnd}
          onForceEnd={handleTimerEnd}
        />

        {/* Competitive Results Modal */}
        <CompetitiveResultsModal
          isOpen={gamePhase === 'results'}
          team1Name={team1Name}
          team2Name={team2Name}
          pointsValue={selectedQuestion?.value || 0}
          onSelectWinner={handleSelectWinner}
          result={resultData}
          onClose={handleCloseResults}
        />

        {/* Game Complete Message */}
        {questionsAnswered === totalQuestions && questionsAnswered > 0 && gamePhase === 'board' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display text-secondary text-glow-gold">
              🎉 GAME COMPLETE! 🎉
            </h2>
            <p className="text-xl text-foreground mt-2">
              Winner: <span className="text-secondary font-display">{getWinner()}</span>
            </p>
            <p className="text-lg text-muted-foreground mt-1">
              {team1Name}: {team1Score} pts | {team2Name}: {team2Score} pts
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JeopardyGame;
