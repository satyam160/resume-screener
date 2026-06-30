const natural = require('natural');
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// A small curated skill vocabulary to improve extraction quality.
// In a production system this would be a much larger, maintained taxonomy.
const SKILL_VOCAB = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'react', 'react.js',
  'node', 'node.js', 'express', 'express.js', 'mysql', 'postgresql', 'mongodb',
  'sql', 'nosql', 'html', 'css', 'redux', 'next.js', 'django', 'flask', 'fastapi',
  'pandas', 'numpy', 'matplotlib', 'scikit-learn', 'tensorflow', 'pytorch',
  'nlp', 'machine learning', 'deep learning', 'data structures', 'algorithms',
  'git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'rest api',
  'graphql', 'oop', 'agile', 'jira', 'figma', 'linux', 'bash', 'ci/cd',
];

function normalize(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9+.\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSkills(text) {
  const norm = normalize(text);
  const found = new Set();
  for (const skill of SKILL_VOCAB) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(skill)}($|[^a-z0-9])`, 'i');
    if (pattern.test(' ' + norm + ' ')) found.add(skill);
  }
  return Array.from(found);
}

function extractEducation(text) {
  const matches = [];
  const patterns = [
    /b\.?\s?tech/gi, /bachelor[a-z\s]*/gi, /m\.?\s?tech/gi, /master[a-z\s]*/gi,
    /b\.?\s?sc/gi, /m\.?\s?sc/gi, /mba/gi, /phd/gi,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) matches.push(...m.map((x) => x.trim()));
  }
  return Array.from(new Set(matches));
}

function extractExperienceYears(text) {
  const m = text.match(/(\d+(\.\d+)?)\s*\+?\s*(years|yrs)/i);
  return m ? parseFloat(m[1]) : 0;
}

function parseResume(resumeText) {
  return {
    rawText: resumeText,
    skills: extractSkills(resumeText),
    education: extractEducation(resumeText),
    experienceYears: extractExperienceYears(resumeText),
    tokens: tokenizer.tokenize(normalize(resumeText)) || [],
  };
}

// TF-IDF + cosine similarity between job description and a resume.
function computeSimilarity(jobText, resumeText) {
  const tfidf = new TfIdf();
  tfidf.addDocument(normalize(jobText));
  tfidf.addDocument(normalize(resumeText));

  // Build vocabulary across both documents
  const vocab = new Set();
  tfidf.listTerms(0).forEach((t) => vocab.add(t.term));
  tfidf.listTerms(1).forEach((t) => vocab.add(t.term));

  const vecA = [];
  const vecB = [];
  vocab.forEach((term) => {
    vecA.push(tfidf.tfidf(term, 0));
    vecB.push(tfidf.tfidf(term, 1));
  });

  const dot = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(vecB.reduce((sum, v) => sum + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// Combined score: weighted blend of TF-IDF text similarity and explicit skill overlap.
function scoreCandidate(job, resumeText) {
  const parsed = parseResume(resumeText);
  const jobSkills = extractSkills(job.description + ' ' + (job.requiredSkills || ''));

  const overlap = jobSkills.filter((s) => parsed.skills.includes(s));
  const skillScore = jobSkills.length > 0 ? overlap.length / jobSkills.length : 0;

  const textSimilarity = computeSimilarity(job.description, resumeText);

  // Weighted blend: skill overlap is a stronger, more interpretable signal,
  // TF-IDF similarity captures broader contextual relevance.
  const finalScore = 0.6 * skillScore + 0.4 * textSimilarity;

  return {
    score: Math.round(finalScore * 100),
    matchedSkills: overlap,
    missingSkills: jobSkills.filter((s) => !overlap.includes(s)),
    candidateSkills: parsed.skills,
    education: parsed.education,
    experienceYears: parsed.experienceYears,
  };
}

module.exports = { parseResume, scoreCandidate, extractSkills };
