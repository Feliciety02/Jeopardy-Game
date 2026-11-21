import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Question } from '@/data/gameData';

interface GameTileProps {
  question: Question;
  categoryIndex: number;
  rowIndex: number;
  onSelect: (question: Question) => void;
  onHover: () => void;
}

const GameTile = ({ question, categoryIndex, rowIndex, onSelect, onHover }: GameTileProps) => {
  const played = question.answered;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + rowIndex * 0.06 + categoryIndex * 0.03, duration: 0.3, ease: 'easeOut' }}
      whileHover={!played ? { y: -3 } : undefined}
      whileTap={!played ? { scale: 0.97 } : undefined}
      onClick={() => !played && onSelect(question)}
      onMouseEnter={!played ? onHover : undefined}
      className={`tile aspect-[4/3] ${played ? 'tile-played' : 'tile-open'}`}
      disabled={played}
      aria-label={played ? `${question.value} points, already played` : `${question.value} points`}
    >
      {played ? (
        <Check className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground/40" aria-hidden />
      ) : (
        <span className="tile-value text-lg sm:text-3xl md:text-4xl lg:text-5xl">{question.value}</span>
      )}
    </motion.button>
  );
};

export default GameTile;
