import dotenv from 'dotenv';

dotenv.config();

/**
 * Dispatch system notification emails
 * Supports console simulation logs with HTML renderings, or real dispatch via nodemailer if SMTP is defined
 */
export const sendEmailNotification = async ({ to, subject, html, text }) => {
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (smtpConfigured) {
    try {
      // Lazy load nodemailer to avoid dependencies errors if they don't want real emails
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"ShareBite Platform" <noreply@sharebite.org>',
        to,
        subject,
        text: text || subject,
        html
      });
      console.log(`[SMTP Email Sent] MessageId: ${info.messageId} to ${to}`);
      return true;
    } catch (err) {
      console.error('[SMTP Email Error] Failed to send email via SMTP, falling back to logging:', err.message);
    }
  }

  // Visual simulation logs in console
  console.log(`
========================================================================
📧  [EMAIL NOTIFICATION DISPATCH SIMULATION]
========================================================================
TO:      ${to}
SUBJECT: ${subject}
------------------------------------------------------------------------
HTML PREVIEW:
${html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 200)}...
========================================================================
`);
  return true;
};
