const cronValidator = require('cron-validator')
const schedule = require('node-schedule')
const JobsRepo = require('./repo/JobsRepo')
const axios = require('axios')
const NotificationHandler = require('../notifications/notificationHandler')


const JobsHandler = (function () {

    const repo = new JobsRepo()
    NotificationHandler.init();
    var runningJobs = []
    var jobResponses = []
    var errorResponses = []

    function verifyJob (job) {
        if (!job || !job.cronConfig) return false
        else if (!cronValidator.isValidCron(job.cronConfig) && !isValidDate(job.cronConfig)) return false
        return true
      }

      function addToRunningJobs (task) { runningJobs.push(task) }

      function addToJobResponses (task) { jobResponses.push(task) }

      function addToErrorResponses (task) { errorResponses.push(task) }

      function getJobFromRunningJobs (job) {
        if (!job || !job.id) return null
        return runningJobs.find(i => i.topologyId === job.topologyId)
      }

      function logJobDetails (job) {
        console.log(`[JobsHandler.jobExecution] running job ${job.id} ${job.name} with cron config ${job.cronConfig}`)
        const associatedJob = getJobFromRunningJobs(job)
        if (associatedJob && associatedJob.task) console.log(`[JobsHandler.jobExecution] ${job.id} ${job.name} will run next at ${associatedJob.task.nextInvocation()}`)
      }

      function formatAndTriggerNotifn (data, job) {
        if (!data || data.length === 0) return
        data.forEach(center => {
          const filteredSessions = []
          if (center && center.sessions && center.sessions.length) {
              center.sessions.forEach(session => {
                  if ((session.available_capacity > 0) && (session.min_age_limit === job.ageLimit)) {
                      filteredSessions.push(session)
                  }
              })
          }
          if (filteredSessions.length) {
            const formattedData = {
              name: job.name,
              available: filteredSessions.length,
              data: `${center.name} at ${center.address}`,
              sessions: (filteredSessions.map(sesh => sesh.date)).join(', ')
            }
            addToJobResponses(formattedData)
          }
      })

      console.log(`[JobsHandler.formatAndTriggerNotifn] job finished ${job.id} ${job.name}, sending mail.`)
      try {
        NotificationHandler.sendMail(
          job.receivers,
          runningJobs
        ) 
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
          console.log(`[JobsHandler.registerCronJob]${job.id} ${job.name} will run next at ${task.nextInvocation()}`)
          addToRunningJobs({ id: job.id, status: task.status, cronConfig: job.cronConfig, task: task })
        } else {
          console.log(`[JobsHandler.registerCronJob] job ${job && job.id} is invalid`)
        }
      }

    return {
        getRunningJobs: () => runningJobs,
        getJobResponses: () => jobResponses,
        getErrorResponses: () => errorResponses,
        checkAndRegisterNewJobs: function () {
            if (runningJobs && runningJobs.length > 0) return
            console.log('[JobsHandler.checkAndRegisterNewJobs] get all jobs at Jobs Handler level, these will be configured')
            const jobs = repo.getAllJobs()
            console.log(jobs)

            const unregisteredJobs = []
            // const changedJobs = []
            const expiredJobs = []
            
            jobs.forEach(job => {
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