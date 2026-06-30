import { useState } from 'react';
import SignalMeter from './SignalMeter';
import SkillTag from './SkillTag';

export default function CandidateRanking({ candidates }) {
  const [expandedId, setExpandedId] = useState(null);

  if (candidates.length === 0) {
    return (
      <div className="panel ranking-panel">
        <div className="panel-header">
          <span className="eyebrow">Ranked candidates</span>
          <h2>No submissions yet</h2>
        </div>
        <p className="empty-copy">Add a candidate to see them ranked here by match score.</p>
      </div>
    );
  }

  return (
    <div className="panel ranking-panel">
      <div className="panel-header">
        <span className="eyebrow">Ranked candidates</span>
        <h2>{candidates.length} screened</h2>
      </div>

      <ul className="candidate-list">
        {candidates.map((c, i) => {
          const expanded = expandedId === c.id;
          return (
            <li key={c.id} className="candidate-row">
              <button className="candidate-summary" onClick={() => setExpandedId(expanded ? null : c.id)}>
                <span className="rank-index">{String(i + 1).padStart(2, '0')}</span>
                <SignalMeter score={c.score} size={48} />
                <span className="candidate-name-block">
                  <span className="candidate-name">{c.name}</span>
                  <span className="candidate-meta">
                    {c.experienceYears > 0 ? `${c.experienceYears} yrs experience` : 'Experience not stated'}
                  </span>
                </span>
                <span className="chevron">{expanded ? '−' : '+'}</span>
              </button>

              {expanded && (
                <div className="candidate-detail">
                  {c.email && <p className="detail-line"><strong>Email:</strong> {c.email}</p>}
                  {c.sourceFileName && <p className="detail-line"><strong>File:</strong> {c.sourceFileName}</p>}
                  <div className="skill-section">
                    <span className="detail-label">Matched skills</span>
                    <div className="skill-tags">
                      {c.matchedSkills.length > 0
                        ? c.matchedSkills.map((s) => <SkillTag key={s} label={s} matched />)
                        : <span className="empty-copy small">No required skills matched.</span>}
                    </div>
                  </div>
                  {c.missingSkills.length > 0 && (
                    <div className="skill-section">
                      <span className="detail-label">Gaps</span>
                      <div className="skill-tags">
                        {c.missingSkills.map((s) => <SkillTag key={s} label={s} matched={false} />)}
                      </div>
                    </div>
                  )}
                  <div className="skill-section">
                    <span className="detail-label">Resume excerpt</span>
                    <p className="resume-excerpt">{c.resumeText}</p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
