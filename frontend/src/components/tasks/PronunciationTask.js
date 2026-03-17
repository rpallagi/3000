import React, { useState, useRef } from 'react';
import { speak } from '../../utils/tts';
import { Mic, Speaker } from '../Icons';

function PronunciationTask({ word, onComplete }) {
  const [phase, setPhase] = useState('listen'); // listen | record | result
  const [recording, setRecording] = useState(false);
  const [recognized, setRecognized] = useState('');
  const [score, setScore] = useState(null);
  const recognitionRef = useRef(null);

  const targetText = word.word;
  const sentence = word.sentences && word.sentences[0];
  const displayText = sentence ? sentence.en : targetText;

  const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const handleListen = async () => {
    await speak(displayText);
    setPhase('record');
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecognized(transcript);
      evaluateResult(transcript);
    };

    recognition.onerror = () => {
      setRecording(false);
      setPhase('record');
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  };

  const evaluateResult = (transcript) => {
    const target = targetText.toLowerCase().trim();
    const spoken = transcript.toLowerCase().trim();

    // Simple similarity check
    let matchScore;
    if (spoken === target || spoken.includes(target)) {
      matchScore = 8;
    } else {
      const targetWords = target.split(/\s+/);
      const spokenWords = spoken.split(/\s+/);
      const matches = targetWords.filter(w => spokenWords.includes(w)).length;
      const ratio = matches / targetWords.length;
      matchScore = ratio >= 0.8 ? 5 : ratio >= 0.5 ? 3 : 1;
    }

    setScore(matchScore);
    setPhase('result');
    setTimeout(() => onComplete(matchScore, 8), 2000);
  };

  // Self-assessment fallback for unsupported browsers
  const handleSelfAssess = (pts) => {
    setScore(pts);
    setPhase('result');
    setTimeout(() => onComplete(pts, 8), 1500);
  };

  return (
    <div className="task-card">
      <div className="task-label">Mondd ki hangosan</div>
      <div className="task-prompt">{displayText}</div>
      <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 8 }}>{word.hungarian}</div>

      {phase === 'listen' && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Eloszor hallgasd meg a kiejtest
          </p>
          <button className="tts-btn" onClick={handleListen} style={{ width: 64, height: 64 }}>
            <Speaker style={{ width: 28, height: 28 }} />
          </button>
        </div>
      )}

      {phase === 'record' && (
        <div>
          {supported ? (
            <>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                {recording ? 'Hallgatlak...' : 'Nyomd meg es mondd ki!'}
              </p>
              <button
                className={`mic-btn ${recording ? 'recording' : ''}`}
                onClick={recording ? stopRecording : startRecording}
              >
                <Mic />
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Mondd ki hangosan, majd ertekeld magad!
              </p>
              <button className="tts-btn" onClick={() => speak(displayText)} style={{ marginBottom: 20, width: 56, height: 56 }}>
                <Speaker style={{ width: 24, height: 24 }} />
              </button>
              <div className="choices">
                <button className="choice-btn" onClick={() => handleSelfAssess(8)}>Tokeletesen mondtam ki</button>
                <button className="choice-btn" onClick={() => handleSelfAssess(5)}>Majdnem jo volt</button>
                <button className="choice-btn" onClick={() => handleSelfAssess(3)}>Nem igazan sikerult</button>
              </div>
            </>
          )}
        </div>
      )}

      {phase === 'result' && (
        <div>
          {recognized && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Ezt hallottam:</div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{recognized}</div>
            </div>
          )}
          <div className={`feedback ${score >= 5 ? 'correct' : 'incorrect'}`}>
            {score === 8 ? 'Tokeletesen!' : score === 5 ? 'Majdnem!' : score === 3 ? 'Probalj ujra!' : 'Gyakorolj tovabb!'}
          </div>
        </div>
      )}
    </div>
  );
}

export default PronunciationTask;
