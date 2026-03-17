import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function PracticeView() {
  const { levelId, lessonId } = useParams();
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackClass, setFeedbackClass] = useState('');
  const [inputClass, setInputClass] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/levels/${levelId}/lesson/${lessonId}`)
      .then(res => res.json())
      .then(data => {
        const shuffled = (data.words || []).sort(() => Math.random() - 0.5);
        setWords(shuffled);
      })
      .catch(() => {});
  }, [levelId, lessonId]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [currentIndex]);

  const checkAnswer = () => {
    if (!answer.trim()) return;
    const correct = words[currentIndex].word.toLowerCase();
    const userAnswer = answer.trim().toLowerCase();
    setAttempts(attempts + 1);

    if (userAnswer === correct) {
      setScore(score + 1);
      setFeedback('Helyes! ✓');
      setFeedbackClass('correct');
      setInputClass('correct');
      setTimeout(() => {
        if (currentIndex < words.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setAnswer('');
          setFeedback('');
          setFeedbackClass('');
          setInputClass('');
        } else {
          setFinished(true);
        }
      }, 1000);
    } else {
      setFeedback(`Próbáld újra! A helyes válasz: ${correct}`);
      setFeedbackClass('incorrect');
      setInputClass('incorrect');
      setTimeout(() => {
        setInputClass('');
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') checkAnswer();
  };

  if (words.length === 0) {
    return (
      <div>
        <nav className="navbar">
          <Link to={`/level/${levelId}/lesson/${lessonId}`} className="navbar-back">← Vissza</Link>
          <Link to="/" className="navbar-logo">Play<span>ENG</span> 3000</Link>
          <div style={{ width: 60 }}></div>
        </nav>
        <div className="practice-container" style={{ textAlign: 'center', paddingTop: 120 }}>
          <p>Betöltés...</p>
        </div>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / words.length) * 100);
    return (
      <div>
        <nav className="navbar">
          <Link to={`/level/${levelId}`} className="navbar-back">← Szintek</Link>
          <Link to="/" className="navbar-logo">Play<span>ENG</span> 3000</Link>
          <div style={{ width: 60 }}></div>
        </nav>
        <div className="practice-container">
          <div className="practice-card">
            <h2 style={{ fontSize: 20, marginBottom: 16, color: '#1d1d1f' }}>Lecke teljesítve!</h2>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '👏' : '💪'}
            </div>
            <div className="practice-score">
              <strong>{percentage}%</strong>
              {score} / {words.length} helyes válasz
            </div>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentIndex(0);
                  setScore(0);
                  setAttempts(0);
                  setFinished(false);
                  setAnswer('');
                  setFeedback('');
                  const shuffled = [...words].sort(() => Math.random() - 0.5);
                  setWords(shuffled);
                }}
              >
                Újra próbálom
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/level/${levelId}`)}
              >
                Következő lecke →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const word = words[currentIndex];

  return (
    <div>
      <nav className="navbar">
        <Link to={`/level/${levelId}/lesson/${lessonId}`} className="navbar-back">← Vissza</Link>
        <Link to="/" className="navbar-logo">Play<span>ENG</span> 3000</Link>
        <div style={{ width: 60 }}></div>
      </nav>

      <div className="practice-container">
        <div className="lesson-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}></div>
          </div>
          <div className="progress-text">{currentIndex + 1} / {words.length}</div>
        </div>

        <div className="practice-card">
          <h2>Írd be az angol szót</h2>
          <div className="practice-word">{word.hungarian}</div>
          {word.sentences && word.sentences[0] && (
            <p style={{ color: '#6e6e73', marginBottom: 24, fontSize: 14 }}>
              Tipp: „{word.sentences[0].en.replace(new RegExp(word.word, 'gi'), '____')}"
            </p>
          )}
          <input
            ref={inputRef}
            type="text"
            className={`practice-input ${inputClass}`}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Írd be angolul..."
            autoComplete="off"
            autoCapitalize="off"
          />
          <div className={`practice-feedback ${feedbackClass}`}>{feedback}</div>
          <button className="btn btn-primary" onClick={checkAnswer}>
            Ellenőrzés
          </button>
        </div>
      </div>
    </div>
  );
}

export default PracticeView;
