const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const FILES = {
  jobs: path.join(DATA_DIR, 'jobs.json'),
  candidates: path.join(DATA_DIR, 'candidates.json'),
};

function ensure(file) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf-8');
}

function readAll(name) {
  ensure(FILES[name]);
  const raw = fs.readFileSync(FILES[name], 'utf-8');
  return JSON.parse(raw || '[]');
}

function writeAll(name, data) {
  ensure(FILES[name]);
  fs.writeFileSync(FILES[name], JSON.stringify(data, null, 2), 'utf-8');
}

function insert(name, record) {
  const all = readAll(name);
  all.push(record);
  writeAll(name, all);
  return record;
}

function findByJob(jobId) {
  return readAll('candidates').filter((c) => c.jobId === jobId);
}

module.exports = { readAll, writeAll, insert, findByJob };
