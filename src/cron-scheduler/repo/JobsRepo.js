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
          notifnThreshold: item.notifn_threshold,
          receivers: item.receivers
        }
      })
      return res
    } catch (error) {
      console.log('[JobsRepo.getAllJobsV2] catch block error: ', error)
      return null
    }
  }

  findAJobById (id) {
    try {
      const x = configs.whatTo.find(i => `${i.district_id}_${i.min_age_limit}` === id.toString())
      return x.district_name
    } catch (error) {
      return (id || ' your selected district.')
    }
  }

  prepareAJob (district_id) {
    const dateString = `${new Date().getDate()}-${(new Date().getMonth() + 1)}-${new Date().getFullYear()}`
    return configs.whereTo.getCalendarSlots(district_id, dateString)
    // return process.env.IS_AWS ? configs.whereTo.getCalendarSlots(district_id, dateString) : configs.whereTo.getCalendarSlotsv3(district_id, dateString)
  }
}

module.exports = JobsRepo
