import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Crown, Pencil } from 'lucide-react';

interface ScoreboardProps {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  team1Streak: number;
  team2Streak: number;
  onTeam1NameChange: (name: string) => void;
  onTeam2NameChange: (name: string) => void;
  isAnimating: boolean;
  lastScoreChange: { team1: number; team2: number } | null;
}

interface TeamPanelProps {
  team: 'team1' | 'team2';
  name: string;
  score: number;
  streak: number;
  leading: boolean;
  change: number;
  isAnimating: boolean;
  onNameChange: (name: string) => void;
}

const TeamPanel = ({ team, name, score, streak, leading, change, isAnimating, onNameChange }: TeamPanelProps) => {
  const color = team === 'team1' ? 'var(--team1)' : 'var(--team2)';
  const alignRight = team === 'team2';

  return (
    <motion.div
      layout
      className="panel relative overflow-hidden p-3 sm:p-5 md:p-6"
      style={{
        borderColor: leading ? `hsl(${color} / 0.7)` : undefined,
        boxShadow: leading ? `0 0 0 1px hsl(${color} / 0.35), 0 24px 60px -24px hsl(${color} / 0.55)` : undefined,
      }}
    >
      {/* team colour bar */}
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: `hsl(${color})` }} />

      <div className={`flex items-center gap-2 ${alignRight ? 'flex-row-reverse' : ''}`}>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `hsl(${color})` }} />
        <label className="group relative flex min-w-0 flex-1 items-center gap-1.5">
          <input
            type="text"
            value={name}
            maxLength={24}
            onChange={(e) => onNameChange(e.target.value)}
            aria-label={`${team === 'team1' ? 'First' : 'Second'} team name`}
            className={`w-full min-w-0 bg-transparent font-display text-sm sm:text-lg font-bold text-foreground outline-none border-b border-transparent hover:border-border focus:border-foreground/40 transition-colors ${
              alignRight ? 'text-right' : ''
            }`}
          />
          <Pencil className="hidden sm:block h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </label>
        <AnimatePresence>
          {leading && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
              style={{ background: `hsl(${color} / 0.15)`, color: `hsl(${color})` }}
            >
              <Crown className="h-3 w-3" /> Leading
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className={`relative mt-2 sm:mt-3 flex items-end gap-3 ${alignRight ? 'flex-row-reverse' : ''}`}>
        <motion.p
          key={score}
          initial={isAnimating ? { y: 10, opacity: 0.4 } : false}
          animate={{ y: 0, opacity: 1 }}
          className="font-display font-extrabold tabular-nums leading-none text-4xl sm:text-6xl md:text-7xl tracking-tight"
          style={{ color: leading ? `hsl(${color})` : undefined }}
        >
          {score}
        </motion.p>

        {/* score change */}
        <AnimatePresence>
          {change !== 0 && (
            <motion.span
              key={`${score}-${change}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -16] }}
              transition={{ duration: 2.2, times: [0, 0.15, 0.7, 1] }}
              className={`mb-1 rounded-md px-1.5 py-0.5 text-xs sm:text-sm font-bold tabular-nums ${
                change > 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
              }`}
            >
              {change > 0 ? '+' : ''}
              {change}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className={`mt-2 h-5 flex ${alignRight ? 'justify-end' : ''}`}>
        <AnimatePresence>
          {streak > 1 && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-300"
            >
              <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {streak} in a row
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Scoreboard = ({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  team1Streak,
  team2Streak,
  onTeam1NameChange,
  onTeam2NameChange,
  isAnimating,
  lastScoreChange,
}: ScoreboardProps) => {
  const diff = team1Score - team2Score;

  return (
    <motion.section
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="mb-5 sm:mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4"
      aria-label="Scoreboard"
    >
      <TeamPanel
        team="team1"
        name={team1Name}
        score={team1Score}
        streak={team1Streak}
        leading={diff > 0}
        change={lastScoreChange?.team1 ?? 0}
        isAnimating={isAnimating}
        onNameChange={onTeam1NameChange}
      />

      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="font-display text-sm sm:text-xl font-extrabold text-muted-foreground">VS</span>
        <span className="hidden sm:block rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums text-muted-foreground whitespace-nowrap">
          {diff === 0 ? 'Tied' : `Gap ${Math.abs(diff)}`}
        </span>
      </div>

      <TeamPanel
        team="team2"
        name={team2Name}
        score={team2Score}
        streak={team2Streak}
        leading={diff < 0}
        change={lastScoreChange?.team2 ?? 0}
        isAnimating={isAnimating}
        onNameChange={onTeam2NameChange}
      />
    </motion.section>
  );
};

export default Scoreboard;
