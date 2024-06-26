import nodemailer from 'nodemailer';

export async function sendEmailService({ to, subject, message, attachments = [] } = {}) {
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 465, // 587 => not secure || 465 => secure that depend on ( secure ) ATTRIBUTE
    secure: true, // ssl(tls)
    service: 'gmail',
    auth: {
      user: 'hjjsh78jjudi@gmail.com',
      pass: 'crgupcejxbmjdzsp',
    },
  });

  const emailInfo = await transporter.sendMail({
    // from: "EMAIL",
    from: '"KARMA" <EMAIL>', // address for email
    to,
    subject,
    html: message,
    attachments,
  });

  return !!emailInfo.accepted.length;
}
