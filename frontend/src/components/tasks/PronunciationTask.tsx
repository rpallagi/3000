import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Volume2, CheckCircle2, XCircle } from "lucide-react";
import { WordData } from "@/utils/api";
import { speak } from "@/utils/tts";
import { isSilent } from "@/utils/settings";

interface Props {
  word: WordData;
  onComplete: (score: number, isError: boolean) => void;
}

const PronunciationTask = ({ word, onComplete }: Props) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [supported] = useState(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const recognitionRef = useRef<any>(null);

  const handleListen = () => {
    if (!supported) {
      // Skip - auto pass for unsupported browsers
      onComplete(5, false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
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
          // After 3 failed attempts, let them pass with minimal score
          setTimeout(() => onComplete(1, true), 1500);
        } else {
          setTimeout(() => {
            setResult(null);
            setTranscript("");
          }, 1500);
        }
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setResult("wrong");
      setTimeout(() => {
        setResult(null);
        setTranscript("");
      }, 1500);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const handleSpeak = () => {
    if (!isSilent()) speak(word.word);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
        Mondd ki
      </p>

      <div className="flex items-center gap-3">
        <h2 className="text-4xl md:text-5xl font-semibold text-foreground">
          {word.wordDisplay || word.word}
        </h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSpeak}
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Volume2 className="w-5 h-5 text-primary" />
        </motion.button>
      </div>

      <p className="text-xl text-muted-foreground">{word.hungarian}</p>

      {/* Mic button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleListen}
        disabled={listening || result === "correct"}
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
          listening
            ? "bg-destructive text-destructive-foreground animate-pulse"
            : result === "correct"
            ? "bg-success/20 text-success"
            : "bg-primary text-primary-foreground hover:opacity-90"
        }`}
      >
        {listening ? (
          <MicOff className="w-10 h-10" />
        ) : result === "correct" ? (
          <CheckCircle2 className="w-10 h-10" />
        ) : (
          <Mic className="w-10 h-10" />
        )}
      </motion.button>

      {listening && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-sm text-muted-foreground"
        >
          Hallgatlak...
        </motion.p>
      )}

      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
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
        </motion.div>
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

      {attempts > 0 && result === "wrong" && (
        <p className="text-sm text-muted-foreground">
          {attempts}/3 próbálkozás
        </p>
      )}
    </div>
  );
};

export default PronunciationTask;
