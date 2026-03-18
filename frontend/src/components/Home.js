import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LEVEL_ICONS, ChevronRight, Speaker, SpeakerOff } from './Icons';
import { setSoundMode, isSilentMode } from '../utils/settings';
import { getTotalScore, getStreak } from '../utils/progress';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Home() {
  const [levels, setLevels] = useState([]);
  const [silent, setSilent] = useState(isSilentMode());
  const [menuOpen, setMenuOpen] = useState(false);
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

  // Level background colors (light pastels)
  const levelColors = [
    { bg: '#e8f5e9', accent: '#43a047' },
    { bg: '#fff3e0', accent: '#ef6c00' },
    { bg: '#e3f2fd', accent: '#1976d2' },
    { bg: '#f3e5f5', accent: '#8e24aa' },
    { bg: '#fce4ec', accent: '#c62828' },
    { bg: '#e0f7fa', accent: '#00838f' },
  ];

  return (
    <div className="page-home">
      {/* Apple-style thin navbar */}
      <nav className="apple-nav">
        <div className="apple-nav-inner">
          <Link to="/" className="apple-nav-logo">Play<span>ENG</span></Link>
          <div className="apple-nav-links">
            <a href="#method">Modszer</a>
            <a href="#levels">Szintek</a>
            <button className="apple-nav-sound" onClick={toggleSound}>
              {silent ? <SpeakerOff style={{width:16,height:16}} /> : <Speaker style={{width:16,height:16}} />}
            </button>
          </div>
          <button className="apple-nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span className={menuOpen ? 'open' : ''} />
          </button>
        </div>
        {menuOpen && (
          <div className="apple-nav-mobile">
            <a href="#method" onClick={() => setMenuOpen(false)}>Modszer</a>
            <a href="#levels" onClick={() => setMenuOpen(false)}>Szintek</a>
            <button onClick={() => { toggleSound(); setMenuOpen(false); }}>
              {silent ? 'Hang bekapcsolasa' : 'Hang kikapcsolasa'}
            </button>
          </div>
        )}
      </nav>

      {/* HERO - full width, big, clean */}
      <section className="apple-hero">
        <div className="apple-hero-content">
          <h1>Tanulj angolul<br/><span className="accent">mondatokban.</span></h1>
          <p className="apple-hero-sub">
            Az Oxford 3000 leggyakrabban hasznalt angol szo.
            Azonnal hasznalhato mondatokkal. Beszelj angolul az elso naptol.
          </p>
          <p className="apple-hero-catch">"Az elso lepes a legnehezebb - kezdd el ma"</p>
          <div className="apple-hero-actions">
            <a href="#levels" className="apple-btn-primary">Kezdd el most</a>
            <a href="#method" className="apple-btn-secondary">Tudj meg tobbet</a>
          </div>
        </div>
      </section>

      {/* Stats bar - only if user has progress */}
      {(totalScore > 0 || streak.count > 0) && (
        <section className="apple-section apple-section-stats">
          <div className="apple-container">
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
        </section>
      )}

      {/* METHOD - full width white section with 4 features */}
      <section className="apple-section" id="method">
        <div className="apple-container">
          <h2 className="apple-section-title">A PlayENG modszer</h2>
          <p className="apple-section-sub">
            10 ev tapasztalat. A hagyomanyos nyelvtanulasnal 3x hatekonyabb.
          </p>
          <div className="apple-features">
            <div className="apple-feature">
              <div className="apple-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              </div>
              <h3>Beszedkozpontu</h3>
              <p>Nem szavakat magolsz. Minden szot azonnal mondatban gyakorolsz, ahogy a valos eletben hasznalnad.</p>
            </div>
            <div className="apple-feature">
              <div className="apple-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              </div>
              <h3>4 feladattipus</h3>
              <p>Valasztos, mondatepites, kiejtes es parbeszed. Mindegyik mas keszsseget fejleszt.</p>
            </div>
            <div className="apple-feature">
              <div className="apple-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z" /></svg>
              </div>
              <h3>973 szo, 23 tema</h3>
              <p>Az Oxford 3000 legfontosabb szavai tematikusan rendezve. Kezdo szinttol a magabiztosig.</p>
            </div>
            <div className="apple-feature">
              <div className="apple-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <h3>Azonnali eredmeny</h3>
              <p>Az elso leckeben mar teljes mondatokat mondasz. Nem kell honapokat varnod.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LEVELS - full width sections, each level is a big card */}
      <section className="apple-section apple-section-alt" id="levels">
        <div className="apple-container">
          <h2 className="apple-section-title">Valassz szintet</h2>
          <p className="apple-section-sub">6 szint. 973 szo. Az alapoktol a magabiztos beszelgelesig.</p>
        </div>

        <div className="apple-levels">
          {levels.map((level) => {
            const Icon = LEVEL_ICONS[level.id];
            const colors = levelColors[(level.id - 1) % levelColors.length];
            return (
              <Link to={`/level/${level.id}`} className="apple-level-card" key={level.id} style={{'--level-bg': colors.bg, '--level-accent': colors.accent}}>
                <div className="apple-level-card-inner">
                  <div className="apple-level-icon" style={{color: colors.accent}}>
                    {Icon && <Icon />}
                  </div>
                  <div className="apple-level-tag" style={{color: colors.accent}}>Szint {level.id}</div>
                  <h3 className="apple-level-name">{level.name}</h3>
                  <p className="apple-level-desc">{level.description}</p>
                  <div className="apple-level-meta">
                    <span>{level.wordCount} szo</span>
                    <span>{level.chapterCount} fejezet</span>
                  </div>
                  <span className="apple-level-link" style={{color: colors.accent}}>
                    Megnezem <ChevronRight style={{width:14,height:14}} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="apple-footer">
        <div className="apple-container">
          <div className="apple-footer-logo">Play<span>ENG</span></div>
          <p>Keszitette Greta a PlayENG modszerrel - 10 ev tapasztalat</p>
          <p>2026 PlayENG. Minden jog fenntartva.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
