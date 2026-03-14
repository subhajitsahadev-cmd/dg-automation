/**
 * DG Automation – Chatbot Backend
 * Reads FAQ from  /data/faq.csv
 * Saves leads to  /data/customers.csv
 *
 * Run:  node server.js
 * URL:  http://localhost:3000
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const cors    = require('cors');

const app  = express();
const PORT = 3000;

const FAQ_PATH      = path.join(__dirname, 'data', 'faq.csv');
const CUSTOMER_PATH = path.join(__dirname, 'data', 'customers.csv');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ─────────────────────────────────────
   HELPER: parse CSV → array of objects
───────────────────────────────────── */
function parseCSV(filePath) {
  const raw  = fs.readFileSync(filePath, 'utf8');
  const rows = [];
  const lines = raw.split(/\r?\n/).filter(l => l.trim());

  const splitLine = (line) => {
    const cols = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    return cols;
  };

  const headers = splitLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    const vals = splitLine(lines[i]);
    if (!vals.join('').trim()) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h.trim()] = (vals[idx] || '').trim(); });
    rows.push(obj);
  }
  return rows;
}

/* ─────────────────────────────────────
   GET /api/faq  →  returns all Q&A rows
───────────────────────────────────── */
app.get('/api/faq', (req, res) => {
  try {
    const rows = parseCSV(FAQ_PATH);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─────────────────────────────────────
   POST /api/lead  →  append to customers.csv
   Body: { phone, question }
───────────────────────────────────── */
app.post('/api/lead', (req, res) => {
  try {
    const { phone, question } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'Phone required' });

    // Get next ID
    const existing = parseCSV(CUSTOMER_PATH);
    const nextId   = existing.length + 1;

    const now    = new Date();
    const date   = now.toLocaleDateString('en-IN');
    const time   = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Escape commas/quotes in fields
    const esc = (v) => `"${String(v || '').replace(/"/g, '""')}"`;

    const row = [nextId, esc(phone), esc(question || 'Not specified'), esc(date), esc(time), '"New Lead"'].join(',');

    fs.appendFileSync(CUSTOMER_PATH, '\n' + row, 'utf8');
    console.log(`[LEAD SAVED] #${nextId} | ${phone} | ${question}`);
    res.json({ success: true, id: nextId });
  } catch (err) {
    console.error('[LEAD ERROR]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─────────────────────────────────────
   GET /api/customers  →  view all leads
───────────────────────────────────── */
app.get('/api/customers', (req, res) => {
  try {
    const rows = parseCSV(CUSTOMER_PATH);
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─────────────────────────────────────
   Serve index.html for all other routes
───────────────────────────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅  DG Automation server running at http://localhost:${PORT}`);
  console.log(`📂  FAQ:       ${FAQ_PATH}`);
  console.log(`📂  Customers: ${CUSTOMER_PATH}\n`);
});
