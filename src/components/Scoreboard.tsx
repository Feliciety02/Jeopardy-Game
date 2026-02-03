import { motion } from 'framer-motion';
import { Trophy, Flame, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const team1Leading = team1Score > team2Score;
  const team2Leading = team2Score > team1Score;
  const isTied = team1Score === team2Score;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
      className="mb-6"
    >
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Team 1 */}
        <motion.div
          className={`relative p-6 rounded-2xl border-4 transition-all ${
            team1Leading
              ? 'bg-primary/20 border-primary shadow-lg shadow-primary/30'
              : 'bg-card/80 border-muted'
          }`}
        >
          {team1Leading && (
            <Crown className="absolute -top-3 -right-3 w-8 h-8 text-primary animate-bounce" />
          )}
          
          <div className="text-center">
            <input
              type="text"
              value={team1Name}
              onChange={(e) => onTeam1NameChange(e.target.value)}
              className="bg-transparent text-center text-xl font-display text-foreground w-full border-b-2 border-transparent hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
            />
            
            <div className="relative">
              <motion.p
                key={team1Score}
                initial={isAnimating ? { scale: 1.3 } : false}
                animate={{ scale: 1 }}
                className={`text-5xl md:text-6xl font-display mt-2 ${
                  team1Leading ? 'text-primary' : 'text-foreground'
                }`}
              >
                {team1Score}
              </motion.p>
              
              {/* Score change indicator */}
              {lastScoreChange && lastScoreChange.team1 !== 0 && (
                <motion.span
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -30 }}
                  transition={{ duration: 1.5 }}
                  className={`absolute -right-2 top-0 text-xl font-bold ${
                    lastScoreChange.team1 > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {lastScoreChange.team1 > 0 ? '+' : ''}{lastScoreChange.team1}
                </motion.span>
              )}
            </div>
            
            {/* Streak indicator */}
            {team1Streak > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-1 mt-2 text-orange-400"
              >
                <Flame className="w-5 h-5 animate-pulse" />
                <span className="font-display text-lg">{team1Streak} STREAK!</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* VS / Leaderboard */}
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-4xl font-display text-secondary text-glow-gold"
          >
            VS
          </motion.div>
          
          {!isTied && (
            <p className="text-sm text-muted-foreground mt-2">
              {team1Leading ? team1Name : team2Name} leads by{' '}
              <span className="text-secondary font-bold">
                {Math.abs(team1Score - team2Score)}
              </span>
            </p>
          )}
          {isTied && team1Score > 0 && (
            <p className="text-sm text-accent mt-2 font-medium">IT'S A TIE!</p>
          )}
        </div>

        {/* Team 2 */}
        <motion.div
          className={`relative p-6 rounded-2xl border-4 transition-all ${
            team2Leading
              ? 'bg-secondary/20 border-secondary shadow-lg shadow-secondary/30'
              : 'bg-card/80 border-muted'
          }`}
        >
          {team2Leading && (
            <Crown className="absolute -top-3 -left-3 w-8 h-8 text-secondary animate-bounce" />
          )}
          
          <div className="text-center">
            <input
              type="text"
              value={team2Name}
              onChange={(e) => onTeam2NameChange(e.target.value)}
              className="bg-transparent text-center text-xl font-display text-foreground w-full border-b-2 border-transparent hover:border-secondary/50 focus:border-secondary focus:outline-none transition-colors"
            />
            
            <div className="relative">
              <motion.p
                key={team2Score}
                initial={isAnimating ? { scale: 1.3 } : false}
                animate={{ scale: 1 }}
                className={`text-5xl md:text-6xl font-display mt-2 ${
                  team2Leading ? 'text-secondary' : 'text-foreground'
                }`}
              >
                {team2Score}
              </motion.p>
              
              {/* Score change indicator */}
              {lastScoreChange && lastScoreChange.team2 !== 0 && (
                <motion.span
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -30 }}
                  transition={{ duration: 1.5 }}
                  className={`absolute -left-2 top-0 text-xl font-bold ${
                    lastScoreChange.team2 > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {lastScoreChange.team2 > 0 ? '+' : ''}{lastScoreChange.team2}
                </motion.span>
              )}
            </div>
            
            {/* Streak indicator */}
            {team2Streak > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-1 mt-2 text-orange-400"
              >
                <Flame className="w-5 h-5 animate-pulse" />
                <span className="font-display text-lg">{team2Streak} STREAK!</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Scoreboard;
