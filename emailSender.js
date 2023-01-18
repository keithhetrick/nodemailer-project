require("dotenv").config();

const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const addressBook = require("./addressBook.json");
const path = require("path");
const fs = require("fs");

// chalk for console.log() styling
const chalk = require("chalk");

// ENV variables
const PORT = process.env.PORT;
const GMAIL_USER_EMAIL = process.env.GMAIL_USER_EMAIL;
const GMAIL_USER_PASSWORD = process.env.GMAIL_USER_PASSWORD;
const BUSINESS_EMAIL_HOST = process.env.BUSINESS_EMAIL_HOST;
const BUSINESS_EMAIL_PASSWORD = process.env.BUSINESS_EMAIL_PASSWORD;
const LOCAL_DIRECTORY = process.env.LOCAL_DIRECTORY;

// ======================================================== \\
// ================== WATCHER LOGIC ======================= ||
// ======================================================== //

// executes emailSender() every time new file is added to LOCAL_DIRECTORY
fs.watch(LOCAL_DIRECTORY, async (eventType, filename) => {
  if (eventType === "change") {
    console.log(
      `\n\nNew file added: ${filename} - ${new Date().toLocaleString()}\n\n`
    );
    await emailSender();
  }
});

console.log(
  "\n========================================\n",
  chalk.yellow.italic(`\nWATCHING FOR NEW FILES IN DIRECTORY:\n`) +
    chalk.red(`${LOCAL_DIRECTORY}\n`),
  "\n========================================\n"
);

// ======================================================== \\
// ================== CRON SCHEDULER ====================== ||
// ======================================================== //

// NOT NEEDED - using fs.watch() instead

// cron.schedule("0 */12 * * *", emailSender, {
//   scheduled: true,
//   timezone: "America/Chicago",
// });

// ======================================================== \\
// ================== EMAIL CONFIGURATION ================= ||
// ======================================================== //

async function emailSender() {
  // For Personal Use
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER_EMAIL,
      pass: GMAIL_USER_PASSWORD,
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
    // user: BUSINESS_EMAIL_HOST,
    // pass: BUSINESS_EMAIL_PASSWORD,
    // },
    // tls: {
    //   rejectUnauthorized: false,
    // },
  });

  // ======================================================== \\
  // ================== ATTACHMENTS LOGIC =================== ||
  // ======================================================== //

  const files = fs.readdirSync(LOCAL_DIRECTORY);
  const folder_Path = LOCAL_DIRECTORY;

  const attachments = files.map((file) => {
    return {
      filename: file,
      path: path.join(folder_Path, file),
      contentType: "application/pdf",
    };
  });
  console.log("ATTACHMENTS: ", attachments);

  // ======================================================== \\
  // ================== EMAIL SCHEDULER ===================== ||
  // ======================================================== //

  console.log(
    chalk.yellow(`\nRunning daily task at: ${new Date().toLocaleString()} \n`)
  );
  console.log("Sending emails to...", addressBook, "\n");

  // Send email to each recipient in addressBook.json
  addressBook.forEach((recipient) => {
    const mailOptions = {
      from: GMAIL_USER_EMAIL,
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
          `\n\n${new Date().toLocaleString()} - ` +
            chalk.redBright.italic("Good news!") +
            ` Email has been sent successfully to: ${recipient} \n\n`,
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
// ================== EXPRESS SERVER ====================== ||
// ======================================================== //

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(
    chalk.green(
      "\n ======================================== \n\nYooo! Listening on port " +
        chalk.black.bgYellowBright(`${PORT}`) +
        ". Let's " +
        chalk.redBright.italic(
          "gettit 🚀 \n\n ========================================"
        )
    )
  );
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

process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled rejection at ", promise, `reason: ${err.message}`);
  process.exit(1);
});
