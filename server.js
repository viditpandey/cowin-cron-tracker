const cronValidator = require('cron-validator')
const http = require('http')
const SchedulerManager = require('./src/cron-scheduler/SchedulerManager')
const JobsHandler = require('./src/cron-scheduler/JobsHandler')
const configs = require('./src/config/constants')


const server = http.createServer((req, res) => {
  console.log('server is running', cronValidator.isValidCron(configs.pollingCronInterval))
  const runningJobs = JobsHandler.getRunningJobs()
  const jobResponses = JobsHandler.getJobResponses()
  const errorResponses = JobsHandler.getErrorResponses()
  res.writeHead(200)
  // res.write(`The node cron is running with following jobs running ${JSON.stringify(runningJobs)} \n ${JSON.stringify(jobResponses)} \n ${JSON.stringify(errorResponses)}`)
  res.write(`The node cron is running with following jobs running \n ${JSON.stringify(jobResponses)} \n ${JSON.stringify(errorResponses)}`)
  // res.write(`The node cron is running with following jobs running ${runningJobs} \n ${jobResponses} \n ${errorResponses}`)
  res.end()
})

server.listen(3000, () => {
  SchedulerManager.initialize()
  console.log('[server.js] cron-scheduler server started')
})
