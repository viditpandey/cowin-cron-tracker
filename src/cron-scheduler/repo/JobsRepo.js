const configs = require('../../config/constants')

class JobsRepo {
  constructor () {}

  getAllJobs () {
    try {
      const res = configs.whatTo.map(item => {
        return {
          id: item.district_id,
          name: item.district_name || '',
          cronConfig: process.env.POLLING_CRON_MINUTE.toString() === 'true' ? '* * * * *' : configs.pollingCronInterval,
          toRun: item.toRun || true,
          api: this.prepareAJob(item.district_id),
          ageLimit: item.min_age_limit,
          receivers: item.receivers
        }
      })
      return res
    } catch (error) {
      console.log('[JobsRepo.getAllJobsV2] catch block error: ', error)
      return null
    }
  }

  prepareAJob (district_id) {
    const dateString = `${new Date().getDate()}-${(new Date().getMonth() + 1)}-${new Date().getFullYear()}`
    return configs.whereTo.getCalendarSlots(district_id, dateString)
  }
}

module.exports = JobsRepo
