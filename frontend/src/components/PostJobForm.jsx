import { useState } from 'react';
import { api } from '../api';

export default function PostJobForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim()) {
      setError('Role title and description are required.');
      return;
    }
    setSubmitting(true);
    try {
      const job = await api.createJob({ title, company, description, requiredSkills });
      setTitle(''); setCompany(''); setDescription(''); setRequiredSkills('');
      onCreated(job);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel post-job-form" onSubmit={handleSubmit}>
      <div className="panel-header">
        <span className="eyebrow">New requisition</span>
        <h2>Open a role</h2>
      </div>

      <label className="field">
        <span>Role title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Backend Developer" />
      </label>

      <label className="field">
        <span>Company</span>
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" />
      </label>

      <label className="field">
        <span>Role description</span>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe responsibilities, stack, and what success looks like in this role..."
        />
      </label>

      <label className="field">
        <span>Required skills <em>(comma or space separated — improves match precision)</em></span>
        <input
          value={requiredSkills}
          onChange={(e) => setRequiredSkills(e.target.value)}
          placeholder="node.js, express, mysql, rest api"
        />
      </label>

      {error && <div className="error-text">{error}</div>}

      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? 'Opening role…' : 'Open role'}
      </button>
    </form>
  );
}
