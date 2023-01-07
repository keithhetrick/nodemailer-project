# Email Sender with Node.js

## Easily scalable & automated Emailing App.

Email Sender App built using:

- [Node.js](https://nodejs.org/en/)
- [Nodemailer](https://nodemailer.com/about/)
- [Dotenv](https://www.npmjs.com/package/dotenv)
- [File System (fs)](https://nodejs.org/api/fs.html)
- [Path](https://nodejs.org/api/path.html)
- [PM2 Process Management (daemon process manager)](https://pm2.keymetrics.io/)
- [Node-Cron](https://www.npmjs.com/package/node-cron)

### Install dependencies, create an addressBook.json & .env file (the addressBook.json receives email data as an array), add the necessary user email & password data to the .env file, and change the appropiate variables in the emailSender.js file so that the app can grab files from the correct directory.

#### To install & run the app, use the following command:

```
npm install
node emailSender.js
```

#### To run the app in the background, check to see if PM2 is installed locallly on your machine, if not, install it globally using the following command:

```
npm install pm2 -g
```

#### To run the app in the background, use the following command:

```
pm2 start emailSender.js
```

#### To stop the app from running in the background, use the following command:

```
pm2 stop emailSender.js
```

#### To check the status of the app, use the following command:

```
pm2 status
```
