const express = require("express");
const app = express();
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const PORT = process.env.PORT || 3000;

dotenv.config();

// For Personal Use
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER_EMAIL,
    pass: process.env.GMAIL_USER_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },

  // For Business Use - Gmail // NOT ACTIVE BY DEFAULT
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

let mailOptions = {
  from: process.env.GMAIL_USER_EMAIL,
  to: process.env.GMAIL_USER_EMAIL,
  subject: "LOL Final Email Test - for real",
  text: "Email sent using Node.js & Nodemailer",
};

transporter
  .sendMail(mailOptions)
  .then(function (res) {
    console.log("Email sent successfully!", res);
  })
  .catch(function (err) {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
