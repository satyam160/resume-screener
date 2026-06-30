# Smart Resume Screener & Job-Matching Platform

A full-stack platform that lets recruiters post roles, collect candidate resumes,
and automatically rank candidates against each role using NLP-based matching
(TF-IDF + cosine similarity, blended with explicit skill-overlap scoring).

## Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express, REST API
- **Matching engine:** `natural` (TF-IDF, tokenization) + custom skill-extraction and cosine-similarity scoring
- **Storage:** JSON file-based persistence (no external DB server required — easy to swap for MySQL/Postgres later)

## Project structure

```
resume-screener/
  backend/      Express API + matching engine
  frontend/     React UI ("Screening Console")
```

## Running locally

### 1. Backend

```bash
cd backend
npm install
npm start
```
Runs on `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. It talks to the backend via `VITE_API_URL`
(set in `frontend/.env`, defaults to `http://localhost:4000`).

## How matching works

1. A recruiter posts a role with a description and (optionally) an explicit
   required-skills list.
2. A candidate's resume text is parsed to extract skills (from a curated
   vocabulary), education mentions, and years of experience.
3. The match score blends two signals:
   - **Skill overlap (60%)** — how many of the role's required skills appear
     in the resume.
   - **TF-IDF cosine similarity (40%)** — overall textual relevance between
     the job description and resume.
4. Candidates are ranked by score, with matched/missing skills shown for
   each, so the score is explainable rather than a black box.

## Deploying it for real

You need two deployments: the backend (Node API) and the frontend (static React build).

### Backend → Render (free tier)

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → New → Web Service → connect your repo.
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Render will assign a URL like `https://your-app.onrender.com` — note it down.

(Railway, Fly.io, or any Node host work the same way.)

### Frontend → Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → New Project → import the same repo.
2. Root directory: `frontend`
3. Framework preset: Vite (auto-detected)
4. Add an environment variable: `VITE_API_URL` = your Render backend URL from above.
5. Deploy. Vercel gives you a live URL like `https://your-app.vercel.app`.

That's it — two free hosted services, fully live, no server management.

### Notes on the storage layer

Data is stored as JSON files inside `backend/data/`. This is fine for a demo
or portfolio project, but free hosts like Render reset the filesystem on
redeploy, so don't rely on it for permanent data. For a "production" version,
swap `db.js` for a real database (MySQL/Postgres) — the rest of the app
doesn't need to change since all data access goes through `db.js`.
