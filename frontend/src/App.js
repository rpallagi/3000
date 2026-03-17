import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import LevelView from './components/LevelView';
import LessonView from './components/LessonView';
import PracticeView from './components/PracticeView';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/level/:levelId" element={<LevelView />} />
          {/* Chapter-based routes (new) */}
          <Route path="/chapter/:chapterId/lesson/:lessonId" element={<LessonView />} />
          <Route path="/chapter/:chapterId/lesson/:lessonId/practice" element={<PracticeView />} />
          {/* Legacy routes */}
          <Route path="/level/:levelId/lesson/:lessonId" element={<LessonView />} />
          <Route path="/level/:levelId/lesson/:lessonId/practice" element={<PracticeView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
