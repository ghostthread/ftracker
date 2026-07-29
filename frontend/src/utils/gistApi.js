const EXPENSES_GIST_ID   = import.meta.env.VITE_GIST_ID          || '4fd7542d4f254bb5e6a0b71f5ca84532';
const ADDITIONAL_GIST_ID = import.meta.env.VITE_ADDITIONAL_GIST_ID || 'f93b01921bd0b040fb30e913e71f5ea0';

const EXPENSES_FILENAME   = 'ftracker-expenses.json';
const ADDITIONAL_FILENAME = 'ftracker-additional.json';

const getToken = () => localStorage.getItem('ftracker_gh_token') || '';

// ── Reads — public raw URL, no token needed ───────────────────────────────────

async function readRawGist(gistId, filename) {
  // Raw URL always serves the latest revision, no auth required for public gists
  const url = `https://gist.githubusercontent.com/anuanu0-0/${gistId}/raw/${filename}`;
  const resp = await fetch(url, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function readGist() {
  try {
    const data = await readRawGist(EXPENSES_GIST_ID, EXPENSES_FILENAME);
    return {
      expenses: (data.expenses || []).map(e => ({
        id:       e.id,
        date:     new Date(e.createdAt || e.date).toISOString().slice(0, 10),
        category: e.category,
        amount:   e.amount,
        note:     e.note || '(logged via Alexa)',
        source:   e.source,
      })),
      lastUpdated: data.lastUpdated,
    };
  } catch (err) {
    console.error('Expenses gist read failed:', err.message);
    return { expenses: [], lastUpdated: null };
  }
}

export async function readAdditionalGist() {
  try {
    const data = await readRawGist(ADDITIONAL_GIST_ID, ADDITIONAL_FILENAME);
    return {
      budgets:       data.budgets       || {},
      notifications: data.notifications || [],
    };
  } catch (err) {
    console.error('Additional gist read failed:', err.message);
    return { budgets: {}, notifications: [] };
  }
}

// ── Writes — token from localStorage, set once in Settings ───────────────────

async function patchGist(gistId, filename, data) {
  const token = getToken();
  if (!token) { console.warn('No GitHub token set — open Settings to add one'); return; }
  const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
    method:  'PATCH',
    headers: {
      Authorization:  `Bearer ${token}`,
      Accept:         'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ files: { [filename]: { content: JSON.stringify(data, null, 2) } } }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
}

export async function writeGist(data) {
  try { await patchGist(EXPENSES_GIST_ID, EXPENSES_FILENAME, data); }
  catch (err) { console.error('Expenses gist write failed:', err.message); }
}

export async function writeAdditionalGist(data) {
  try { await patchGist(ADDITIONAL_GIST_ID, ADDITIONAL_FILENAME, data); }
  catch (err) { console.error('Additional gist write failed:', err.message); }
}
