import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getRandomPrompt } from '@/data/gameData';
import { useEffect, useState } from 'react';

interface HostBannerProps {
  lastResult: 'correct' | 'incorrect' | null;
  pointsEarned: number;
}

const HostBanner = ({ lastResult, pointsEarned }: HostBannerProps) => {
  const [prompt, setPrompt] = useState(getRandomPrompt('welcome'));
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (lastResult === 'correct') {
      setPrompt(getRandomPrompt('correct'));
      setKey(prev => prev + 1);
    } else if (lastResult === 'incorrect') {
      setPrompt(getRandomPrompt('incorrect'));
      setKey(prev => prev + 1);
    }
  }, [lastResult]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-center mb-8"
    >
      <div className="inline-flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
        <span className="text-accent text-sm uppercase tracking-widest font-medium">Game Host</span>
        <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <p className="text-2xl md:text-3xl font-display text-foreground">
            {prompt}
          </p>
          {lastResult === 'correct' && pointsEarned > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-secondary text-xl font-display mt-2 text-glow-gold"
            >
              +${pointsEarned}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default HostBanner;
