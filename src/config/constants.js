const BASE_URL = 'https://cdn-api.co-vin.in/api'

const checkNewJobsInterval = '* * * * * *'

// const pollingCronInterval = '* * * * *'
const pollingCronInterval = '*/15 2-10 * * *'

const whatTo = [
    {
        district_id: 646,
        district_name: "Ayodhya",
        min_age_limit: 18,
        receivers: "pandey.avi8@gmail.com,alokverma816@gmail.com,yadavshubham20091994@gmail.com,"
    },
    // {
    //     district_id: 646,
    //     district_name: "Ayodhya",
    //     min_age_limit: 45,
    //     // receivers: "pandey.avi8@gmail.com,shwetavalunj@gmail.com,vinodpandey8794@gmail.com"
    //     receivers: "pandey.avi8@gmail.com,alokverma816@gmail.com"
    // },
    {
        district_id: 670,
        district_name: "Lucknow",
        min_age_limit: 18,
        receivers: "pandey.avi8@gmail.com,siddhartha.Sehgal94@gmail.com"
    },
    {
        district_id: 363,
        district_name: "Pune",
        min_age_limit: 18,
        receivers: "pandey.avi8@gmail.com,shwetavalunj@gmail.com"
    },
    {
        district_id: 624,
        district_name: "Prayagraj",
        min_age_limit: 18,
        receivers: "pandey.avi8@gmail.com"
    },
    {
        district_id: 697,
        district_name: "Dehradun",
        min_age_limit: 18,
        receivers: "pandey.avi8@gmail.com,yatharthdeoly@gmail.com"
    },
    {
        district_id: 179,
        district_name: "Anand (Gujarat)",
        min_age_limit: 18,
        receivers: "pandey.avi8@gmail.com,kinjalparmar1992@gmail.com"
    },
]

const whereTo = {
    getStates: `${BASE_URL}/v2/admin/location/states`,
    getDistricts: (state_id) => `${BASE_URL}/v2/admin/location/districts/${state_id}`,
    getCalendarSlots: (district_id, date) => `${BASE_URL}/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${date}`,
}

const configs = {
    whatTo,
    whereTo,
    checkNewJobsInterval,
    pollingCronInterval
}

module.exports = configs