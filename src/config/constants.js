const BASE_URL = 'https://cdn-api.co-vin.in/api'

const checkNewJobsInterval = '* * * * * *'

// const pollingCronInterval = '* * * * *'
const pollingCronInterval = '*/15 1-17 * * *'

const whatTo = [
    {
        district_id: 646,
        district_name: "Ayodhya (UP)",
        min_age_limit: 18,
        vaccine: 'COVAXIN',
        receivers: "pandey.avi8@gmail.com,alokverma816@gmail.com"
    },
    // {
    //     district_id: 646,
    //     district_name: "Ayodhya (UP)",
    //     min_age_limit: 45,
    //     vaccine: 'COVAXIN',
    //     receivers: "pandey.avi8@gmail.com,alokverma816@gmail.com"
    //     // receivers: "pandey.avi8@gmail.com,shwetavalunj@gmail.com,vinodpandey8794@gmail.com,alokverma816@gmail.com"
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
    //     district_id: 75,
    //     district_name: "Katihar (Bihar)",
    //     min_age_limit: 18,
    //     receivers: "pandey.avi8@gmail.com,amitsrathore16@gmail.com"
    // },
    // {
    //     district_id: 670,
    //     district_name: "Lucknow(UP)",
    //     min_age_limit: 18,
    //     receivers: "aparajit35@gmail.com,chatterjee.raju@rediffmail.com,ashutoshchatterjee98@gmail.com"
    // },
    // {
    //     district_id: 307,
    //     district_name: "Ernakulam (Kerala)",
    //     min_age_limit: 45,
    //     receivers: "alpanakabra@gmail.com"
    // },
    // {
    //     district_id: 453,
    //     district_name: "Sundargarh (Odisha)",
    //     dose: "available_capacity_dose1",
    //     min_age_limit: 45,
    //     receivers: "i.chhatwani29@gmail.com"
    // },
    // {
    //     district_id: 179,
    //     district_name: "Anand (Gujarat)",
    //     min_age_limit: 18,
    //     receivers: "pandey.avi8@gmail.com,kinjalparmar1992@gmail.com"
    // },
    // {
    //     district_id: 296,
    //     district_name: "Thiruvananthapuram (Kerala)",
    //     min_age_limit: 18,
    //     receivers: "chaithrarejith@gmail.com"
    // },
    // {
    //     district_id: 296,
    //     district_name: "Thiruvananthapuram (Kerala)",
    //     min_age_limit: 45,
    //     receivers: "chaithrarejith@gmail.com"
    // },
    {
        district_id: 363,
        district_name: "Pune (Maharashtra)",
        fee_type: 'Free',
        min_age_limit: 18,
        receivers: "pandey.avi8@gmail.com,shwetavalunj@gmail.com"
        // receivers: "pandey.avi8@gmail.com,shwetavalunj@gmail.com,kalburgishraddha@gmail.com"
    },
    {
        district_id: 142,
        district_name: "West Delhi",
        min_age_limit: 18,
        receivers: "pandey.avi8@gmail.com,divyakumari.1012@gmail.com"
    },
    {
        district_id: 265,
        district_name: "Bangalore Urban (Karnataka)",
        min_age_limit: 18,
        receivers: "meghana.pydi@gmail.com"
    },
    {
        district_id: 307,
        district_name: "Ernakulam (Kerala)",
        min_age_limit: 18,
        dose: "available_capacity_dose1",
        vaccine: 'COVISHIELD',
        receivers: "pandey.avi8@gmail.com,alpanakabra@gmail.com"
    },
    {
        district_id: 307,
        district_name: "Ernakulam (Kerala)",
        min_age_limit: 45,
        dose: "available_capacity_dose2",
        vaccine: 'COVISHIELD',
        receivers: "pandey.avi8@gmail.com,alpanakabra@gmail.com"
    },
]

const whereTo = {
    getStates: `${BASE_URL}/v2/admin/location/states`,
    getDistricts: (state_id) => `${BASE_URL}/v2/admin/location/districts/${state_id}`,
    getCalendarSlots: (district_id, date) => `${BASE_URL}/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${date}`,
    getCalendarSlotsV2: (query) => `${BASE_URL}/v2/appointment/sessions/public/calendarByDistrict?${query}`,
}

const configs = {
    whatTo,
    whereTo,
    checkNewJobsInterval,
    pollingCronInterval
}

module.exports = configs