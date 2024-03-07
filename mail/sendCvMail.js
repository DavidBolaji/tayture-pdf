const {transporter} = require('./transporter')


const sendCvMail = async ({
  email,
  firstName,
  filename,
  path,
}) => {
  let current = new Date()
  let cDate =
    current.getFullYear() +
    '-' +
    (current.getMonth() + 1) +
    '-' +
    current.getDate()
  let cTime =
    current.getHours() + ':' + current.getMinutes() + ':' + current.getSeconds()
  let dateTime = cDate + ' ' + cTime

  const mailOption = {
    from: 'complaint@tayture.com',
    to: email,
    subject: `Resume <${dateTime}>`,
    html: `<p>Dear ${firstName}, \n attached to this mail is your cv. Thank you for using Tayture</p>`,
    attachments: [
      {
        filename,
        path,
      },
    ],
  }


  transporter.sendMail(mailOption, function(err, data) {
    if (err) {
      console.log('Error sending mail', err)
      throw new Error(err.message)
    } else {
      console.log('Mail sent succesfully')
    }
  });
}

module.exports = {sendCvMail}
