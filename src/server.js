'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const compression = require('compression')
const mongoose = require('mongoose')

const { getConnectionString, getConnectionOptions } = require('./db')

const {
  requestMiddleware,
  loggerMiddleware,
  errorMiddleware,
  corsMiddleware,
  forceHttpsMiddleware
} = require('./middleware')

const app = express()
const basePath = '/api/v2'
const PORT = process.env.PORT || 3001

// middleware
app.use(forceHttpsMiddleware(process.env.NODE_ENV === 'production'))
app.use(loggerMiddleware())
app.use(requestMiddleware())
app.use(compression())
app.use(corsMiddleware())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/client/build/')))

// mount router
app.use(`${basePath}`, require('./router'))

// catch-all error handler
app.use(errorMiddleware())

// connect to db and startup
mongoose.connect(getConnectionString(), getConnectionOptions())
  .then(() => {
    console.log(`Connected to ${getConnectionString()}`)
    app.listen(PORT, () => console.log('Server listening on port:', PORT))
  })
  .catch((err) => {
    console.log(err.message)
    process.exit(1)
  })
