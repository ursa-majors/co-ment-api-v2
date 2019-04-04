'use strict'

require('dotenv').config()
const app = require('./server')
const mongoose = require('mongoose')
const { getConnectionString, getConnectionOptions } = require('./db')

const PORT = process.env.PORT || 3001

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
