import nodemailer from 'nodemailer';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const host = process.env.EMAIL_SERVER_HOST;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM;

  if (!host || !user || !pass || !from) {
    console.error("Chybějící detaily e-mailového serveru v .env.local!");
    throw new Error('Konfigurace e-mailu selhala.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port: 587,
    secure: false, // TLS
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `"Pondělní florbálek" <${from}>`,
    replyTo: 'erik.nemec@me.com',
    to: from, // Pošleme primárně "sami sobě"
    bcc: to,  // Skrytá kopie všem lidem (ochrana soukromí + bypass Brevo spam filtru)
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email odeslán:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Chyba při odesílání e-mailu:', error);
    throw error;
  }
}
