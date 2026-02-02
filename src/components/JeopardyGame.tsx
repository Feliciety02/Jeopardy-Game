import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { initialCategories, Category, Question } from '@/data/gameData';
import JeopardyBoard from '@/components/JeopardyBoard';
import QuestionModal from '@/components/QuestionModal';
import Scoreboard from '@/components/Scoreboard';
import HostBanner from '@/components/HostBanner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { fireConfetti, fireStars } from '@/utils/confetti';

const JeopardyGame = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [isScoreAnimating, setIsScoreAnimating] = useState(false);
  const [lastResult, setLastResult] = useState<'correct' | 'incorrect' | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  
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
    setIsModalOpen(true);
    setTimeout(() => playReveal(), 300);
  }, [playSelect, playReveal]);

  const handleAnswer = useCallback((correct: boolean) => {
    if (!selectedQuestion) return;

    // Mark question as answered
    setCategories(prev => prev.map(cat => ({
      ...cat,
      questions: cat.questions.map(q =>
        q.id === selectedQuestion.id ? { ...q, answered: true } : q
      ),
    })));

    if (correct) {
      playCorrect();
      setScore(prev => prev + selectedQuestion.value);
      setPointsEarned(selectedQuestion.value);
      setLastResult('correct');
      setIsScoreAnimating(true);
      
      // Fire celebration effects
      fireConfetti();
      setTimeout(() => fireStars(), 200);
    } else {
      playWrong();
      setLastResult('incorrect');
      setPointsEarned(0);
    }

    setIsModalOpen(false);
    setSelectedQuestion(null);

    // Reset animation flag
    setTimeout(() => setIsScoreAnimating(false), 500);
  }, [selectedQuestion, playCorrect, playWrong]);

  const handleReset = useCallback(() => {
    setCategories(initialCategories.map(cat => ({
      ...cat,
      questions: cat.questions.map(q => ({ ...q, answered: false })),
    })));
    setScore(0);
    setLastResult(null);
    setPointsEarned(0);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
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
          className="text-center mb-6"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display text-foreground text-glow-gold tracking-wider">
            JEOPARDY!
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="h-1 w-48 mx-auto mt-2 bg-gradient-to-r from-transparent via-secondary to-transparent"
          />
        </motion.header>

        {/* Host Banner */}
        <HostBanner lastResult={lastResult} pointsEarned={pointsEarned} />

        {/* Scoreboard */}
        <Scoreboard
          score={score}
          questionsAnswered={questionsAnswered}
          totalQuestions={totalQuestions}
          isAnimating={isScoreAnimating}
          onReset={handleReset}
        />

        {/* Game Board */}
        <JeopardyBoard
          categories={categories}
          onSelectQuestion={handleSelectQuestion}
          onHover={playHover}
        />

        {/* Question Modal */}
        <QuestionModal
          question={selectedQuestion}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAnswer={handleAnswer}
          categoryName={selectedCategory}
        />

        {/* Game Complete Message */}
        {questionsAnswered === totalQuestions && questionsAnswered > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display text-secondary text-glow-gold">
              🎉 GAME COMPLETE! 🎉
            </h2>
            <p className="text-xl text-foreground mt-2">
              Final Score: <span className="text-secondary font-display">${score.toLocaleString()}</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JeopardyGame;
