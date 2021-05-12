const http = require('http')
const SchedulerManager = require('./src/cron-scheduler/SchedulerManager')
const JobsHandler = require('./src/cron-scheduler/JobsHandler')


const server = http.createServer((req, res) => {
  console.log('request received, url is ', req.url)
  if (req.url === '/errors') {
    const errorResponses = JobsHandler.getErrorResponses()
    res.writeHead(200)
    res.write(`The node cron is running with following errors: \n ${JSON.stringify(errorResponses)}`)
    res.end()
  } else if (req.url === '/responses') {
    const jobResponses = JobsHandler.getJobResponses()
    res.writeHead(200)
    res.write(`The node cron is running with following jobs responses: \n ${JSON.stringify(jobResponses)}`)
    res.end()
  } else {
    const runningTasks = JobsHandler.getRunningTasks()
    res.writeHead(200)
    res.write(`The node cron is running with following jobs running: \n ${JSON.stringify(runningTasks)}`)
    res.end()
  }
})


const port = process.env.port || 8080
server.listen(port, () => {
  SchedulerManager.initialize()
  console.log('[server.js] cron-scheduler server started')
})
