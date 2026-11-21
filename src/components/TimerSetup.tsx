import { motion } from 'framer-motion';
import { Play, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Question } from '@/data/gameData';
import { useEffect } from 'react';

interface TimerSetupProps {
  isOpen: boolean;
  question: Question | null;
  categoryName: string;
  timerDuration: number;
  onTimerChange: (duration: number) => void;
  onStart: () => void;
  onCancel: () => void;
}

const TIMER_PRESETS = [10, 20, 30, 45, 60];

const TimerSetup = ({
  isOpen,
  question,
  categoryName,
  timerDuration,
  onTimerChange,
  onStart,
  onCancel,
}: TimerSetupProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      else if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onStart, onCancel]);

  if (!isOpen || !question) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Set the timer"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onCancel} />

      <motion.div
        initial={{ y: 16, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="panel relative w-full max-w-md p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground truncate">
              {categoryName}
            </p>
            <p className="mt-1 font-display text-4xl sm:text-5xl font-extrabold tabular-nums leading-none">
              {question.value}
              <span className="ml-1.5 text-lg font-bold text-muted-foreground">pts</span>
            </p>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Timer className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-7">
          <p className="mb-2.5 text-sm font-medium text-foreground">Time to answer</p>
          <div className="grid grid-cols-5 gap-1 rounded-xl border bg-background/60 p-1" role="radiogroup" aria-label="Timer presets">
            {TIMER_PRESETS.map((preset) => {
              const active = timerDuration === preset;
              return (
                <button
                  key={preset}
                  role="radio"
                  aria-checked={active}
                  onClick={() => onTimerChange(preset)}
                  className={`rounded-lg py-2 text-sm font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {preset}s
                </button>
              );
            })}
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            Custom
            <input
              type="number"
              min={5}
              max={300}
              value={timerDuration}
              onChange={(e) => onTimerChange(Math.max(5, Math.min(300, parseInt(e.target.value) || 20)))}
              className="w-20 rounded-lg border bg-background/60 px-2 py-1.5 text-center font-semibold tabular-nums text-foreground outline-none focus:border-primary"
            />
            seconds
          </label>
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
            Back
          </Button>
          <Button onClick={onStart} className="flex-[2] rounded-xl font-semibold">
            <Play className="w-4 h-4 mr-2 fill-current" />
            Start question
          </Button>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">Enter to start · Esc to go back</p>
      </motion.div>
    </motion.div>
  );
};

export default TimerSetup;
