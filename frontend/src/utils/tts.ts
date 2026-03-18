let currentUtterance: SpeechSynthesisUtterance | null = null;

export const isTTSSupported = (): boolean => {
  return "speechSynthesis" in window;
};

export const speak = (text: string, lang = "en-US", rate = 0.9): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isTTSSupported()) {
      reject(new Error("TTS not supported"));
      return;
    }

    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;

    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Google")
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };
    utterance.onerror = (e) => {
      currentUtterance = null;
      reject(e);
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeaking = (): void => {
  window.speechSynthesis.cancel();
  currentUtterance = null;
};
