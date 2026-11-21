import { Category, Question, POINT_VALUES } from '@/data/gameData';
import CategoryHeader from './CategoryHeader';
import GameTile from './GameTile';
import { motion } from 'framer-motion';

interface JeopardyBoardProps {
  categories: Category[];
  onSelectQuestion: (question: Question, categoryName: string) => void;
  onHover: () => void;
}

const JeopardyBoard = ({ categories, onSelectQuestion, onHover }: JeopardyBoardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto"
    >
      <div
        className="grid gap-1.5 sm:gap-2 md:gap-3"
        style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}
      >
        {/* Category Headers */}
        {categories.map((category, catIndex) => (
          <CategoryHeader
            key={category.id}
            name={category.name}
            index={catIndex}
          />
        ))}

        {/* Question Tiles - Row by Row */}
        {POINT_VALUES.map((value, rowIndex) => (
          categories.map((category, catIndex) => {
            const question = category.questions.find(q => q.value === value);
            if (!question) return null;

            return (
              <GameTile
                key={question.id}
                question={question}
                categoryIndex={catIndex}
                rowIndex={rowIndex}
                onSelect={(q) => onSelectQuestion(q, category.name)}
                onHover={onHover}
              />
            );
          })
        ))}
      </div>
    </motion.div>
  );
};

export default JeopardyBoard;
