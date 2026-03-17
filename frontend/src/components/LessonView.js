import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function LessonView() {
  const { levelId, lessonId } = useParams();
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/levels/${levelId}/lesson/${lessonId}`)
      .then(res => res.json())
      .then(data => {
        setWords(data.words || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [levelId, lessonId]);

  if (loading) {
    return (
      <div>
        <nav className="navbar">
          <Link to={`/level/${levelId}`} className="navbar-back">← Vissza</Link>
          <Link to="/" className="navbar-logo">Play<span>ENG</span> 3000</Link>
          <div style={{ width: 60 }}></div>
        </nav>
        <div className="lesson-container" style={{ textAlign: 'center', paddingTop: 120 }}>
          <p>Betöltés...</p>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div>
        <nav className="navbar">
          <Link to={`/level/${levelId}`} className="navbar-back">← Vissza</Link>
          <Link to="/" className="navbar-logo">Play<span>ENG</span> 3000</Link>
          <div style={{ width: 60 }}></div>
        </nav>
        <div className="lesson-container" style={{ textAlign: 'center', paddingTop: 120 }}>
          <h2 style={{ marginBottom: 16 }}>Hamarosan!</h2>
          <p style={{ color: '#6e6e73' }}>Ez a lecke még készül. Próbáld az 1. szint 1. leckéjét!</p>
          <Link to="/level/1/lesson/1" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-block' }}>
            Ugrás az 1. leckére
          </Link>
        </div>
      </div>
    );
  }

  const word = words[currentIndex];
  const isLast = currentIndex === words.length - 1;

  return (
    <div>
      <nav className="navbar">
        <Link to={`/level/${levelId}`} className="navbar-back">← Vissza</Link>
        <Link to="/" className="navbar-logo">Play<span>ENG</span> 3000</Link>
        <div style={{ width: 60 }}></div>
      </nav>

      <div className="lesson-container">
        {/* Progress */}
        <div className="lesson-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">{currentIndex + 1} / {words.length}</div>
        </div>

        {/* Word Card */}
        <div className="word-card">
          <div className="word-pos">{word.pos}</div>
          <div className="word-english">{word.word}</div>
          <div className="word-phonetic">{word.phonetic}</div>
          <div className="word-hungarian">{word.hungarian}</div>

          <div className="sentences">
            {word.sentences && word.sentences.map((s, i) => (
              <div className="sentence-pair" key={i}>
                <div className="sentence-en">{s.en}</div>
                <div className="sentence-hu">{s.hu}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="lesson-nav">
          {currentIndex > 0 && (
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentIndex(currentIndex - 1)}
            >
              ← Előző
            </button>
          )}
          {!isLast ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              Következő →
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={() => navigate(`/level/${levelId}/lesson/${lessonId}/practice`)}
            >
              Gyakorlás →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LessonView;
