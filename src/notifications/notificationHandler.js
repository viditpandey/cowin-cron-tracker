const nodemailer = require("nodemailer")

const NotificationHandler = {
    transporter: null,
    init: async () => {
        if (!process.env.AUTH_USERNAME_GMAIL) {
            console.log('[NotificationHandler.init] failed since no configured email found.')
            return
        } else if (!process.env.AUTH_PASS_GMAIL) {
            console.log('[NotificationHandler.init] failed since no configured email pwd found.')
            return
        } else {
            NotificationHandler.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.AUTH_USERNAME_GMAIL,
                  pass: process.env.AUTH_PASS_GMAIL
                },
              })
        }
    },
    sendMail: async (to, subject, data) => {
        if (!NotificationHandler.transporter) {
            console.log('[NotificationHandler.sendMail] mail transporter not configured, value is null.')
            return
        }
        let info = await NotificationHandler.transporter.sendMail({
            from: 'Vidit Pandey via cowin-covid-tracker',
            to: 'vidit8794@gmail.com',
            bcc: to,
            subject: subject,
            text: data,
        });
        console.log('info>>>>>>>', info.response)
    }
}

module.exports = NotificationHandler