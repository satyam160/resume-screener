import { useState } from 'react';
import { api } from '../api';

export default function CandidateForm({ jobId, onSubmitted }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !resumeText.trim()) {
      setError('Candidate name and resume text are required.');
      return;
    }
    setSubmitting(true);
    try {
      const candidate = await api.submitCandidate(jobId, { name, email, resumeText });
      setName(''); setEmail(''); setResumeText('');
      onSubmitted(candidate);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel candidate-form" onSubmit={handleSubmit}>
      <div className="panel-header">
        <span className="eyebrow">Submit for screening</span>
        <h2>Add a candidate</h2>
      </div>

      <label className="field">
        <span>Candidate name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" />
      </label>

      <label className="field">
        <span>Email <em>(optional)</em></span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@example.com" />
      </label>

      <label className="field">
        <span>Resume text</span>
        <textarea
          rows={8}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste the resume content here..."
        />
      </label>

      {error && <div className="error-text">{error}</div>}

      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? 'Scoring…' : 'Run match'}
      </button>
    </form>
  );
}
