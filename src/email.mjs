import nodemailer from 'nodemailer';

export async function sendBriefingEmail(config, briefing) {
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  });

  await transporter.verify();

  const subjectDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  const result = await transporter.sendMail({
    from: config.emailFrom,
    to: config.emailTo,
    subject: `${config.emailSubjectPrefix} — ${subjectDate}`,
    text: briefing
  });

  return {
    accepted: result.accepted,
    rejected: result.rejected,
    response: result.response,
    messageId: result.messageId
  };
}
