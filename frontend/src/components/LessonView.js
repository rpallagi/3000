import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Speaker } from './Icons';
import { speak } from '../utils/tts';
import { isSilentMode } from '../utils/settings';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function LessonView() {
  const { chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chapterName, setChapterName] = useState('');
  const silent = isSilentMode();

  useEffect(() => {
    fetch(`${API_URL}/chapters/${chapterId}/lesson/${lessonId}`)
      .then(r => r.json())
      .then(data => {
        setWords(data.words || []);
        setChapterName(data.chapterName || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [chapterId, lessonId]);

  const handleSpeak = (text) => {
    if (!silent) speak(text);
  };

  if (loading) return (
    <div className="page">
      <NavBar chapterId={chapterId} />
      <div className="loading">Betoltes...</div>
    </div>
  );

  if (words.length === 0) return (
    <div className="page">
      <NavBar chapterId={chapterId} />
      <div className="container">
        <div className="lesson-page" style={{textAlign:'center'}}>
          <h2 style={{marginBottom:12}}>Hamarosan!</h2>
          <p style={{color:'var(--text-secondary)'}}>Ez a lecke meg keszul.</p>
          <Link to={`/chapter/1/lesson/1`} className="btn btn-primary" style={{marginTop:20, display:'inline-flex'}}>
            Ugras az 1. leckere
          </Link>
        </div>
      </div>
    </div>
  );

  const word = words[currentIndex];
  const isLast = currentIndex === words.length - 1;

  return (
    <div className="page">
      <NavBar chapterId={chapterId} chapterName={chapterName} />
      <div className="container">
        <div className="lesson-page">
          {/* Progress */}
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }} />
            </div>
            <div className="progress-text">{currentIndex + 1} / {words.length}</div>
          </div>

          {/* Word Card */}
          <div className="word-card">
            <div className="word-pos">{word.pos}</div>
            <div className="word-en">{word.wordDisplay || word.word}</div>
            {word.phonetic && <div className="word-phonetic">{word.phonetic}</div>}
            <div className="word-hu">{word.hungarian}</div>

            {!silent && (
              <button className="tts-btn" onClick={() => handleSpeak(word.word)} title="Kiejtes meghallgatasa">
                <Speaker />
              </button>
            )}

            {word.sentences && word.sentences.length > 0 && (
              <div className="sentences">
                {word.sentences.map((s, i) => (
                  <div className="sentence" key={i} onClick={() => handleSpeak(s.en)} style={{cursor: silent ? 'default' : 'pointer'}}>
                    <div className="sentence-en">{s.en}</div>
                    <div className="sentence-hu">{s.hu}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="nav-buttons">
            {currentIndex > 0 && (
              <button className="btn btn-secondary" onClick={() => setCurrentIndex(currentIndex - 1)}>
                Elozo
              </button>
            )}
            {!isLast ? (
              <button className="btn btn-primary" onClick={() => setCurrentIndex(currentIndex + 1)}>
                Kovetkezo
              </button>
            ) : (
              <button className="btn btn-success" onClick={() => navigate(`/chapter/${chapterId}/lesson/${lessonId}/practice`)}>
                Gyakorlas
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavBar({ chapterId, chapterName }) {
  return (
    <nav className="nav">
      <Link to={chapterId ? `/level/1` : '/'} className="nav-back">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
        Vissza
      </Link>
      <Link to="/" className="nav-logo">Play<span>ENG</span> 3000</Link>
      <div style={{width: 60}} />
    </nav>
  );
}

export default LessonView;
