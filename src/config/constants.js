const AWS_URL = 'http://cowin-cron-tracker.ap-south-1.elasticbeanstalk.com/getJob'
const BASE_URL = 'https://cdn-api.co-vin.in/api'

const checkNewJobsInterval = '* * * * * *'

// const pollingCronInterval = '* * * * *'
const pollingCronInterval = '55 18 * * *'

const whatTo = [
    // {
    //     district_id: 646,
    //     district_name: "Ayodhya (UP)",
    //     min_age_limit: 18,
    //     receivers: "pandey.avi8@gmail.com,alokverma816@gmail.com,yadavshubham20091994@gmail.com"
    // },
    // {
    //     district_id: 646,
    //     district_name: "Ayodhya (UP)",
    //     min_age_limit: 45,
    //     receivers: "pandey.avi8@gmail.com"
    // },
    // {
    //     district_id: 670,
    //     district_name: "Lucknow(UP)",
    //     min_age_limit: 18,
    //     receivers: "pandey.avi8@gmail.com,nmt.1615@gmail.com,aparajit35@gmail.com,chatterjee.raju@rediffmail.com"
    // },
    // {
    //     district_id: 624,
    //     district_name: "Prayagraj (UP)",
    //     min_age_limit: 18,
    //     receivers: "pandey.avi8@gmail.com"
    // },
    // {
    //     district_id: 697,
    //     district_name: "Dehradun (UK)",
    //     min_age_limit: 18,
    //     receivers: "pandey.avi8@gmail.com,yatharthdeoly@gmail.com"
    // },
    // {
    //     district_id: 363,
    //     district_name: "Pune (Maharashtra)",
    //     min_age_limit: 18,
    //     receivers: "pandey.avi8@gmail.com,shwetavalunj@gmail.com,arnavmo@gmail.com,kalburgishraddha@gmail.com"
    // },
    // {
    //     district_id: 179,
    //     district_name: "Anand (Gujarat)",
    //     min_age_limit: 18,
    //     receivers: "pandey.avi8@gmail.com,kinjalparmar1992@gmail.com"
    // },
    // {
    //     district_id: 142,
    //     district_name: "West Delhi",
    //     min_age_limit: 18,
    //     receivers: "pandey.avi8@gmail.com,divyakumari.1012@gmail.com"
    // },
    // {
    //     district_id: 307,
    //     district_name: "Ernakulam (Kerala)",
    //     min_age_limit: 45,
    //     notifn_threshold: 1,
    //     receivers: "pandey.avi8@gmail.com,alpanakabra@gmail.com"
    // },
    // {
    //     district_id: 453,
    //     district_name: "Sundargarh (Odisha)",
    //     dose: "available_capacity_dose1",
    //     min_age_limit: 45,
    //     receivers: "pandey.avi8@gmail.com,i.chhatwani29@gmail.com"
    // },
    // {
    //     district_id: 265,
    //     district_name: "Bangalore Urban (Karnataka)",
    //     min_age_limit: 18,
    //     receivers: "pandey.avi8@gmail.com,amitsrathore16@gmail.com"
    // },
]

const whereTo = {
    getStates: `${BASE_URL}/v2/admin/location/states`,
    getDistricts: (state_id) => `${BASE_URL}/v2/admin/location/districts/${state_id}`,
    getCalendarSlots: (district_id, date) => `${BASE_URL}/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${date}`,
    getCalendarSlotsV2: (query) => `${BASE_URL}/v2/appointment/sessions/public/calendarByDistrict?${query}`,
    getCalendarSlotsv3: (district_id, date) => `${AWS_URL}?district_id=${district_id}&date=${date}`,
}

