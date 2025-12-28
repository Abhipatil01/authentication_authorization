import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import config from '../config/config';

export async function sendEmail(to: string, subject: string, html: string) {
  if (!config.smtpHost || !config.smtpClient || !config.smtpPass) {
    console.log('SMTP configuration is incomplete');
    return;
  }

  const smtpConfig: SMTPTransport.Options = {
    host: config.smtpHost,
    port: config.smtpClient,
    secure: false,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  };
  const transporter = nodemailer.createTransport(smtpConfig);

  await transporter.sendMail({
    from: config.emailFrom,
    to,
    subject,
    html,
  });
}
