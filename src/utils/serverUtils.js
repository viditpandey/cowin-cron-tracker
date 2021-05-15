const webpush = require('web-push');

const ServerUtils = {
    publicVapidKey: process.env.VAPID_PUBLIC_KEY,
    privateVapidKey: process.env.VAPID_PRIV_KEY,
    clientEmail: process.env.AUTH_USERNAME_GMAIL,
    registerWebPush: function () {
        webpush.setVapidDetails(`mailto:${this.clientEmail}`, this.publicVapidKey, this.privateVapidKey)
    }
}

module.exports = ServerUtils