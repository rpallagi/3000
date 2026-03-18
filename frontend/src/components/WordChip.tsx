import { motion } from "framer-motion";

interface WordChipProps {
  word: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
}

const WordChip = ({ word, onClick, disabled = false, selected = false }: WordChipProps) => (
  <motion.button
    whileHover={!disabled ? { y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" } : {}}
    whileTap={!disabled ? { scale: 0.95 } : {}}
    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-medium transition-colors border
      ${selected 
        ? "bg-primary text-primary-foreground border-primary" 
        : "bg-card text-foreground border-chip-border hover:border-chip-hover"}
      ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
    `}
    onClick={onClick}
    disabled={disabled}
    layout
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    {word}
  </motion.button>
);

export default WordChip;
