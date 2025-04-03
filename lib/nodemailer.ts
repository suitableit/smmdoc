import nodemailer, { Transporter } from "nodemailer";

interface MailOptions {
  sendTo: string;
  subject: string;
  html: string;
}

// Create the transporter with proper type annotations
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Send mail function with type safety
export const sendMail = async ({
  sendTo,
  subject,
  html,
}: MailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"Smm-Panel" <${process.env.EMAIL_FROM}>`,
      to: sendTo,
      subject: subject,
      html: html,
    });
    return true;
  } catch (error) {
    console.error("Error in sending mail:", error);
    return false;
  }
};
