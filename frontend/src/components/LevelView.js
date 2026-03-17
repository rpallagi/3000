import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const levelsData = {
  1: { name: "Alapok", icon: "🌱" },
  2: { name: "Mindennapok", icon: "🏠" },
  3: { name: "Társalgás", icon: "💬" },
  4: { name: "Felfedezés", icon: "🧭" },
  5: { name: "Kapcsolatok", icon: "🤝" },
  6: { name: "Magabiztosság", icon: "🎯" },
};

function LevelView() {
  const { levelId } = useParams();
  const level = levelsData[levelId] || { name: "Szint", icon: "📖" };
  const [totalLessons, setTotalLessons] = useState(50);

  useEffect(() => {
    fetch(`${API_URL}/levels/${levelId}/words?per_page=1`)
      .then(res => res.json())
      .then(data => {
        setTotalLessons(Math.ceil(data.total / 10));
      })
      .catch(() => setTotalLessons(50));
  }, [levelId]);

  const lessons = Array.from({ length: totalLessons }, (_, i) => i + 1);

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="navbar-back">← Vissza</Link>
        <Link to="/" className="navbar-logo">Play<span>ENG</span> 3000</Link>
        <div style={{ width: 60 }}></div>
      </nav>

      <div className="level-header">
        <div className="level-icon">{level.icon}</div>
        <h1>Szint {levelId}: {level.name}</h1>
        <p>{totalLessons} lecke • 10 szó leckénként</p>
      </div>

      <div className="lessons-grid">
        {lessons.map((lessonNum) => (
          <Link
            to={`/level/${levelId}/lesson/${lessonNum}`}
            className="lesson-card"
            key={lessonNum}
          >
            <div className="lesson-number">{lessonNum}</div>
            <div className="lesson-info">
              <h4>Lecke {lessonNum}</h4>
              <p>10 új szó mondatokkal</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default LevelView;
