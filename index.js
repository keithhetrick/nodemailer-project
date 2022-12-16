const express = require("express");
const app = express();
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
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

let mailOptions = {
  // The email address of the sender
  from: process.env.GMAIL_USER_EMAIL,

  // Emails from the addressBook.json file
  to: addressBook,
  // cc: addressBook,
  // bcc: addressBook,

  subject: "Nice Nodemailer test",

  // Html body
  html: "<b>Hey there! </b> <br> This is our first message sent with Nodemailer. <br> <br> <b>Have a nice day!</b> <br> <br> <b>Best regards,</b> <br> <b>Team</b>, <br> <b>Company</b>",
};

transporter
  .sendMail(mailOptions)
  // send individual emails to each address in the addressBook.json file
  // .sendMail(addressBook.map((address) => ({ ...mailOptions, to: address })))
  .then(function (res) {
    console.log("Good news! Email has been sent successfully.", res);
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
