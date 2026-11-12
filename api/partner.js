const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { name, company, email, phone, type, website, message, consentData } = req.body || {};

    if (!name || !company || !email || !phone || !type || !consentData) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 24px; }
  .card { background: #ffffff; border-radius: 8px; padding: 32px; max-width: 560px; margin: 0 auto; }
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
    <h2>New Partner Application — TrustFabric</h2>
    <table>
      <tr><td>Name</td><td>${escapeHtml(name)}</td></tr>
      <tr><td>Company</td><td>${escapeHtml(company)}</td></tr>
      <tr><td>Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td>Phone</td><td>${escapeHtml(phone)}</td></tr>
      <tr><td>Partner type</td><td>${escapeHtml(type)}</td></tr>
      <tr><td>Website</td><td>${escapeHtml(website || '—')}</td></tr>
      <tr><td>Message</td><td>${escapeHtml(message || '—')}</td></tr>
    </table>
    <p class="footer">Submitted via trustfabric.in/partner</p>
  </div>
</body>
</html>`;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `TrustFabric Website <${process.env.GMAIL_USER}>`,
            to: 'info@trustfabric.in',
            replyTo: email,
            subject: `Partner Application from ${name} (${company})`,
            html,
        });
    } catch (err) {
        console.error('Mail error:', err);
        return res.status(500).json({ error: 'Failed to send' });
    }

    return res.status(200).json({ success: true });
};

function escapeHtml(str) {
    return String(str)
        .slice(0, 2000)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
