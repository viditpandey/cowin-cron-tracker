const nodemailer = require("nodemailer")

const NotificationHandler = {
    transporter: null,
    init: async () => {
        NotificationHandler.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.AUTH_USERNAME_GMAIL || '',
              pass: process.env.AUTH_PASS_GMAIL || ''
            },
          })
    },
    sendMail: async (to, data) => {
        let info = await NotificationHandler.transporter.sendMail({
            from: 'Vidit Pandey via cowin-covid-tracker',
            to: `${to}, cowin-tracker@yopmail.com`,
            subject: "Slots available for:",
            text: data,
        });
        console.log('info>>>>>>>', info.response)
    }
}

module.exports = NotificationHandler