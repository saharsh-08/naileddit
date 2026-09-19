import { Resend } from "resend";

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    // const testAccount = await nodemailer.createTestAccount();
    // console.log("Test account created:", testAccount);

    // Create a transporter using SMTP
    // const transporter = nodemailer.createTransport({
    //   host: "smtp.ethereal.email",
    //   port: 465,
    //   secure: true,
    //   auth: {
    //     user: 'j5ks365zhlw46b34@ethereal.email',
    //     pass: '2hbV192T36nqyDUWhk',
    //   },
    //   debug: true
    // });

    // const info = await transporter.sendMail({
    //   from: '"Foo" <foo@example.com>',
    //   to,
    //   subject,
    //   text,
    // });

    // console.log("Message send successfully:", info.messageId);
    // console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

    const resend = new Resend(process.env.RESEND_API_KEY);

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html
    });

    if (response.data?.id) console.log("Email sent successfully: ", response.data?.id);
  } catch (error) {
    console.log("Error in sending email: ", error);
  }
}