import { motion } from 'framer-motion';

interface CategoryHeaderProps {
  name: string;
  index: number;
}

const CategoryHeader = ({ name, index }: CategoryHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="category-header min-h-[56px] sm:min-h-[80px] flex items-center justify-center rounded-t-lg"
    >
      <span className="text-foreground text-xs sm:text-base md:text-xl font-display tracking-wider break-words">
        {name}
      </span>
    </motion.div>
  );
};

export default CategoryHeader;
