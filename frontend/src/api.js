const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  listJobs: () => request('/api/jobs'),
  getJob: (id) => request(`/api/jobs/${id}`),
  createJob: (data) => request('/api/jobs', { method: 'POST', body: JSON.stringify(data) }),
  listCandidates: (jobId) => request(`/api/jobs/${jobId}/candidates`),
  submitCandidate: (jobId, data) =>
    request(`/api/jobs/${jobId}/candidates`, { method: 'POST', body: JSON.stringify(data) }),
  submitCandidateResume: async (jobId, { name, email, file }) => {
    const form = new FormData();
    form.append('name', name);
    if (email) form.append('email', email);
    form.append('resume', file);
    const res = await fetch(`${API_BASE}/api/jobs/${jobId}/candidates/upload`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Upload failed: ${res.status}`);
    }
    return res.json();
  },
};
