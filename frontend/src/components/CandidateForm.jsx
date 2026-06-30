import { useState, useRef } from 'react';
import { api } from '../api';

export default function CandidateForm({ jobId, onSubmitted }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  function pickFile(selected) {
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }
    setError(null);
    setFile(selected);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Candidate name is required.');
      return;
    }
    if (!file) {
      setError('Attach a PDF resume to run the match.');
      return;
    }
    setSubmitting(true);
    try {
      const candidate = await api.submitCandidateResume(jobId, { name, email, file });
      setName(''); setEmail(''); setFile(null);
      if (inputRef.current) inputRef.current.value = '';
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

      <div className="field">
        <span>Resume PDF</span>
        <div
          className={`dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => pickFile(e.target.files[0])}
          />
          {file ? (
            <span className="dropzone-filename">📄 {file.name}</span>
          ) : (
            <span className="dropzone-prompt">Drop a PDF here, or click to browse</span>
          )}
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? 'Extracting & scoring…' : 'Run match'}
      </button>
    </form>
  );
}
