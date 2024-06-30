const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function sendMail(toEmail, subject, message) {
  transporter.sendMail(
    {
      from: process.env.EMAIL_USERNAME,
      to: toEmail,
      subject: subject,
      html: message,
    },
    (error, info) => {
      if (error) {
        console.log("Error: ", error);
        return res.status(500).json({ error: "Email could not be sent" });
      }
      console.log("Message %s sent: %s", info.messageId, info.response);
      res.status(200).json({ success: true, data: "Email sent" });
    }
  );
}

module.exports = { sendMail };
