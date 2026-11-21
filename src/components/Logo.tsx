interface LogoProps {
  className?: string;
}

/** The Quiz Showdown mark: a Q whose bowl is a countdown ring and whose tail is a lit board tile. */
const Logo = ({ className }: LogoProps) => (
  <svg viewBox="12 12 100 100" className={className} role="img" aria-label="Quiz Showdown logo">
    <circle
      cx="58"
      cy="58"
      r="31"
      fill="none"
      stroke="hsl(var(--foreground))"
      strokeWidth="14"
      strokeLinecap="round"
      strokeDasharray="158 36.8"
      transform="rotate(76 58 58)"
    />
    <rect x="76" y="76" width="30" height="30" rx="8" fill="hsl(var(--primary))" />
  </svg>
);

export default Logo;