const notifiersByJobId = {}
// const notifiersByJobId = {"646_45":[{"endpoint":"https://sg2p.notify.windows.com/w/?token=BQYAAAAVynw9R6dS%2bsY4jYDrYUcPk2Cbdc7sc1IQAEIb0LbQj3MJ6NIejtyswa%2bMiuVljSP%2fuqVsWZxFB%2bomdUaMD4JBRGyL0OSYMZTZ4iThYlKP2YAn3oCcv%2br3r6%2b6eZqskM%2b0rZcC%2beKlW9hCPy7Euol1jSN7NSY9%2f6pbEHNlYfbU9qutXF5kasyXueaUtfVxOTTsTMhMGHGoJCoK%2fsZc5oqNcSsZEljLUfNpVrkLNBKj5TovN5NSLI7g27WDvp3YHjlYY7d8glp9W6Ef%2bUH29QZaUOnS3ov0DNfcZ3h85BMTujXkQ2GlASHS0xY9B2O4h8Lb3hL2TNMZzcXaiEtNUD3g","expirationTime":null,"keys":{"p256dh":"BB_X14nzSPhGsv7qkIjay5FFCGg_EX1BbKRN0fAKtE_eU1bO2W9ngDShlGkRRd_NkMMrsYSk9BY0mY6tTeIP4co","auth":"JFoGKiKQgRoYLo22UHeSDw"}},{"endpoint":"https://sg2p.notify.windows.com/w/?token=BQYAAAAVynw9R6dS%2bsY4jYDrYUcPk2Cbdc7sc1IQAEIb0LbQj3MJ6NIejtyswa%2bMiuVljSP%2fuqVsWZxFB%2bomdUaMD4JBRGyL0OSYMZTZ4iThYlKP2YAn3oCcv%2br3r6%2b6eZqskM%2b0rZcC%2beKlW9hCPy7Euol1jSN7NSY9%2f6pbEHNlYfbU9qutXF5kasyXueaUtfVxOTTsTMhMGHGoJCoK%2fsZc5oqNcSsZEljLUfNpVrkLNBKj5TovN5NSLI7g27WDvp3YHjlYY7d8glp9W6Ef%2bUH29QZaUOnS3ov0DNfcZ3h85BMTujXkQ2GlASHS0xY9B2O4h8Lb3hL2TNMZzcXaiEtNUD3g","expirationTime":null,"keys":{"p256dh":"BB_X14nzSPhGsv7qkIjay5FFCGg_EX1BbKRN0fAKtE_eU1bO2W9ngDShlGkRRd_NkMMrsYSk9BY0mY6tTeIP4co","auth":"JFoGKiKQgRoYLo22UHeSDw"}}],"179_18":[{"endpoint":"https://sg2p.notify.windows.com/w/?token=BQYAAAAVynw9R6dS%2bsY4jYDrYUcPk2Cbdc7sc1IQAEIb0LbQj3MJ6NIejtyswa%2bMiuVljSP%2fuqVsWZxFB%2bomdUaMD4JBRGyL0OSYMZTZ4iThYlKP2YAn3oCcv%2br3r6%2b6eZqskM%2b0rZcC%2beKlW9hCPy7Euol1jSN7NSY9%2f6pbEHNlYfbU9qutXF5kasyXueaUtfVxOTTsTMhMGHGoJCoK%2fsZc5oqNcSsZEljLUfNpVrkLNBKj5TovN5NSLI7g27WDvp3YHjlYY7d8glp9W6Ef%2bUH29QZaUOnS3ov0DNfcZ3h85BMTujXkQ2GlASHS0xY9B2O4h8Lb3hL2TNMZzcXaiEtNUD3g","expirationTime":null,"keys":{"p256dh":"BB_X14nzSPhGsv7qkIjay5FFCGg_EX1BbKRN0fAKtE_eU1bO2W9ngDShlGkRRd_NkMMrsYSk9BY0mY6tTeIP4co","auth":"JFoGKiKQgRoYLo22UHeSDw"}}]}

const configs = {
    whatTo,
    whereTo,
    checkNewJobsInterval,
    pollingCronInterval,
    notifiersByJobId
}

module.exports = configs