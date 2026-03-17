import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const levelsData = [
  { id: 1, name: "Alapok", nameEn: "Basics", description: "Bemutatkozás, számok, színek, alapvető igék", wordCount: 500, icon: "🌱", color: "#34c759" },
  { id: 2, name: "Mindennapok", nameEn: "Daily Life", description: "Család, étel, otthon, idő, időjárás", wordCount: 500, icon: "🏠", color: "#ff9500" },
  { id: 3, name: "Társalgás", nameEn: "Conversation", description: "Vélemény, érzelmek, kérdések, válaszok", wordCount: 500, icon: "💬", color: "#0071e3" },
  { id: 4, name: "Felfedezés", nameEn: "Exploration", description: "Utazás, vásárlás, munka, szabadidő", wordCount: 500, icon: "🧭", color: "#af52de" },
  { id: 5, name: "Kapcsolatok", nameEn: "Connections", description: "Történetmesélés, viták, összetett mondatok", wordCount: 500, icon: "🤝", color: "#ff3b30" },
  { id: 6, name: "Magabiztosság", nameEn: "Confidence", description: "Folyékony beszéd, árnyalt kifejezések", wordCount: 500, icon: "🎯", color: "#ff2d55" },
];

function Home() {
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="navbar-logo">Play<span>ENG</span> 3000</Link>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">PlayENG Módszer • 10 év tapasztalat</div>
        <h1>Tanulj angolul mondatokban, ne szavakban.</h1>
        <p>Az Oxford 3000 leggyakrabban használt angol szó – azonnal használható mondatokkal. Beszélj angolul az első naptól.</p>
        <div className="hero-catchphrase">„Az első lépés a legnehezebb – kezdd el ma"</div>
        <a href="#levels" className="hero-cta">
          Kezdjük el
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </section>

      {/* Method Section */}
      <section className="method-section">
        <div className="method-content">
          <h2>A PlayENG módszer</h2>
          <p>A hagyományos nyelvtanulásnál 3x hatékonyabb. Nem szavakat magolsz – azonnal mondatokat alkotsz, pont úgy, ahogy a gyerekek tanulnak nyelvet.</p>
          <div className="method-features">
            <div className="method-feature">
              <h4>🗣️ Beszédközpontú</h4>
              <p>Minden szót azonnal mondatban gyakorolsz. Nem memorizálsz – kommunikálsz.</p>
            </div>
            <div className="method-feature">
              <h4>📈 Fokozatos építkezés</h4>
              <p>6 szint, egyszerűtől a komplexig. Minden lecke az előzőre épül.</p>
            </div>
            <div className="method-feature">
              <h4>🧠 Kontextus alapú</h4>
              <p>A szavak életszerű mondatokban jelennek meg – úgy rögzülnek, ahogy használod őket.</p>
            </div>
            <div className="method-feature">
              <h4>⚡ Azonnali eredmény</h4>
              <p>Az első leckétől kezdve teljes mondatokat mondasz angolul.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Levels Grid */}
      <section className="section" id="levels">
        <h2 className="section-title">Válassz szintet</h2>
        <p className="section-subtitle">6 szint, 3000 szó – a te tempódban</p>
        <div className="levels-grid">
          {levelsData.map((level) => (
            <Link to={`/level/${level.id}`} className="card" key={level.id}>
              <span className="card-icon">{level.icon}</span>
              <div className="card-level-tag">Szint {level.id}</div>
              <h3>{level.name}</h3>
              <p>{level.description}</p>
              <div className="card-meta">
                <span className="card-meta-item">📚 {level.wordCount} szó</span>
                <span className="card-meta-item">📖 {Math.ceil(level.wordCount / 10)} lecke</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>PlayENG 3000 • Készítette Greta a PlayENG módszerrel</p>
        <p style={{marginTop: '8px'}}>© 2026 PlayENG. Minden jog fenntartva.</p>
      </footer>
    </div>
  );
}

export default Home;
