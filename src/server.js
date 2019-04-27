const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const {
  requestMiddleware,
  loggerMiddleware,
  errorMiddleware,
  corsMiddleware,
  forceHttpsMiddleware
} = require('./middleware')

const app = express()
const basePath = '/api/v2'

// middleware
app.use(forceHttpsMiddleware(process.env.NODE_ENV === 'production'))
app.use(loggerMiddleware())
app.use(requestMiddleware())
app.use(compression())
app.use(corsMiddleware())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// mount router
app.use(`${basePath}`, require('./router'))

// catch-all error handler
app.use(errorMiddleware())

exports = module.exports = app
