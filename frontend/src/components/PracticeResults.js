import React from 'react';
import { Star } from './Icons';

function PracticeResults({ score, maxScore, scores, onRetry, onNext }) {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : 1;

  // Group scores by type
  const byType = {};
  scores.forEach(s => {
    if (!byType[s.type]) byType[s.type] = { score: 0, max: 0, count: 0 };
    byType[s.type].score += s.score;
    byType[s.type].max += s.maxScore;
    byType[s.type].count += 1;
  });

  const typeLabels = {
    choice: 'Valasztos',
    sentence: 'Mondatepites',
    pronunciation: 'Kiejtes',
    dialogue: 'Parbeszed',
  };

  return (
    <div className="results-card">
      <h2>Lecke teljesitve!</h2>

      <div className="results-stars">
        {[1, 2, 3].map(s => (
          <Star key={s} filled={s <= stars} style={{ width: 32, height: 32 }} />
        ))}
      </div>

      <div className="results-score">{percentage}%</div>
      <div className="results-label">{score} / {maxScore} pont</div>

      {/* Breakdown */}
      <div style={{ textAlign: 'left', marginBottom: 24 }}>
        {Object.entries(byType).map(([type, data]) => (
          <div key={type} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: '1px solid var(--border)'
          }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{typeLabels[type] || type}</span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {data.score}/{data.max} ({data.count} feladat)
            </span>
          </div>
        ))}
      </div>

      <div className="results-actions">
        <button className="btn btn-secondary" onClick={onRetry}>Ujra probalum</button>
        <button className="btn btn-primary" onClick={onNext}>Tovabb</button>
      </div>
    </div>
  );
}

export default PracticeResults;
