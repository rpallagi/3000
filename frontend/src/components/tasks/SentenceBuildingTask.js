import React, { useState, useMemo } from 'react';
import { speak } from '../../utils/tts';
import { isSilentMode } from '../../utils/settings';

function SentenceBuildingTask({ word, onComplete }) {
  const sentence = word.sentences && word.sentences[0];
  const targetEn = sentence ? sentence.en : word.word;
  const targetHu = sentence ? sentence.hu : word.hungarian;

  const shuffledWords = useMemo(() => {
    const words = targetEn.replace(/[.!?,;:]/g, '').split(/\s+/);
    return [...words].sort(() => Math.random() - 0.5);
  }, [targetEn]);

  const [answer, setAnswer] = useState([]);
  const [available, setAvailable] = useState(shuffledWords.map((w, i) => ({ word: w, id: i, placed: false })));
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState(null); // null | 'correct' | 'incorrect'
  const silent = isSilentMode();

  const addWord = (item) => {
    if (status === 'correct') return;
    setAnswer([...answer, item]);
    setAvailable(available.map(a => a.id === item.id ? { ...a, placed: true } : a));
    if (status === 'incorrect') setStatus(null);
  };

  const removeWord = (item) => {
    if (status === 'correct') return;
    setAnswer(answer.filter(a => a.id !== item.id));
    setAvailable(available.map(a => a.id === item.id ? { ...a, placed: false } : a));
  };

  const checkAnswer = () => {
    const userSentence = answer.map(a => a.word).join(' ');
    const target = targetEn.replace(/[.!?,;:]/g, '').trim();

    if (userSentence.toLowerCase() === target.toLowerCase()) {
      setStatus('correct');
      if (!silent) speak(targetEn);
      const score = attempts === 0 ? 8 : attempts === 1 ? 5 : attempts === 2 ? 3 : 1;
      setTimeout(() => onComplete(score, 8), 1200);
    } else {
      setStatus('incorrect');
      setAttempts(attempts + 1);
    }
  };

  const reset = () => {
    setAnswer([]);
    setAvailable(available.map(a => ({ ...a, placed: false })));
    setStatus(null);
  };

  return (
    <div className="task-card">
      <div className="task-label">Rakd sorrendbe az angol szavakat</div>
      <div className="sentence-target">{targetHu}</div>

      {/* Answer area */}
      <div className={`answer-area ${status || ''}`}>
        {answer.length === 0 ? (
          <span className="answer-placeholder">Kattints a szavakra...</span>
        ) : (
          answer.map((item) => (
            <button key={item.id} className="word-tile in-answer" onClick={() => removeWord(item)}>
              {item.word}
            </button>
          ))
        )}
      </div>

      {/* Available words */}
      <div className="word-tiles">
        {available.map((item) => (
          <button
            key={item.id}
            className={`word-tile ${item.placed ? 'placed' : ''}`}
            onClick={() => addWord(item)}
          >
            {item.word}
          </button>
        ))}
      </div>

      {status === 'incorrect' && (
        <div className="feedback incorrect">Nem stimmel a sorrend - probalj ujra!</div>
      )}

      <div className="nav-buttons">
        {answer.length > 0 && status !== 'correct' && (
          <button className="btn btn-secondary" onClick={reset}>Torlom</button>
        )}
        {answer.length === available.length && status !== 'correct' && (
          <button className="btn btn-primary" onClick={checkAnswer}>Ellenorzom</button>
        )}
      </div>
    </div>
  );
}

export default SentenceBuildingTask;
