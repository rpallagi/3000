import React, { useState, useMemo } from 'react';
import { speak } from '../../utils/tts';
import { isSilentMode } from '../../utils/settings';
import { Speaker } from '../Icons';

function MultipleChoiceTask({ word, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [resolved, setResolved] = useState(false);
  const silent = isSilentMode();

  const options = useMemo(() => {
    const distractors = (word.distractors || []).slice(0, 3);
    const all = [word.word, ...distractors];
    // Shuffle
    return all.sort(() => Math.random() - 0.5);
  }, [word]);

  const sentence = word.sentences && word.sentences[0];
  const blanked = sentence ? sentence.en.replace(new RegExp(`\\b${word.word}\\b`, 'gi'), '____') : null;

  const handleSelect = (option) => {
    if (resolved) return;
    setSelected(option);
    const isCorrect = option.toLowerCase() === word.word.toLowerCase();

    if (isCorrect) {
      setResolved(true);
      if (!silent) speak(sentence ? sentence.en : word.word);
      const newAttempts = attempts + 1;
      const score = newAttempts === 1 ? 5 : newAttempts === 2 ? 2 : newAttempts === 3 ? 1 : 0;
      setTimeout(() => onComplete(score, 5), 1200);
    } else {
      setAttempts(attempts + 1);
      setTimeout(() => setSelected(null), 800);
    }
  };

  return (
    <div className="task-card">
      <div className="task-label">Valaszd ki a helyes szot</div>

      {blanked && (
        <div className="task-prompt" style={{ fontSize: 18, fontWeight: 600 }}>
          {blanked}
        </div>
      )}

      <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 20 }}>
        {word.hungarian}
      </div>

      {!silent && sentence && (
        <button className="tts-btn" onClick={() => speak(sentence.en)} style={{ marginBottom: 20 }}>
          <Speaker />
        </button>
      )}

      <div className="choices">
        {options.map((opt, i) => {
          let cls = 'choice-btn';
          if (selected === opt) {
            cls += opt.toLowerCase() === word.word.toLowerCase() ? ' correct' : ' incorrect';
          }
          return (
            <button key={i} className={cls} onClick={() => handleSelect(opt)} disabled={resolved}>
              {opt}
            </button>
          );
        })}
      </div>

      {attempts > 0 && !resolved && (
        <div className="feedback incorrect">{attempts}. probalkozas - probalj ujra!</div>
      )}
    </div>
  );
}

export default MultipleChoiceTask;
