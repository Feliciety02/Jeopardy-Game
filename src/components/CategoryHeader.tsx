import { motion } from 'framer-motion';

interface CategoryHeaderProps {
  name: string;
  index: number;
  remaining: number;
  total: number;
}

const CategoryHeader = ({ name, index, remaining, total }: CategoryHeaderProps) => {
  const done = remaining === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={`flex flex-col items-center justify-end gap-1.5 sm:gap-2 pb-2 sm:pb-3 text-center transition-opacity ${
        done ? 'opacity-40' : ''
      }`}
    >
      <span className="font-display text-[10px] sm:text-xs font-semibold tabular-nums text-muted-foreground">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="font-display font-bold text-[11px] leading-tight sm:text-base md:text-lg lg:text-xl text-foreground break-words uppercase tracking-wide">
        {name}
      </span>
      <div className="flex gap-1" aria-label={`${remaining} of ${total} left`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1 w-3 sm:w-5 rounded-full transition-colors ${
              i < total - remaining ? 'bg-muted' : 'bg-primary'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default CategoryHeader;
