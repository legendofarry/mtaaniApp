const nodemailer = require("nodemailer");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

transporter
  .verify()
  .then(() => {
    logger.info("Brevo SMTP ready");
  })
  .catch((err) => {
    logger.warn("Brevo SMTP not ready:", err.message);
  });

module.exports = transporter;
