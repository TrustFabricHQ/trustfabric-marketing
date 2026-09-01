const nodemailer = require('nodemailer');
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { name, company, email, phone, size, message, recaptchaToken, consentMarketing, consentData } = req.body || {};

    if (!name || !company || !email || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!recaptchaToken) {
        return res.status(400).json({ error: 'CAPTCHA verification required' });
    }

    // Verify reCAPTCHA token with Google
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
        return res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
    }

    // Insert lead into Neon database
    try {
        const sql = neon(process.env.DATABASE_URL);
        await sql`
            INSERT INTO leads (name, company, email, phone, size, message, status, consent_marketing, consent_data)
            VALUES (
                ${name},
                ${company},
                ${email},
                ${phone},
                ${size || null},
                ${message || null},
                'New',
                ${consentMarketing === true},
                ${consentData === true}
            )
        `;
    } catch (dbErr) {
        console.error('DB insert error:', dbErr);
        // Don't block the response — email still sends even if DB write fails
    }

    // Send email notification
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 24px; }
  .card { background: #ffffff; border-radius: 8px; padding: 32px; max-width: 560px; margin: 0 auto; }
  .badge { display: inline-block; background: #E31E24; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 16px; }
  h2 { color: #0F172A; font-size: 20px; margin: 0 0 24px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top; }
  td:first-child { color: #64748B; font-weight: 600; width: 140px; }
  td:last-child { color: #0F172A; }
  .footer { margin-top: 24px; font-size: 12px; color: #94A3B8; }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">New Lead</span>
    <h2>Get Started Request — TrustFabric</h2>
    <table>
      <tr><td>Name</td><td>${escapeHtml(name)}</td></tr>
      <tr><td>Company</td><td>${escapeHtml(company)}</td></tr>
      <tr><td>Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td>Phone</td><td>${escapeHtml(phone)}</td></tr>
      <tr><td>Company Size</td><td>${escapeHtml(size || '—')}</td></tr>
      <tr><td>Message</td><td>${escapeHtml(message || '—')}</td></tr>
    </table>
    <p class="footer">Submitted via trustfabric.in/get-started · CAPTCHA verified · Saved to lead portal</p>
  </div>
</body>
</html>`;

    try {
        await transporter.sendMail({
            from: `TrustFabric Leads <${process.env.GMAIL_USER}>`,
            to: 'info@trustfabric.in',
            replyTo: email,
            subject: `New Lead: ${name} (${company})`,
            html
        });
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Mail error:', err);
        return res.status(500).json({ error: 'Failed to send email' });
    }
};

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
