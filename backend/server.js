const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { scoreCandidate } = require('./nlp');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

// ---- Jobs ----

// Create a job posting
app.post('/api/jobs', (req, res) => {
  const { title, company, description, requiredSkills } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }
  const job = {
    id: uuidv4(),
    title,
    company: company || '',
    description,
    requiredSkills: requiredSkills || '',
    createdAt: new Date().toISOString(),
  };
  db.insert('jobs', job);
  res.status(201).json(job);
});

// List all jobs
app.get('/api/jobs', (req, res) => {
  res.json(db.readAll('jobs'));
});

// Get single job
app.get('/api/jobs/:id', (req, res) => {
  const job = db.readAll('jobs').find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// ---- Candidates / Resume Upload ----

// Submit a candidate resume for a job (resume submitted as plain text)
app.post('/api/jobs/:id/candidates', (req, res) => {
  const job = db.readAll('jobs').find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const { name, email, resumeText } = req.body;
  if (!name || !resumeText) {
    return res.status(400).json({ error: 'name and resumeText are required' });
  }

  const matchResult = scoreCandidate(job, resumeText);

  const candidate = {
    id: uuidv4(),
    jobId: job.id,
    name,
    email: email || '',
    resumeText,
    ...matchResult,
    submittedAt: new Date().toISOString(),
  };
  db.insert('candidates', candidate);
  res.status(201).json(candidate);
});

// List candidates for a job, ranked by score descending
app.get('/api/jobs/:id/candidates', (req, res) => {
  const candidates = db.findByJob(req.params.id).sort((a, b) => b.score - a.score);
  res.json(candidates);
});

// ---- Health check ----
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Resume Screener API running on port ${PORT}`);
});

module.exports = app;
