require("dotenv").config();

const http = require("http");
const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const hostname = "0.0.0.0";
const PORT = process.env.PORT;
const addressBook = require("./addressBook.json");
const path = require("path");
const fs = require("fs");

// ======================================================== \\
// ================== EMAIL CONFIGURATION ================= ||
// ======================================================== //

async function emailSender() {
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

    // ======================================================== \\
    // ================== FOR BUSINESS USE ==================== ||
    // ======================================================== //

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

  // ======================================================== \\
  // ================== ATTACHMENTS LOGIC =================== ||
  // ======================================================== //

  const files = fs.readdirSync("../web-scraper-test-2");
  const folder_Path = "../web-scraper-test-2";

  const attachments = files.map((file) => {
    return {
      filename: file,
      path: path.join(__dirname, folder_Path, file),
    };
  });
  console.log("ATTACHMENTS: ", attachments);

  // ======================================================== \\
  // ================== EMAIL SCHEDULER ===================== ||
  // ======================================================== //

  console.log("\nrunning daily task\n");
  console.log("Sending emails to...", addressBook, "\n");
  // Send email to each recipient in addressBook.json
  addressBook.forEach((recipient) => {
    const mailOptions = {
      from: process.env.GMAIL_USER_EMAIL,
      to: recipient,
      subject: `Daily Job Scrap - ${new Date().toLocaleString()}.pdf`,
      // add all files in folder to attachments array
      attachments: attachments,
      text:
        `Hello ${recipient},` +
        "\n\n" +
        "This is an automated email sent from Node.js, NodeMailer, and Cron. This has a current version of a pdf file of web-scraped developer jobs (via Google) in the Nashville area." +
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
          mailOptions.subject,
          mailOptions.attachments,
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
}

// ======================================================== \\
// ================== CRON SCHEDULER ====================== ||
// ======================================================== //

// cron.schedule("*/10 * * * *", async () => {
//   await emailSender();
// });

cron.schedule("0 9 * * *", emailSender, {
  scheduled: true,
  timezone: "America/Chicago",
});

// ======================================================== \\
// PM2 CONFIGURATION
// ======================================================== //

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello World");
});

server.listen(PORT, hostname, () => {
  console.log(`\nServer running at http://${hostname}:${PORT}/`);
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
