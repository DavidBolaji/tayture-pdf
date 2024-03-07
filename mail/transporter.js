require("dotenv").config();
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'tayture.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.USER_PASS,
  },
})


const startMailServer = () => {
  transporter.verify((error, success) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Mail hello server is running')
    }
  })
}

module.exports = {
  transporter,
  startMailServer
}
