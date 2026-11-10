const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '')
  }
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, error: 'Method not allowed' });
  }

  const relaySecret = req.headers['x-relay-secret'];
  if (!process.env.INTERNAL_RELAY_KEY || relaySecret !== process.env.INTERNAL_RELAY_KEY) {
    return res.status(403).json({ status: false, error: 'Unauthorized relay access' });
  }

  const { to, subject, html } = req.body || {};
  if (!to || !subject || !html) {
    return res.status(400).json({ status: false, error: 'Parameter to, subject, html wajib diisi!' });
  }

  try {
    const info = await transporter.sendMail({
      from: `"KAEL API" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });

    return res.status(200).json({
      status: true,
      message: 'Email berhasil dikirim via Gmail!',
      messageId: info.messageId
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: 'Gmail Relay Error: ' + error.message
    });
  }
};
