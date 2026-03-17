import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Star } from './Icons';
import { getLessonResult } from '../utils/progress';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function LevelView() {
  const { levelId } = useParams();
  const [level, setLevel] = useState(null);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/levels`)
      .then(r => r.json())
      .then(levels => {
        const l = levels.find(x => x.id === parseInt(levelId));
        if (l) {
          setLevel(l);
          setChapters(l.chapters || []);
        }
      })
      .catch(() => {});
  }, [levelId]);

  if (!level) return <div className="page"><div className="loading">Betoltes...</div></div>;

  return (
    <div className="page">
      <nav className="nav">
        <Link to="/" className="nav-back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
          Vissza
        </Link>
        <Link to="/" className="nav-logo">Play<span>ENG</span> 3000</Link>
        <div style={{width: 60}} />
      </nav>

      <div className="container">
        <div className="chapter-header">
          <h1>Szint {levelId}: {level.name}</h1>
          <p>{level.wordCount} szo - {chapters.length} fejezet</p>
        </div>

        {chapters.map(ch => (
          <ChapterSection key={ch.id} chapter={ch} />
        ))}
      </div>
    </div>
  );
}

function ChapterSection({ chapter }) {
  const lessonCount = Math.max(1, Math.ceil(chapter.wordCount / 10));
  const lessons = Array.from({ length: lessonCount }, (_, i) => i + 1);

  return (
    <div style={{ marginBottom: 32 }}>
      <div className="section-header">
        <h3 className="section-title" style={{ fontSize: 17 }}>{chapter.name}</h3>
        <span className="section-subtitle">{chapter.wordCount} szo</span>
      </div>
      <div className="lessons-list">
        {lessons.map(n => {
          const result = getLessonResult(chapter.id, n);
          return (
            <Link to={`/chapter/${chapter.id}/lesson/${n}`} className="lesson-card" key={n}>
              <div className={`lesson-num ${result ? 'completed' : ''}`}>{n}</div>
              <div className="lesson-body">
                <h4>Lecke {n}</h4>
                <p>10 szo mondatokkal</p>
              </div>
              <div className="lesson-stars">
                {[1,2,3].map(s => (
                  <Star key={s} filled={result && s <= result.stars} />
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default LevelView;
