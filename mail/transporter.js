require("dotenv").config();
const nodemailer = require('nodemailer')
const axios = require('axios');

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

async function callEndpoint() {
  try {
      const response = await axios.get(process.env.SERVER_URL);
      console.log('Endpoint called successfully:', response.data);
  } catch (error) {
      console.error('Error calling endpoint:', error);
  }
}


module.exports = {
  transporter,
  startMailServer,
  callEndpoint
}
