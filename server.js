const axios = require('axios')
const http = require('http')
const SchedulerManager = require('./src/cron-scheduler/SchedulerManager')
const JobsHandler = require('./src/cron-scheduler/JobsHandler')
const configs = require('./src/config/constants')


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
  } else if (req.url.search('/getJob') !== -1) {
    const query = req.url.split('/getJob?')[1]
    axios.get(
      configs.whereTo.getCalendarSlotsV2(query), {
        headers: {
          "Accept": '*/*',
          "User-Agent": 'Mozilla/5.0 (Macintosh Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
        }
      })
      .then(response => {
        console.log(typeof response)
        res.writeHead(200)
        res.write(JSON.stringify(response.data))
        res.end()
      })
      .catch(error => {
        console.log('[JobsHandler.jobExecution] catch block error while api call, error: ', error, error.statusCode, error.statusMessage)
        addToErrorResponses(error)
        res.writeHead(502)
        res.write(JSON.stringify(error))
        res.end()
      })

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
