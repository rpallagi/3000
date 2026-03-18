import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface LevelCardProps {
  level: number;
  title: string;
  subtitle: string;
  wordRange: string;
  active?: boolean;
  locked?: boolean;
  onClick?: () => void;
}

const LevelCard = ({ level, title, subtitle, wordRange, active = false, locked = false, onClick }: LevelCardProps) => (
  <motion.button
    whileHover={!locked ? { y: -4, boxShadow: "var(--card-shadow-hover)" } : {}}
    whileTap={!locked ? { scale: 0.98 } : {}}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: level * 0.08 }}
    className={`w-full text-left p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border transition-colors
      ${active 
        ? "bg-card border-primary/30" 
        : locked 
          ? "bg-secondary/50 border-border opacity-60 cursor-not-allowed" 
          : "bg-card border-border hover:border-primary/20 cursor-pointer"}
    `}
    style={{ boxShadow: locked ? "none" : "var(--card-shadow)" }}
    onClick={locked ? undefined : onClick}
    disabled={locked}
  >
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
          Szint {level}
        </span>
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-base">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {locked ? (
          <Lock className="w-5 h-5 text-muted-foreground" />
        ) : (
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
            {wordRange}
          </span>
        )}
      </div>
    </div>
  </motion.button>
);

export default LevelCard;
