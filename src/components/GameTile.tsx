import { motion } from 'framer-motion';
import { Question } from '@/data/gameData';

interface GameTileProps {
  question: Question;
  categoryIndex: number;
  rowIndex: number;
  onSelect: (question: Question) => void;
  onHover: () => void;
}

const GameTile = ({ question, categoryIndex, rowIndex, onSelect, onHover }: GameTileProps) => {
  const handleClick = () => {
    if (!question.answered) {
      onSelect(question);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: categoryIndex * 0.1 + rowIndex * 0.05 + 0.3,
        duration: 0.3,
        type: 'spring',
        stiffness: 200,
      }}
      whileHover={!question.answered ? { scale: 1.05 } : {}}
      whileTap={!question.answered ? { scale: 0.98 } : {}}
      onClick={handleClick}
      onMouseEnter={!question.answered ? onHover : undefined}
      className={`
        game-tile w-full aspect-[4/3] rounded-lg flex items-center justify-center
        ${question.answered ? 'answered' : 'pulse-glow'}
      `}
      disabled={question.answered}
    >
      {!question.answered && (
        <span className="point-value text-3xl md:text-4xl lg:text-5xl font-display">
          ${question.value}
        </span>
      )}
    </motion.button>
  );
};

export default GameTile;
