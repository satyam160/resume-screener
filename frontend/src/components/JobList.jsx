export default function JobList({ jobs, selectedId, onSelect }) {
  if (jobs.length === 0) {
    return (
      <div className="panel job-list">
        <div className="panel-header">
          <span className="eyebrow">Open roles</span>
          <h2>No roles yet</h2>
        </div>
        <p className="empty-copy">Open a role on the left to start screening candidates against it.</p>
      </div>
    );
  }

  return (
    <div className="panel job-list">
      <div className="panel-header">
        <span className="eyebrow">Open roles</span>
        <h2>{jobs.length} active</h2>
      </div>
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <button
              className={`job-list-item ${job.id === selectedId ? 'active' : ''}`}
              onClick={() => onSelect(job.id)}
            >
              <span className="job-title">{job.title}</span>
              <span className="job-company">{job.company || 'Unlisted company'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
