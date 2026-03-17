import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LEVEL_ICONS, ChevronRight, Speaker, SpeakerOff, ArrowRight } from './Icons';
import { getSettings, setSoundMode, isSilentMode } from '../utils/settings';
import { getTotalScore, getStreak } from '../utils/progress';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Home() {
  const [levels, setLevels] = useState([]);
  const [silent, setSilent] = useState(isSilentMode());
  const streak = getStreak();
  const totalScore = getTotalScore();

  useEffect(() => {
    fetch(`${API_URL}/levels`)
      .then(r => r.json())
      .then(setLevels)
      .catch(() => {});
  }, []);

  const toggleSound = () => {
    const next = silent ? 'noisy' : 'silent';
    setSoundMode(next);
    setSilent(!silent);
  };

  return (
    <div className="page">
      <nav className="nav">
        <Link to="/" className="nav-logo">Play<span>ENG</span> 3000</Link>
        <div className="nav-actions">
          <button className="nav-sound-btn" onClick={toggleSound} title={silent ? 'Hang be' : 'Hang ki'}>
            {silent ? <SpeakerOff style={{width:20,height:20}} /> : <Speaker style={{width:20,height:20}} />}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="container">
        <section className="hero">
          <h1>Tanulj angolul <span className="accent">mondatokban</span>, ne szavakban.</h1>
          <p>Az Oxford 3000 leggyakrabban hasznalt angol szo - azonnal hasznalhato mondatokkal. Beszelj angolul az elso naptol.</p>
          <div className="hero-catchphrase">"Az elso lepes a legnehezebb - kezdd el ma"</div>
          <a href="#levels" className="btn-cta">
            Kezdjuk el
            <ArrowRight style={{width:18,height:18}} />
          </a>
        </section>
      </div>

      {/* Stats bar */}
      {(totalScore > 0 || streak.count > 0) && (
        <div className="container">
          <div className="stats-bar">
            <div className="stat-card">
              <div className="stat-value">{streak.count}</div>
              <div className="stat-label">nap sorozat</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalScore}</div>
              <div className="stat-label">ossz pont</div>
            </div>
          </div>
        </div>
      )}

      {/* Method Section */}
      <section className="method-section">
        <div className="container">
          <h2>A PlayENG modszer</h2>
          <p>A hagyomanyos nyelvtanulasnal 3x hatekonyabb. Nem szavakat magolsz - azonnal mondatokat alkotsz.</p>
          <div className="method-grid">
            <div className="method-card">
              <svg className="method-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              <h4>Beszedkozpontu</h4>
              <p>Minden szot azonnal mondatban gyakorolsz.</p>
            </div>
            <div className="method-card">
              <svg className="method-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              <h4>Fokozatos epitkezes</h4>
              <p>6 szint, egyszeru"tol a komplexig.</p>
            </div>
            <div className="method-card">
              <svg className="method-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z" /></svg>
              <h4>Kontextus alapu</h4>
              <p>A szavak eletszeru" mondatokban jelennek meg.</p>
            </div>
            <div className="method-card">
              <svg className="method-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              <h4>Azonnali eredmeny</h4>
              <p>Az elso lecketo"l teljes mondatokat mondasz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Levels */}
      <div className="container-wide" id="levels">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Valassz szintet</h2>
            <span className="section-subtitle">6 szint, 973 szo</span>
          </div>
          <div className="levels-list">
            {levels.map((level) => {
              const Icon = LEVEL_ICONS[level.id];
              return (
                <Link to={`/level/${level.id}`} className="level-card" key={level.id}>
                  <div className="level-card-icon">
                    {Icon && <Icon />}
                  </div>
                  <div className="level-card-body">
                    <div className="level-card-tag">Szint {level.id}</div>
                    <div className="level-card-title">{level.name}</div>
                    <div className="level-card-desc">{level.description}</div>
                    <div className="level-card-meta">
                      <span>{level.wordCount} szo</span>
                      <span>{level.chapterCount} fejezet</span>
                    </div>
                  </div>
                  <div className="level-card-arrow"><ChevronRight /></div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="footer">
        <p>PlayENG 3000 - Keszitette Greta a PlayENG modszerrel</p>
        <p style={{marginTop: 4}}>2026 PlayENG. Minden jog fenntartva.</p>
      </footer>
    </div>
  );
}

export default Home;
