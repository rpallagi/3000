import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SentenceCardProps {
  hungarian: string;
  children: ReactNode;
  progress?: number;
}

const SentenceCard = ({ hungarian, children, progress }: SentenceCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    className="w-full max-w-2xl bg-card rounded-[32px] border border-border overflow-hidden"
    style={{ boxShadow: "var(--card-shadow)" }}
  >
    {progress !== undefined && (
      <div className="w-full h-1 bg-secondary">
        <motion.div
          className="h-full bg-primary rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    )}
    <div className="p-12 flex flex-col gap-8">
      <span className="text-muted-foreground text-sm tracking-widest uppercase font-medium">
        Fordítsd le
      </span>
      <h2 className="text-3xl font-semibold text-foreground leading-snug">{hungarian}</h2>
      <div className="min-h-[60px] flex flex-wrap gap-3 p-4 bg-surface-subtle rounded-2xl border-2 border-dashed border-border">
        {children}
      </div>
    </div>
  </motion.div>
);

export default SentenceCard;
