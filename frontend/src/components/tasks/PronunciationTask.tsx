import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, CheckCircle2, XCircle, Lock } from "lucide-react";
import { WordData } from "@/utils/api";
import { speak } from "@/utils/tts";
import { isSilent } from "@/utils/settings";

interface Props {
  word: WordData;
  onComplete: (score: number, isError: boolean) => void;
}

// Common Hungarian pronunciation tips for English sounds
const PRONUNCIATION_TIPS: Record<string, string> = {
  th: "A 'th' hangot a fogak között kell ejteni, nem 'sz' vagy 't'.",
  w: "A 'w' hang kerekített ajakkal, nem 'v'-vel.",
  r: "Az angol 'r' nem pereg, a nyelv nem érinti a szájpadlást.",
  v: "Az angol 'v' az alsó ajakkal és a felső fogsorral képzett hang.",
};

const getWordTip = (word: string): string | null => {
  const lower = word.toLowerCase();
  if (lower.includes("th")) return PRONUNCIATION_TIPS.th;
  if (lower.startsWith("w")) return PRONUNCIATION_TIPS.w;
  if (lower.includes("r") && !lower.startsWith("r")) return PRONUNCIATION_TIPS.r;

  // Common specific words
  const specificTips: Record<string, string> = {
    comfortable: "Csak 3 szótag: KUMF-tö-böl, nem 'com-for-TA-ble'.",
    would: "Az 'l' néma: 'wud', nem 'would'.",
    could: "Az 'l' néma: 'kud', nem 'could'.",
    should: "Az 'l' néma: 'sud', nem 'should'.",
    walked: "Az -ed végződés itt 't' hang: 'wokt', nem 'wal-ked'.",
    talked: "Az -ed végződés itt 't' hang: 'tokt', nem 'tal-ked'.",
    asked: "Az -ed végződés itt 't' hang: 'ászt', nem 'ász-ked'.",
    three: "A 'th' hangot a fogak között ejtjük, nem 'szrí' vagy 'trí'.",
    think: "A 'th' hangot a fogak között ejtjük, nem 'szink' vagy 'tink'.",
    the: "A 'th' itt zöngés, a nyelv a fogak között van.",
    this: "A 'th' itt zöngés, a nyelv a fogak között van.",
    that: "A 'th' itt zöngés, a nyelv a fogak között van.",
    water: "A 't' itt inkább 'd'-nek hangzik: 'wó-dör'.",
    letter: "A 'tt' itt inkább 'd'-nek hangzik: 'le-dör'.",
    little: "Ejtsd: 'li-döl', a 'tt' inkább 'd' hang.",
    important: "Hangsúly a második szótagon: im-POR-tönt.",
    interesting: "Csak 3 szótag: IN-tresz-ting, nem 'in-te-resz-ting'.",
    different: "Csak 2 szótag: DIF-rönt, nem 'dif-fe-rent'.",
    every: "Csak 2 szótag: EV-ri, nem 'e-ve-ri'.",
    vegetable: "Csak 3 szótag: VEDZS-tö-böl.",
    because: "Ejtsd: bi-KÓZ, nem 'bi-káuz'.",
    friend: "Az 'ie' itt 'e' hangot ad: 'frend'.",
    said: "Ejtsd: 'szed', nem 'széd'.",
    says: "Ejtsd: 'szez', nem 'széz'.",
  };

  if (specificTips[lower]) return specificTips[lower];
  return null;
};

