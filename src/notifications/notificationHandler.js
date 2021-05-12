const nodemailer = require("nodemailer")

const NotificationHandler = {
    transporter: null,
    init: async () => {
        var username = process.env.AUTH_USERNAME_GMAIL
        var passKey = process.env.AUTH_PASS_GMAIL
        if (!username) {
            console.log('[NotificationHandler.init] failed since no configured email found.')
            username = 'viditpandeytest@gmail.com'
        }
        if (!passKey) {
            console.log('[NotificationHandler.init] failed since no configured email pwd found.')
            passKey = 'ViditPandeyTest'
        }
            
        console.log('[NotificationHandler.init] success, attempting notifn transporter creation')
        NotificationHandler.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: username,
                pass: process.env.AUTH_PASS_GMAIL
            },
        })
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