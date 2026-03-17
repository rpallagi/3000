import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import MultipleChoiceTask from './tasks/MultipleChoiceTask';
import SentenceBuildingTask from './tasks/SentenceBuildingTask';
import PronunciationTask from './tasks/PronunciationTask';
import PracticeResults from './PracticeResults';
import { saveLessonResult, addToErrorDictionary } from '../utils/progress';
import { isSilentMode } from '../utils/settings';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function buildTaskQueue(words, silent) {
  const tasks = [];

  // 1. Multiple choice for all words
  words.forEach(w => {
    if (w.distractors && w.distractors.length >= 3) {
      tasks.push({ type: 'choice', word: w, maxScore: 5 });
    }
  });

  // 2. Sentence building for words that have sentences
  const withSentences = words.filter(w => w.sentences && w.sentences.length > 0);
  withSentences.slice(0, 5).forEach(w => {
    tasks.push({ type: 'sentence', word: w, maxScore: 8 });
  });

  // 3. Pronunciation (if not silent mode)
  if (!silent) {
    words.slice(0, 3).forEach(w => {
      tasks.push({ type: 'pronunciation', word: w, maxScore: 8 });
    });
  }

  return tasks;
}

function PracticeView() {
  const { chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [taskQueue, setTaskQueue] = useState([]);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const silent = isSilentMode();

  useEffect(() => {
    fetch(`${API_URL}/chapters/${chapterId}/lesson/${lessonId}`)
      .then(r => r.json())
      .then(data => {
        const w = data.words || [];
        setWords(w);
        setTaskQueue(buildTaskQueue(w, silent));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [chapterId, lessonId, silent]);

  const handleTaskComplete = (score, maxScore) => {
    const task = taskQueue[currentTaskIdx];

    if (score < maxScore * 0.5 && task.word) {
      addToErrorDictionary(task.word.word, task.word.hungarian, task.type, '');
    }

    const newScores = [...scores, { type: task.type, score, maxScore }];
    setScores(newScores);

    if (currentTaskIdx < taskQueue.length - 1) {
      setCurrentTaskIdx(currentTaskIdx + 1);
    } else {
      const totalScore = newScores.reduce((sum, s) => sum + s.score, 0);
      const totalMax = newScores.reduce((sum, s) => sum + s.maxScore, 0);
      saveLessonResult(parseInt(chapterId), parseInt(lessonId), totalScore, totalMax);
      setFinished(true);
    }
  };

  if (loading) return (
    <div className="page">
      <NavBar chapterId={chapterId} lessonId={lessonId} />
      <div className="loading">Betoltes...</div>
    </div>
  );

  if (finished) {
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const totalMax = scores.reduce((sum, s) => sum + s.maxScore, 0);
    return (
      <div className="page">
        <NavBar chapterId={chapterId} lessonId={lessonId} />
        <div className="container">
          <div className="practice-page">
            <PracticeResults
              score={totalScore}
              maxScore={totalMax}
              scores={scores}
              onRetry={() => {
                setCurrentTaskIdx(0);
                setScores([]);
                setFinished(false);
                setTaskQueue(buildTaskQueue(words, silent));
              }}
              onNext={() => navigate(`/level/1`)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (taskQueue.length === 0) return (
    <div className="page">
      <NavBar chapterId={chapterId} lessonId={lessonId} />
      <div className="container"><div className="loading">Nincs feladat ehhez a leckehez.</div></div>
    </div>
  );

  const currentTask = taskQueue[currentTaskIdx];

  return (
    <div className="page">
      <NavBar chapterId={chapterId} lessonId={lessonId} />
      <div className="container">
        <div className="practice-page">
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentTaskIdx + 1) / taskQueue.length) * 100}%` }} />
            </div>
            <div className="progress-text">{currentTaskIdx + 1} / {taskQueue.length}</div>
          </div>

          {currentTask.type === 'choice' && (
            <MultipleChoiceTask key={currentTaskIdx} word={currentTask.word} onComplete={handleTaskComplete} />
          )}
          {currentTask.type === 'sentence' && (
            <SentenceBuildingTask key={currentTaskIdx} word={currentTask.word} onComplete={handleTaskComplete} />
          )}
          {currentTask.type === 'pronunciation' && (
            <PronunciationTask key={currentTaskIdx} word={currentTask.word} onComplete={handleTaskComplete} />
          )}
        </div>
      </div>
    </div>
  );
}

function NavBar({ chapterId, lessonId }) {
  return (
    <nav className="nav">
      <Link to={`/chapter/${chapterId}/lesson/${lessonId}`} className="nav-back">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
        Vissza
      </Link>
      <Link to="/" className="nav-logo">Play<span>ENG</span> 3000</Link>
      <div style={{width: 60}} />
    </nav>
  );
}

export default PracticeView;