const PronunciationTask = ({ word, onComplete }: Props) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported] = useState(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const recognitionRef = useRef<any>(null);

  // Auto-play on mount (mandatory first listen)
  useEffect(() => {
    if (isSilent()) {
      // In silent mode, auto-pass
      onComplete(5, false);
      return;
    }

    const timer = setTimeout(() => {
      handlePlayModel();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayModel = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await speak(word.word, "en-US", 0.8);
      setHasListened(true);
    } catch {}
    setIsPlaying(false);
  };

  const handleListen = () => {
    if (!hasListened || !supported) {
      if (!supported) {
        onComplete(5, false);
      }
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      setListening(false);
      const results: string[] = [];
      for (let i = 0; i < event.results[0].length; i++) {
        results.push(event.results[0][i].transcript.toLowerCase().trim());
      }
      const spokenText = results[0] || "";
      setTranscript(spokenText);

      const target = word.word.toLowerCase();
      const isMatch = results.some(
        (r) => r === target || r.includes(target) || target.includes(r)
      );
      const attempt = attempts + 1;
      setAttempts(attempt);

      if (isMatch) {
        setResult("correct");
        const scoreMap: Record<number, number> = { 1: 8, 2: 5, 3: 3 };
        setTimeout(() => onComplete(scoreMap[attempt] || 1, attempt > 1), 1500);
      } else {
        setResult("wrong");
        if (attempt >= 3) {
          setTimeout(() => onComplete(1, true), 2000);
        } else {
          setTimeout(() => {
            setResult(null);
            setTranscript("");
          }, 2000);
        }
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setResult("wrong");
      setTranscript("(nem hallottalak)");
      setTimeout(() => {
        setResult(null);
        setTranscript("");
      }, 1500);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const tip = getWordTip(word.word);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
        Kiejtés
      </p>
      <p className="text-xs text-muted-foreground -mt-4">
        Először hallgasd meg, aztán mondd ki hangosan!
      </p>

      {/* Word display */}
      <div className="flex items-center gap-3">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground">
          {word.wordDisplay || word.word}
        </h2>
      </div>

      <p className="text-xl text-muted-foreground">{word.hungarian}</p>

      {/* Listen button - mandatory first */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePlayModel}
        disabled={isPlaying}
        className={`flex items-center gap-3 px-6 py-3 rounded-full transition-colors ${
          isPlaying
            ? "bg-primary/20 text-primary animate-pulse"
            : hasListened
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "bg-primary text-primary-foreground hover:opacity-90"
        }`}
      >
        <Volume2 className="w-5 h-5" />
        {isPlaying ? "Lejátszás..." : hasListened ? "Hallgasd meg újra" : "Hallgasd meg"}
      </motion.button>

      {/* Pronunciation tip */}
      {tip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2.5 rounded-xl text-sm text-center max-w-sm"
        >
          {tip}
        </motion.div>
      )}

      {/* Mic button - locked until listened */}
      <div className="relative">
        <motion.button
          whileHover={hasListened ? { scale: 1.05 } : {}}
          whileTap={hasListened ? { scale: 0.95 } : {}}
          onClick={handleListen}
          disabled={listening || result === "correct" || !hasListened}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            !hasListened
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : listening
              ? "bg-destructive text-destructive-foreground animate-pulse"
              : result === "correct"
              ? "bg-success/20 text-success"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {!hasListened ? (
            <Lock className="w-8 h-8" />
          ) : listening ? (
            <MicOff className="w-10 h-10" />
          ) : result === "correct" ? (
            <CheckCircle2 className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </motion.button>
      </div>

      {!hasListened && (
        <p className="text-xs text-muted-foreground">
          Először hallgasd meg a kiejtést
        </p>
      )}

      {listening && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-sm text-muted-foreground"
        >
          Hallgatlak...
        </motion.p>
      )}

      {/* Result feedback */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium ${
                result === "correct"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {result === "correct" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              "{transcript}"
            </div>

            {/* Per-word feedback on wrong */}
            {result === "wrong" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground text-center mt-1"
              >
                <p>
                  A helyes kiejtés: <span className="font-semibold text-foreground">{word.word}</span>
                </p>
                {tip && (
                  <p className="text-amber-600 dark:text-amber-400 mt-1">{tip}</p>
                )}
                <p className="mt-1">{attempts}/3 próbálkozás</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {result === "correct" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-success"
        >
          Szuper kiejtés!
        </motion.p>
      )}

      {!supported && (
        <p className="text-sm text-muted-foreground text-center">
          A böngésződ nem támogatja a beszédfelismerést.
          <br />
          <button
            onClick={() => onComplete(5, false)}
            className="text-primary underline mt-2"
          >
            Tovább
          </button>
        </p>
      )}
    </div>
  );
};

export default PronunciationTask;
