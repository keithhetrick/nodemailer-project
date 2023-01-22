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

// executes emailJobSender() every time new file is added to LOCAL_DIRECTORY
fs.watch(LOCAL_DIRECTORY, (eventType, filename) => {
  if (eventType === "change") {
    emailJobSender();
  }
});

console.log(
  "\n========================================\n",
  chalk.yellow.italic(`\nWATCHING FOR NEW FILES IN DIRECTORY:\n`) +
    chalk.red(`${LOCAL_DIRECTORY}\n`),
  "\n========================================"
);

// ======================================================== \\
// ================== CRON SCHEDULER ====================== ||
// ======================================================== //

// cron job that executes emailJobSender() every day at 8am -> // NOT NEEDED - using fs.watch() instead

// cron.schedule("0 8 * * *", emailJobSender, {
// scheduled: true,
// timezone: "America/Chicago",
// });

// cron job that executes emailDeletionConfirmation() every Monday, Wednesday & Friday at 8:01am
cron.schedule("1 8 * * 1,3,5", emailDeletionConfirmation, {
  scheduled: true,
  timezone: "America/Chicago",
});

// ======================================================== \\
// ================== EMAIL CONFIGURATION ================= ||
// ======================================================== //

async function emailJobSender() {
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
  console.log("\nATTACHMENTS: ", attachments);

  // ======================================================== \\
  // ================== EMAIL SCHEDULER ===================== ||
  // ======================================================== //

  console.log(
    chalk.yellow(
      `\nRunning daily task (Send email) at: ${new Date().toLocaleString()} \n`
    )
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
            chalk.redBright.bold.italic("Good news!") +
            ` Email has been sent successfully to: ` +
            chalk.redBright.italic(`${recipient} \n\n`),
          mailOptions.subject,
          mailOptions.attachments,
          // destructure the response object
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

// send an email to the host confirming the deletion of the files from the directory
async function emailDeletionConfirmation() {
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
  });

  const mailOptions = {
    from: GMAIL_USER_EMAIL,
    to: GMAIL_USER_EMAIL,
    subject: `Daily Job Scrap Deletion - ${new Date().toLocaleString()}`,
    text:
      `Hello ${GMAIL_USER_EMAIL},` +
      "\n\n" +
      `This is an automated email sent from Node.js, NodeMailer, and Cron. This is a confirmation that the files in directory ${LOCAL_DIRECTORY} have been deleted at ${new Date().toLocaleString()}.` +
      "\n\n" +
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
          chalk.redBright.bold.italic("Good news!") +
          ` Email has been sent successfully to: ` +
          chalk.redBright.italic(`${GMAIL_USER_EMAIL}, \n\n`),
        mailOptions.subject,
        `confirming files ${LOCAL_DIRECTORY} have been deleted.\n`
      );
    }
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
