import { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import PostJobForm from './components/PostJobForm';
import JobList from './components/JobList';
import CandidateForm from './components/CandidateForm';
import CandidateRanking from './components/CandidateRanking';
import './App.css';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [apiError, setApiError] = useState(null);

  const refreshJobs = useCallback(async () => {
    try {
      setApiError(null);
      const data = await api.listJobs();
      setJobs(data);
      if (!selectedJobId && data.length > 0) setSelectedJobId(data[0].id);
    } catch (err) {
      setApiError('Could not reach the screening API. Is the backend running?');
    } finally {
      setLoadingJobs(false);
    }
  }, [selectedJobId]);

  useEffect(() => { refreshJobs(); }, []);

  useEffect(() => {
    if (!selectedJobId) { setCandidates([]); return; }
    api.listCandidates(selectedJobId).then(setCandidates).catch(() => setCandidates([]));
  }, [selectedJobId]);

  function handleJobCreated(job) {
    setJobs((prev) => [job, ...prev]);
    setSelectedJobId(job.id);
  }

  function handleCandidateSubmitted(candidate) {
    setCandidates((prev) => [...prev, candidate].sort((a, b) => b.score - a.score));
  }

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">◈</span>
          <div>
            <h1>Screening Console</h1>
            <p>NLP-driven resume matching for open roles</p>
          </div>
        </div>
      </header>

      {apiError && <div className="banner-error">{apiError}</div>}

      <main className="app-grid">
        <section className="col col-narrow">
          <PostJobForm onCreated={handleJobCreated} />
          <JobList jobs={jobs} selectedId={selectedJobId} onSelect={setSelectedJobId} />
        </section>

        <section className="col col-wide">
          {selectedJob ? (
            <>
              <div className="panel job-brief">
                <div className="panel-header">
                  <span className="eyebrow">Currently screening for</span>
                  <h2>{selectedJob.title}</h2>
                </div>
                <p className="job-description">{selectedJob.description}</p>
                {selectedJob.requiredSkills && (
                  <p className="job-required-skills"><strong>Required:</strong> {selectedJob.requiredSkills}</p>
                )}
              </div>
              <CandidateForm jobId={selectedJob.id} onSubmitted={handleCandidateSubmitted} />
              <CandidateRanking candidates={candidates} />
            </>
          ) : (
            !loadingJobs && (
              <div className="panel empty-state">
                <p className="empty-copy">Open a role to begin screening candidates.</p>
              </div>
            )
          )}
        </section>
      </main>
    </div>
  );
}
