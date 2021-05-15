const express = require('express')
const SchedulerManager = require('./src/cron-scheduler/SchedulerManager')
const NotificationHandler = require('./src/notifications/notificationHandler')
const JobsHandler = require('./src/cron-scheduler/JobsHandler')
const ServerUtils = require('./src/utils/serverUtils')
// const webpush = require('web-push');

const DEFAULT_PORT = 8080

const app = express()

app.use(require('body-parser').json())

app.get('/vapidpubKey', (req, res) => {
  res.status(200).json({ data: process.env.VAPID_PUBLIC_KEY })
})

app.post('/subscribe', (req, res) => {
  const { id: jobId } = req.query;
  const subscription = req.body;
  res.status(201).json({});
  
  const payload = JSON.stringify({ title: 'test', body: 'from backend' });

  NotificationHandler.registerForPushNotifns(jobId, subscription)

  // webpush.sendNotification(subscription, payload).catch(error => {
  //   console.error('[server.handleRequests] error while sending push notifications', error.stack);
  // });
})

app.get('/errors', (req, res) => {
  const errorResponses = JobsHandler.getErrorResponses()
  res.writeHead(200)
  res.write(`The node cron is running with following errors: \n ${JSON.stringify(errorResponses)}`)
  res.end()
})

app.get('/responses', (req, res) => {
  const jobResponses = JobsHandler.getJobResponses()
  res.writeHead(200)
  res.write(`The node cron is running with following jobs responses: \n ${JSON.stringify(jobResponses)}`)
  res.end()
})

app.get('/tasks', (req, res) => {
  const runningTasks = JobsHandler.getRunningTasks()
  res.writeHead(200)
  res.write(`The node cron is running with following jobs: \n ${JSON.stringify(runningTasks)}`)
  res.end()
})

app.use(require('express-static')('./'))

// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist/index.html'))
// })

app.listen(process.env.PORT || DEFAULT_PORT, function () {
  SchedulerManager.initialize()
  ServerUtils.registerWebPush()
  console.log('[server.js] cron-scheduler server started at:', process.env.PORT || DEFAULT_PORT)
})


// const http = require('http')
// const SchedulerManager = require('./src/cron-scheduler/SchedulerManager')
// const JobsHandler = require('./src/cron-scheduler/JobsHandler')
// const ServerUtils = require('./src/utils/serverUtils')
// const webpush = require('web-push');

// const app = express();

// const server = http.createServer((req, res) => {
//   console.log('request received, url is ', req.url)
//   if (req.url === '/errors') {
//     const errorResponses = JobsHandler.getErrorResponses()
//     res.writeHead(200)
//     res.write(`The node cron is running with following errors: \n ${JSON.stringify(errorResponses)}`)
//     res.end()
//   } else if (req.url === '/responses') {
//     const jobResponses = JobsHandler.getJobResponses()
//     res.writeHead(200)
//     res.write(`The node cron is running with following jobs responses: \n ${JSON.stringify(jobResponses)}`)
//     res.end()
//   } else if ( req.url === '/subscribe' && req.method == 'POST') {
//     const subscription = req.body;
//     res.status(201).json({});
//     const payload = JSON.stringify({ title: 'test' });

//     console.log(subscription);

//     webpush.sendNotification(subscription, payload).catch(error => {
//       console.error('[server.handleRequests] error while sending push notifications', error.stack);
//     });
//   } else {
//     const runningTasks = JobsHandler.getRunningTasks()
//     res.writeHead(200)
//     res.write(`The node cron is running with following jobs running: \n ${JSON.stringify(runningTasks)}`)
//     res.end()
//   }
// })


// const port = process.env.port || 8080
// server.listen(port, () => {
//   SchedulerManager.initialize()
//   ServerUtils.registerWebPush()
//   console.log('[server.js] cron-scheduler server started')
// })
