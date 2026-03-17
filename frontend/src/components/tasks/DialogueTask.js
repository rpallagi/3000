import React, { useState } from 'react';
import { speak } from '../../utils/tts';
import { isSilentMode } from '../../utils/settings';

// Simple dialogue task - user picks the most natural response
function DialogueTask({ dialogue, onComplete }) {
  const [turnIndex, setTurnIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const silent = isSilentMode();

  const turns = dialogue.turns || [];

  // Simple dialogue format: array of [speaker_text, response_options]
  // For now, we create a simplified dialogue from turns data

  const handleStart = () => {
    if (turns.length > 0) {
      const firstTurn = turns[0];
      const speakerText = Array.isArray(firstTurn) ? firstTurn[0] : firstTurn;
      setMessages([{ speaker: 'A', text: speakerText }]);
      if (!silent) speak(speakerText);
      setShowOptions(true);
    }
  };

  const handleSelectOption = (option, points) => {
    setMessages(prev => [...prev, { speaker: 'B', text: option }]);
    setTotalScore(prev => prev + points);
    setMaxScore(prev => prev + 8);
    setShowOptions(false);
    setExplanation(null);

    if (!silent) speak(option);

    setTimeout(() => {
      // Move to next turn or finish
      const nextIdx = turnIndex + 1;
      if (nextIdx < turns.length) {
        setTurnIndex(nextIdx);
        const nextTurn = turns[nextIdx];
        const nextText = Array.isArray(nextTurn) ? nextTurn[0] : nextTurn;
        setMessages(prev => [...prev, { speaker: 'A', text: nextText }]);
        if (!silent) speak(nextText);
        setShowOptions(true);
      } else {
        onComplete(totalScore + points, maxScore + 8);
      }
    }, 1500);
  };

  if (messages.length === 0) {
    return (
      <div className="task-card">
        <div className="task-label">Parbeszed</div>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Valaszolj a legtermszetesebben!
        </p>
        <button className="btn btn-primary" onClick={handleStart}>Inditas</button>
      </div>
    );
  }

  // Generate simple options (best, ok, weak)
  const currentWord = turns[turnIndex];
  const options = [
    { text: "I'm fine, thank you. And you?", points: 8, rank: 'best' },
    { text: "Fine thanks.", points: 5, rank: 'ok' },
    { text: "Yes.", points: 3, rank: 'weak' },
  ];

  return (
    <div className="task-card" style={{ textAlign: 'left' }}>
      <div className="task-label" style={{ textAlign: 'center' }}>Parbeszed</div>

      <div className="dialogue-chat">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble speaker-${msg.speaker.toLowerCase()}`}>
            <div className="chat-speaker">{msg.speaker === 'A' ? 'Partner' : 'Te'}</div>
            {msg.text}
          </div>
        ))}
      </div>

      {showOptions && (
        <div className="dialogue-options">
          {options.map((opt, i) => (
            <button
              key={i}
              className="dialogue-option"
              onClick={() => handleSelectOption(opt.text, opt.points)}
            >
              {opt.text}
            </button>
          ))}
        </div>
      )}

      {explanation && (
        <div className="dialogue-explanation">{explanation}</div>
      )}
    </div>
  );
}

export default DialogueTask;
