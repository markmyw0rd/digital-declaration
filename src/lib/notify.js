// src/lib/notify.js
// POST to your Vercel function (server-side Resend) instead of Firebase/EmailJS.

const API =
  process.env.REACT_APP_NOTIFY_URL || // allow override for testing
  'https://YOUR-PROJECT.vercel.app/api/notify'; // <-- change to your Vercel URL

async function post(to, payload) {
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, ...payload })
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`notify failed (${r.status}): ${text}`);
  }
  return r.json();
}

export async function notifySupervisor({
  id, studentName, unitCode, supervisorEmail, origin
}) {
  if (!supervisorEmail) return { status: 'skipped' };
  return post(supervisorEmail, {
    id, role: 'supervisor', studentName, unitCode, origin
  });
}

export async function notifyAssessor({
  id, studentName, unitCode, assessorEmail, origin
}) {
  if (!assessorEmail) return { status: 'skipped' };
  return post(assessorEmail, {
    id, role: 'assessor', studentName, unitCode, origin
  });
}

export async function notifyFinal({
  id, studentEmail, supervisorEmail, assessorEmail, origin
}) {
  const targets = [studentEmail, supervisorEmail, assessorEmail].filter(Boolean);
  const sends = targets.map((to) =>
    post(to, { id, role: 'student', origin })
  );
  return Promise.allSettled(sends);
}
