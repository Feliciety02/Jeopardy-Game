import { motion } from 'framer-motion';
import { Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Question } from '@/data/gameData';

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
  if (!isOpen || !question) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-card border-4 border-accent rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-6">
          <span className="text-accent text-sm uppercase tracking-wider">{categoryName}</span>
          <h3 className="text-3xl font-display text-secondary mt-1">{question.value} POINTS</h3>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-accent" />
            <span className="text-lg font-medium text-foreground">Set Timer Duration</span>
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {TIMER_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={timerDuration === preset ? 'default' : 'outline'}
                onClick={() => onTimerChange(preset)}
                className={`font-display ${
                  timerDuration === preset
                    ? 'bg-accent text-accent-foreground'
                    : 'border-muted-foreground/30'
                }`}
              >
                {preset}s
              </Button>
            ))}
          </div>

          {/* Manual input */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground">Custom:</span>
            <Input
              type="number"
              min={5}
              max={300}
              value={timerDuration}
              onChange={(e) => onTimerChange(Math.max(5, Math.min(300, parseInt(e.target.value) || 20)))}
              className="w-24 text-center font-display text-lg"
            />
            <span className="text-muted-foreground">seconds</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-muted-foreground/30"
          >
            Cancel
          </Button>
          <Button
            onClick={onStart}
            className="bg-accent hover:bg-accent/80 text-accent-foreground font-display text-lg px-8"
          >
            <Play className="w-5 h-5 mr-2" />
            START
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimerSetup;
