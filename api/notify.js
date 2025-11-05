// /api/notify.js  (Vercel serverless function)
// Node runtime: ESM is fine on Vercel. No build step needed.

import { Resend } from 'resend';

// Basic CORS helper so you can call this from localhost:3000
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // preflight
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const {
      to,
      id,
      role,
      studentName,
      unitCode,
      origin // optional, falls back to APP_ORIGIN or request Origin
    } = req.body || {};

    if (!to || !id || !role) {
      return res.status(400).json({ ok: false, error: 'Missing: to, id, role' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const base =
      origin ||
      process.env.APP_ORIGIN ||
      req.headers.origin ||
      '';

    // Link students/supervisors/assessors back into the same app
    const link = `${base}/?id=${encodeURIComponent(id)}&role=${encodeURIComponent(role)}`;

    const subjRole = role.toUpperCase();
    const subject = `Action required — ${subjRole} step for ${studentName || '-'} (${unitCode || 'AURTTE104'})`;
    const html = `
      <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;line-height:1.4">
        <p>Hello,</p>
        <p>Please complete the <strong>${subjRole}</strong> step for
          <strong>${studentName || '-'}</strong> (${unitCode || 'AURTTE104'}).</p>
        <p><a href="${link}">${link}</a></p>
        <hr/>
        <small>This email was sent automatically by Digital Declaration.</small>
      </div>
    `;

    const resp = await resend.emails.send({
      // For testing you can use the built-in verified sender:
      // 'onboarding@resend.dev'
      from: 'Digital Declaration <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    return res.status(200).json({ ok: true, id: resp?.id || null });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
