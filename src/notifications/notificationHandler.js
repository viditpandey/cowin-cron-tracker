const nodemailer = require("nodemailer")
const webpush = require('web-push');
const JobsRepo = require("../cron-scheduler/repo/JobsRepo");
const jobsRepo = new JobsRepo();
const configs = require('../config/constants')

const NotificationHandler = {
    transporter: null,
    notifiersByJobId: configs.notifiersByJobId || {},
    init: async () => {
        var username = process.env.AUTH_USERNAME_GMAIL
        var passKey = process.env.AUTH_PASS_GMAIL
        if (!username) {
            console.log('[NotificationHandler.init] failed since no configured email found.')
            return
        }
        if (!passKey) {
            console.log('[NotificationHandler.init] failed since no configured email pwd found.')
            return
        }

        console.log('[NotificationHandler.init] success, attempting notifn transporter creation')
        NotificationHandler.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: username,
                pass: passKey
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
    },
    registerForPushNotifns: function (jobId, subscription) {
        console.log('[NotificationHandler.registerForPushNotifns] started for: ', jobId)
        if (!this.notifiersByJobId[jobId]) this.notifiersByJobId[jobId] = []
        this.notifiersByJobId[jobId].push(subscription)
        const name = jobsRepo.findAJobById(jobId)
        const payload = JSON.stringify({ title: 'notified?', body: `you will now be notified for: '${name}'` })
        webpush.sendNotification(subscription, payload).catch(error => {
            console.error('[NotificationHandler.registerForPushNotifns] error while sending push notifications', error.stack);
        })
    },
    sendPush: function (jobId, title, message) {
        console.log('[NotificationHandler.sendPush] initiating for: ', jobId)
        if (!this.notifiersByJobId[jobId]) this.notifiersByJobId[jobId] = []
        const payload = JSON.stringify({ title, body: message || 'Please check  your mail/spam for center details.' })
        this.notifiersByJobId[jobId].forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('[server.handleRequests] error while sending push notifications', error.stack);
            })
        })
    }
}

module.exports = NotificationHandler