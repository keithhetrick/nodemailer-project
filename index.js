const express = require("express");
const app = express();
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const PORT = process.env.PORT || 3000;
const addressBook = require("./addressBook.json");

dotenv.config();

// For Personal Use
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER_EMAIL,
    pass: process.env.GMAIL_USER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },

  // For Business Use // NOT ACTIVE BY DEFAULT
  // host: "smtp.gmail.com",
  // port: 3000,
  // secure: true, // use TLS
  // auth: {
  // user: process.env.BUSINESS_EMAIL_HOST,
  // pass: process.env.BUSINESS_EMAIL_PASSWORD,
  // },
  // tls: {
  //   rejectUnauthorized: false,
  // },
});

// Schedule emails for 8 am every day central time
cron.schedule("59 * * * * *", () => {
  console.log("\nrunning daily task\n");
  console.log("Sending emails to...", addressBook, "\n");
  // Send email to each recipient in addressBook.json
  addressBook.forEach((recipient) => {
    const mailOptions = {
      from: process.env.GMAIL_USER_EMAIL,
      to: recipient,
      subject: "Hello from Node.js",
      text:
        `Hello ${recipient},` +
        "\n\n" +
        "This is an automated email sent from Node.js, NodeMailer, and Cron. " +
        "\n\n" +
        "Super dope. \n\n" +
        "Thank you for using this app! I hope you find it useful. \n" +
        "Keep learning, and keep on keeping on👌👌 \n\n" +
        "Best regards," +
        "\n\nYour friendly neighborhood EMAIL NODE CRON APP",
    };

    transporter.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(
          `\n\n${new Date().toLocaleString()} - Good news! Email has been sent successfully to: ${recipient} \n\n`,
          // desructure the response object
          {
            messageId: res.messageId,
            envelope: res.envelope,
            envelopeFrom: res.envelope.from,
            envelopeTo: res.envelope.to,
            accepted: res.accepted,
            rejected: res.rejected,
            envelopeTime: res.envelopeTime,
            response: res.response,
            messageTime: res.messageTime,
            messageSize: res.messageSize,
            fullResponse: res,
          },
          "\n"
        );
      }
    });
  });
  transporter.close();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`\nListening on port ${PORT}`);
});

// ======================================================== \\
// ======================================================== \\
// ================== PORT HEATLTH CHECK ================== ||
// ======================================================== //
// ======================================================== //

// Add a health check route in express
app.get("/_health", (req, res) => {
  res.status(200).send("ok");
  console.log("Health check route hit");
});

process.on("exit", (code) => {
  // Only synchronous calls
  console.log(`Process exited with code: ${code}`);
});

process.on("SIGTERM", (signal) => {
  console.log(`Process ${process.pid} received a SIGTERM signal`);
  process.exit(0);
});

process.on("SIGINT", (signal) => {
  console.log(`Process ${process.pid} has been interrupted`);
  process.exit(0);
});

// process.on("uncaughtException", (err) => {
//   console.log(`Uncaught Exception: ${err.message}`);
//   process.exit(1);
// });

// process.on("unhandledRejection", (reason, promise) => {
//   console.log("Unhandled rejection at ", promise, `reason: ${err.message}`);
//   process.exit(1);
// });
