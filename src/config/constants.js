const BASE_URL = 'https://cdn-api.co-vin.in/api'

const checkNewJobsInterval = '* * * * * *'

const pollingCronInterval = '*/60 7-15 * * *'

const whatTo = [
    {
        district_id: 646,
        district_name: "Ayodhya",
        min_age_limit: 18,
        receivers: "pandey.avi8@gmail.com,vidit8794@gmail.com,vinodpandey8794@gmail.com"
    },
    {
        district_id: 646,
        district_name: "Ayodhya",
        min_age_limit: 45,
        receivers: "pandey.avi8@gmail.com,vidit8794@gmail.com,vinodpandey8794@gmail.com"
    },
    // {
    //     district_id: 676,
    //     district_name: "Meerut",
    //     min_age_limit: 18
    // }
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