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

      function addToJobResponses (data) {
        if (jobResponses.length >= runningJobs.length) jobResponses.shift() 
        jobResponses.push(data)
      }

      function addToErrorResponses (data) { errorResponses.push(data) }

      function getTimeInIST (data) {
        try {
          return new Date(data).toLocaleString('en-in', {timeZone: 'Asia/Calcutta'})
        } catch (error) {
          return data
        }
      }

      function getJobFromRunningJobs (job) {
        if (!job || !job.id) return null
        return runningJobs.find(i => i.id === job.id)
      }

      function logJobDetails (job) {
        console.log(`[JobsHandler.jobExecution] running job ${job.id} ${job.name} with cron config ${job.cronConfig}`)
        const associatedJob = getJobFromRunningJobs(job)
        if (associatedJob && associatedJob.task) {
          const nextSchedule = getTimeInIST(associatedJob.task.nextInvocation())
          console.log(`[JobsHandler.jobExecution] ${job.id} ${job.name} will run next at ${nextSchedule}`)
          addToRunningTasks({ id: job.id, name: job.name, nextRun: (getTimeInIST(nextSchedule)) })
        }
      }

      function formatAndTriggerNotifn (data, job) {
        if (!data || data.length === 0) return
        var message = 'https://selfregistration.cowin.gov.in/ \n'
        var subject = ''
        var maxSlot = 0;
        var totalSlots = 0;
        var shouldNotify = false
        data.forEach(center => {
          try {
            const filteredSessions = []
            if (center && center.sessions && center.sessions.length) {
                center.sessions.forEach(session => {
                  if ((session.available_capacity > 0) && (session.min_age_limit === job.ageLimit)) {
                    totalSlots+=session.available_capacity
                    if (session.available_capacity > maxSlot) maxSlot = session.available_capacity
                    filteredSessions.push(session)
                  }
                })
            }
            if (filteredSessions.length) {
              shouldNotify=true
              subject = `Maximum: ${maxSlot}, Total: ${totalSlots}. Vaccine centre at: ${job.name} for age ${job.ageLimit} has availability.`
                // subject = 'Maximum: ' + maxSlot + '. Vaccine centre at: ' + job.name + ' for age ' + job.ageLimit + ' has availability.' 
              let formattedData = ''
              formattedData+='name: ' + job.name + '.\n'
              formattedData+='age: ' + job.ageLimit + '.\n'
              formattedData+='details: ' + center.name + ' at ' + center.address + '.\n'
              formattedData+='sessions: ' + (filteredSessions.map(sesh => `${sesh.date} (avaiable slots = ${sesh.available_capacity})`)).join(', ') + '.\n\n'
              message+=formattedData
            }
          } catch (error) {
           console.log(`[JobsHandler.formatAndTriggerNotifn] job ${job.id} ${job.name} faced some error while formatting response data, error: `, error) 
          }
      })
      const jobLog = `${job.id} ${job.name} ran at ${getTimeInIST(new Date())}, total slots: ${totalSlots}, max slot: ${maxSlot}.`
      console.log(jobLog)
      addToJobResponses(jobLog)

      try {
        const notifnThreshold = job.notifnThreshold || 4
        if (shouldNotify && (totalSlots > notifnThreshold)) {
          console.log(`[JobsHandler.formatAndTriggerNotifn] ${job.id} ${job.name} , sending ${subject} mail to ${job.receivers}.`)
          NotificationHandler.sendMail(
            job.receivers,
            subject,
            message
          )
        }
      } catch (error) {
        console.log(`[JobsHandler.formatAndTriggerNotifn] job finished ${job.id} ${job.name}, error while sending mail `, error)
      }
    }

    function getJobAPI (job) {
      try {
        const stringId = job.id.toString()
        const id = stringId.split('_')[0]
        return repo.prepareAJob(id)
      } catch (error) {
        return job.api
      }
    }

      async function jobExecution (job) {
        try {
            logJobDetails(job)
            // call API from here
            const res = await axios.get(
              getJobAPI(job), {
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
          console.log(`[JobsHandler.registerCronJob] register job done for ${job.id} ${job.name} with next run at: ${getTimeInIST(task.nextInvocation())}`)
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