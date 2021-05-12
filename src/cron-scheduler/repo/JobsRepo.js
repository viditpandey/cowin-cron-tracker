const configs = require('../../config/constants')

class JobsRepo {
  constructor () {}

  getAllJobs () {
    const rule = configs.pollingCronInterval
    try {
      const res = configs.whatTo.map(item => {
        return {
          id: `${item.district_id}_${item.min_age_limit}`,
          name: item.district_name || '',
          cronConfig: rule,
          toRun: item.toRun || true,
          api: this.prepareAJob(item.district_id),
          ageLimit: item.min_age_limit,
          notifnThreshold: notifn_threshold,
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
