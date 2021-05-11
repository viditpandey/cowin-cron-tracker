const schedule = require('node-schedule')
const JobsHandler = require('./JobsHandler')
const constants = require('../config/constants')

const SchedulerManager = {
    initialize: function () {
      try {
        console.log('[SchedulerManager.initialize] starting')
        schedule.scheduleJob(constants.checkNewJobsInterval, function () { JobsHandler.checkAndRegisterNewJobs() })
      } catch (error) {
        console.log(`[SchedulerManager.initialize]  error while initiazlie: ${JSON.stringify(error)}`)
        throw error
      }
    }
  }
  
module.exports = SchedulerManager