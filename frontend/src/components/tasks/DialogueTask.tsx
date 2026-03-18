import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, MessageCircle, CheckCircle2 } from "lucide-react";
import { speak } from "@/utils/tts";
import { isSilent } from "@/utils/settings";

interface DialogueTurn {
  type: "situation" | "app" | "translation" | "user_prompt" | "option" | "explanation" | "app_final";
  text: string;
  score?: number;
}

interface Props {
  dialogue: {
    id: number;
    turns: DialogueTurn[];
  };
  onComplete: (totalScore: number) => void;
}

// Parse raw dialogue turns into structured format
export const parseDialogueTurns = (rawTurns: string[][]): DialogueTurn[] => {
  const parsed: DialogueTurn[] = [];
  for (const turn of rawTurns) {
    const [col1, col2] = turn;
    if (col1.startsWith("📍")) {
      parsed.push({ type: "situation", text: col2 || col1 });
    } else if (col1 === "🔊 App:") {
      parsed.push({ type: "app", text: col2 });
    } else if (col1 === "" && col2?.startsWith("→")) {
      parsed.push({ type: "translation", text: col2.replace("→ ", "") });
    } else if (col1 === "👤 Te:") {
      parsed.push({ type: "user_prompt", text: col2 });
    } else if (col1.startsWith("+")) {
      const scoreMatch = col1.match(/\+(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      parsed.push({ type: "option", text: col2, score });
    } else if (col1.startsWith("💬")) {
      parsed.push({ type: "explanation", text: col1.replace("💬 ", "").replace("💬", "") });
    }
  }
  return parsed;
};

const DialogueTask = ({ dialogue, onComplete }: Props) => {
  const turns = dialogue.turns as unknown as DialogueTurn[];
  const [currentStep, setCurrentStep] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState<number[]>([0]);

  // Group turns into conversation blocks
  const blocks: { messages: DialogueTurn[]; options: DialogueTurn[]; explanations: Map<string, string> }[] = [];
  let currentBlock: typeof blocks[0] = { messages: [], options: [], explanations: new Map() };

  for (const turn of turns) {
    if (turn.type === "situation" || turn.type === "app" || turn.type === "translation") {
      if (currentBlock.options.length > 0) {
        blocks.push(currentBlock);
        currentBlock = { messages: [], options: [], explanations: new Map() };
      }
      currentBlock.messages.push(turn);
    } else if (turn.type === "user_prompt") {
      // skip, it's implicit
    } else if (turn.type === "option") {
      currentBlock.options.push(turn);
    } else if (turn.type === "explanation") {
      // Associate with last option
      const lastOpt = currentBlock.options[currentBlock.options.length - 1];
      if (lastOpt) {
        currentBlock.explanations.set(lastOpt.text, turn.text);
      }
    }
  }
  if (currentBlock.messages.length > 0 || currentBlock.options.length > 0) {
    blocks.push(currentBlock);
  }

  const block = blocks[currentStep];
  const isLastBlock = currentStep >= blocks.length - 1;

  const handleOptionSelect = (option: DialogueTurn, idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    const score = option.score || 0;
    setTotalScore((prev) => prev + score);

    // Auto-advance after delay
    setTimeout(() => {
      if (isLastBlock) {
        onComplete(totalScore + score);
      } else {
        setCurrentStep((s) => s + 1);
        setSelectedOption(null);
        setShowExplanation(false);
        setRevealedSteps((prev) => [...prev, currentStep + 1]);
      }
    }, 2500);
  };

  const handleSpeak = (text: string) => {
    if (!isSilent()) speak(text, "en-US", 0.85);
  };

  if (!block) {
    onComplete(totalScore);
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium text-center">
        Párbeszéd
      </p>

      {/* Chat-like messages */}
      <div className="flex flex-col gap-4">
        {block.messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3, duration: 0.4 }}
          >
            {msg.type === "situation" && (
              <div className="text-center p-4 bg-secondary/50 rounded-2xl">
                <p className="text-sm text-muted-foreground italic">{msg.text}</p>
              </div>
            )}
            {msg.type === "app" && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <button
                  onClick={() => handleSpeak(msg.text)}
                  className="bg-card border border-border rounded-2xl rounded-tl-md p-4 max-w-[80%]
                    hover:bg-primary/5 transition-colors cursor-pointer group"
                  style={{ boxShadow: "var(--card-shadow)" }}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-foreground text-base">{msg.text}</p>
                    <Volume2 className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </button>
              </div>
            )}
            {msg.type === "translation" && (
              <div className="ml-11">
                <p className="text-sm text-muted-foreground">{msg.text}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Options */}
      {block.options.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: block.messages.length * 0.3 }}
          className="flex flex-col gap-3 mt-2"
        >
          <p className="text-sm text-muted-foreground text-center">Válassz egy választ:</p>
          {block.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const explanation = block.explanations.get(opt.text);
            const scoreBadge =
              (opt.score || 0) >= 8 ? "bg-success/10 text-success" :
              (opt.score || 0) >= 5 ? "bg-primary/10 text-primary" :
              "bg-muted text-muted-foreground";

            return (
              <motion.div key={i} className="flex flex-col gap-2">
                <motion.button
                  whileHover={selectedOption === null ? { y: -2 } : {}}
                  whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                  onClick={() => handleOptionSelect(opt, i)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors cursor-pointer
                    ${isSelected
                      ? "bg-primary/5 border-primary/30"
                      : selectedOption !== null
                        ? "opacity-50 bg-card border-border"
                        : "bg-card border-border hover:border-primary/20"
                    }`}
                  style={{ boxShadow: "var(--card-shadow)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-foreground">{opt.text}</p>
                    {isSelected && (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${scoreBadge}`}>
                        +{opt.score} pont
                      </span>
                    )}
                  </div>
                </motion.button>

                <AnimatePresence>
                  {isSelected && showExplanation && explanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-4 flex items-start gap-2 overflow-hidden"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default DialogueTask;
