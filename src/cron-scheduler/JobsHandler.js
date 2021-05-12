const cronValidator = require('cron-validator')
const schedule = require('node-schedule')
const JobsRepo = require('./repo/JobsRepo')
const axios = require('axios')
const NotificationHandler = require('../notifications/notificationHandler')


const JobsHandler = (function () {

    const repo = new JobsRepo()
    NotificationHandler.init();
    var runningJobs = []
    var runningTasks = []
    var jobResponses = []
    var errorResponses = []

    function verifyJob (job) {
        if (!job || !job.cronConfig) return false
        else if (!cronValidator.isValidCron(job.cronConfig) && !isValidDate(job.cronConfig)) return false
        return true
      }

      function addToRunningJobs (data) { runningJobs.push(data) }

      function addToRunningTasks (data) {
        runningTasks = runningTasks.filter(job => job.id !== data.id)
        runningTasks.push(data)
      }

      function addToJobResponses (data) { jobResponses.push(data) }

      function addToErrorResponses (data) { errorResponses.push(data) }

      function getNextInvocation (data) {
        try {
          return new Date(data).toLocaleString('en-in', {timeZoneOffset: -330})
        } catch (error) {
          return data
        }
      }

      function getJobFromRunningJobs (job) {
        if (!job || !job.id) return null
        return runningJobs.find(i => i.topologyId === job.topologyId)
      }

      function logJobDetails (job) {
        console.log(`[JobsHandler.jobExecution] running job ${job.id} ${job.name} with cron config ${job.cronConfig}`)
        const associatedJob = getJobFromRunningJobs(job)
        if (associatedJob && associatedJob.task) {
          console.log(`[JobsHandler.jobExecution] ${job.id} ${job.name} will run next at ${getNextInvocation(associatedJob.task.nextInvocation())}`)
          addToRunningTasks({ id: job.id, name: job.name, cronConfig: job.cronConfig, nextRun: (associatedJob.task && associatedJob.task.nextInvocation && getNextInvocation(associatedJob.task.nextInvocation())) })
        }
      }

      function formatAndTriggerNotifn (data, job) {
        if (!data || data.length === 0) return
        var message = 'https://selfregistration.cowin.gov.in/ \n'
        var subject = ''
        var maxSlot = 0;
        var shouldNotify = false
        data.forEach(center => {
          const filteredSessions = []
          if (center && center.sessions && center.sessions.length) {
              center.sessions.forEach(session => {
                  if ((session.available_capacity > 9) && (session.min_age_limit === job.ageLimit)) {
                    if (session.available_capacity > maxSlot) maxSlot = session.available_capacity
                    filteredSessions.push(session)
                  }
              })
          }
          if (filteredSessions.length) {
            shouldNotify=true
            subject = 'Maximum: ' + maxSlot + '. Vaccine centre at: ' + job.name + ' for age ' + job.ageLimit + ' has availability.'
            let formattedData = ''
            formattedData+='name: ' + job.name + '.\n'
            formattedData+='age: ' + job.ageLimit + '.\n'
            formattedData+='details: ' + center.name + ' at ' + center.address + '.\n'
            formattedData+='sessions: ' + (filteredSessions.map(sesh => `${sesh.date} (avaiable slots = ${sesh.available_capacity})`)).join(', ') + '.\n\n'
            message+=formattedData
            addToJobResponses(formattedData)
          }
      })

      try {
        if (shouldNotify) {
          console.log(`[JobsHandler.formatAndTriggerNotifn] job finished ${job.id} ${job.name} , sending mail to ${job.receivers}.`)
          NotificationHandler.sendMail(
            job.receivers,
            subject,
            message
          )
        } else {
          console.log(`[JobsHandler.formatAndTriggerNotifn] job finished ${job.id} ${job.name} , no centres found.`)
        }
      } catch (error) {
        console.log(`[JobsHandler.formatAndTriggerNotifn] job finished ${job.id} ${job.name}, error while sending mail `, error)
      }
    }

      async function jobExecution (job) {
        try {
            logJobDetails(job)
            // call API from here
            const res = await axios.get(
                job.api, {
                    headers: {
                        "Accept": '*/*',
                        "User-Agent": 'Mozilla/5.0 (Macintosh Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
                    }
                }).catch(error => {
                console.log('[JobsHandler.jobExecution] catch block error while api call, error: ', error, error.statusCode, error.statusMessage)
                addToErrorResponses(error)
            })

            formatAndTriggerNotifn (res.data.centers, job)

        } catch (error) {
          return false
        }
      }

      function registerCronJob (job) {
        const isJobValid = verifyJob(job)
        if (isJobValid) {
          const cronSchedule = !cronValidator.isValidCron(job.cronConfig) ? new Date(job.cronConfig) : job.cronConfig
          console.log(`[JobsHandler.registerCronJob] register job attempted for ${job.id} ${job.name} with cronSchedule: ${cronSchedule}`)
          const task = schedule.scheduleJob(cronSchedule, () => jobExecution(job))
          console.log(`[JobsHandler.registerCronJob] register job done for ${job.id} ${job.name} with next run at: ${getNextInvocation(task.nextInvocation())}`)
          addToRunningJobs({ id: job.id, name: job.name, cronConfig: job.cronConfig, task: task })
        } else {
          console.log(`[JobsHandler.registerCronJob] job ${job && job.id} is invalid`)
        }
      }

    return {
        getRunningTasks: () => runningTasks,
        getJobResponses: () => jobResponses,
        getErrorResponses: () => errorResponses,
        checkAndRegisterNewJobs: function () {
            if (runningJobs && runningJobs.length > 0) return
            console.log('[JobsHandler.checkAndRegisterNewJobs] get all jobs at Jobs Handler level, these will be configured')
            const jobs = repo.getAllJobs()

            const unregisteredJobs = []
            // const changedJobs = []
            const expiredJobs = []
            
            jobs && jobs.forEach(job => {
                const isJobAreadyInRunning = getJobFromRunningJobs(job)
                if (!cronValidator.isValidCron(job.cronConfig) && new Date() > new Date(job.cronConfig)) expiredJobs.push(job)
                else if (!isJobAreadyInRunning) unregisteredJobs.push(job)
                // else if (isJobAreadyInRunning.cronConfig !== job.cronConfig) changedJobs.push(job)
            })
            unregisteredJobs.forEach(job => { registerCronJob(job) })
            // changedJobs.forEach(job => { rescheduleCronJob(job) })
        }
    }
})()

module.exports = JobsHandler