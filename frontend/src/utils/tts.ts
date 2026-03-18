let currentUtterance: SpeechSynthesisUtterance | null = null;
let voicesLoaded = false;

export const isTTSSupported = (): boolean => {
  return "speechSynthesis" in window;
};

// Pre-load voices (they load async in some browsers)
const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }
    // Voices not loaded yet, wait for them
    window.speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
      resolve(window.speechSynthesis.getVoices());
    };
    // Fallback timeout - proceed without voice selection
    setTimeout(() => resolve([]), 1000);
  });
};

// Initialize voices on load
if (isTTSSupported()) {
  loadVoices();
}

export const speak = async (text: string, lang = "en-US", rate = 0.9): Promise<void> => {
  if (!isTTSSupported()) {
    return;
  }

  stopSpeaking();

  // Ensure voices are loaded
  if (!voicesLoaded) {
    await loadVoices();
  }

  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;

    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Google")) ||
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Samantha")) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };
    utterance.onerror = () => {
      currentUtterance = null;
      resolve(); // Don't reject - just continue silently
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeaking = (): void => {
  window.speechSynthesis.cancel();
  currentUtterance = null;
};
